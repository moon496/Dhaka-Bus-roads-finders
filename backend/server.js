import { createServer } from "node:http";
import { readFile, writeFile, appendFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../dataset");
const routesPath = path.join(dataDir, "bus_routes.json");
const sourcePath = path.join(dataDir, "dhaka-city-local-bus.json");
const aliasesPath = path.join(dataDir, "stop_aliases.json");
const aliasSuggestionsPath = path.join(dataDir, "stop_alias_suggestions.json");
const reportsPath = path.join(here, "data/reports.json");
const auditPath = path.join(here, "data/admin-audit.ndjson");
const port = Number(process.env.PORT || 3001);
const allowedOrigin = process.env.CORS_ORIGIN || "*";
const MAX_BODY_BYTES = 16_384;
const MAX_REPORTS_PER_HOUR = 5;
const SESSION_MS = 30 * 60 * 1000;
let routes = JSON.parse(await readFile(routesPath, "utf8"));
let aliases = await readJson(aliasesPath, []);
let aliasSuggestions = await readJson(aliasSuggestionsPath, []);
let reports = await readJson(reportsPath, []);
const sessions = new Map();
const reportWindow = new Map();
const adminScryptSalt = process.env.ADMIN_PASSWORD ? randomBytes(16) : null;
const adminPasswordHash = adminScryptSalt ? scryptSync(process.env.ADMIN_PASSWORD, adminScryptSalt, 64) : null;

async function readJson(file, fallback) {
  try { return JSON.parse((await readFile(file, "utf8")).replace(/^\uFEFF/, "")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}

const normalize = (value = "") => String(value).normalize("NFKC").trim().toLocaleLowerCase()
  .replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/g, " ").trim();

function canonical(value) {
  let key = normalize(value);
  const seen = new Set();
  while (key && !seen.has(key)) {
    seen.add(key);
    const alias = aliases.find((item) => normalize(item.alias) === key);
    if (!alias) break;
    key = normalize(alias.canonical);
  }
  return key;
}

function publicRoutes() { return routes.filter((route) => !route.status || route.status === "Approved"); }
function uniqueStops(routeSet = publicRoutes()) {
  const names = new Map();
  for (const route of routeSet) for (const stop of route.stops || []) {
    const key = canonical(stop);
    if (key && !names.has(key)) names.set(key, stop);
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

function makeIndex(routeSet = publicRoutes()) {
  const services = new Map();
  const names = new Map();
  const byStop = new Map();
  for (const route of routeSet) {
    const stops = (route.stops || []).map(canonical).filter(Boolean);
    services.set(route.id, { route, stops, stopSet: new Set(stops) });
    for (const stop of new Set(stops)) {
      if (!names.has(stop)) names.set(stop, route.stops[stops.indexOf(stop)]);
      if (!byStop.has(stop)) byStop.set(stop, []);
      byStop.get(stop).push(services.get(route.id));
    }
  }
  return { services, names, byStop };
}

function levenshtein(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i]; let min = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      min = Math.min(min, row[j]);
    }
    if (min > max) return max + 1;
    previous = row;
  }
  return previous[b.length];
}

function suggestStops(query, routeSet = publicRoutes()) {
  const { names } = makeIndex(routeSet);
  const values = [...names.entries()];
  const key = canonical(query);
  if (!key) return uniqueStops(routeSet).slice(0, 20);
  const ranked = values.map(([stopKey, name]) => ({ name, distance: stopKey === key ? 0 : stopKey.startsWith(key) ? 0 : stopKey.includes(key) ? 1 : levenshtein(key, stopKey) }))
    .filter((item) => item.distance <= 2)
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name));
  return ranked.slice(0, 10).map((item) => item.name);
}

function findSegment(service, fromKey, toKey) {
  if (!service || !fromKey || !toKey) return null;
  const { route, stops } = service;
  const candidates = [];
  const starts = []; const ends = [];
  for (let i = 0; i < stops.length; i++) { if (stops[i] === fromKey) starts.push(i); if (stops[i] === toKey) ends.push(i); }
  for (const i of starts) {
    for (const j of ends) {
      const sequence = i <= j ? route.stops.slice(i, j + 1) : route.stops.slice(j, i + 1).reverse();
      const direction = i === j ? "Same stop" : i < j ? "Listed order" : "Reverse inferred";
      candidates.push({ from: sequence[0], to: sequence.at(-1), stops: sequence, stopsTravelled: sequence.length - 1, direction });
    }
  }
  candidates.sort((a, b) => a.stopsTravelled - b.stopsTravelled);
  return candidates[0] || null;
}

function journey(services, stopKeys) {
  const legs = [];
  for (let i = 0; i < services.length; i++) {
    const segment = findSegment(services[i], stopKeys[i], stopKeys[i + 1]);
    if (!segment) return null;
    const { route } = services[i];
    legs.push({ serviceId: route.id, name: route.name, nameBn: route.nameBn || "", serviceType: route.type || "", operatingHours: route.serviceTime || "", boardAt: segment.from, alightAt: segment.to, stops: segment.stops, stopsTravelled: segment.stopsTravelled, direction: segment.direction });
  }
  return { transfers: legs.length - 1, stopsTravelled: legs.reduce((sum, leg) => sum + leg.stopsTravelled, 0), legs, transferStops: legs.slice(0, -1).map((leg) => leg.alightAt) };
}

function findJourneys(from, to, routeSet = publicRoutes(), limit = 10) {
  const fromKey = canonical(from); const toKey = canonical(to);
  if (!fromKey || !toKey) return { success: false, error: "Enter both an origin and a destination.", code: "MISSING_STOP", suggestions: [], data: [] };
  if (fromKey === toKey) return { success: false, error: "Origin and destination must be different stops.", code: "SAME_STOP", suggestions: [], data: [] };
  const { services, byStop } = makeIndex(routeSet);
  const originServices = [...services.values()].filter((service) => service.stopSet.has(fromKey));
  const destinationServices = [...services.values()].filter((service) => service.stopSet.has(toKey));
  const buildLayer = (transferCount) => {
    const found = new Map();
    const add = (routeSequence, stopSequence) => {
      if (new Set(routeSequence.map((service) => service.route.id)).size !== routeSequence.length) return;
      const result = journey(routeSequence, stopSequence);
      if (!result) return;
      const key = routeSequence.map((service) => service.route.id).join(",");
      if (!found.has(key) || result.stopsTravelled < found.get(key).stopsTravelled) found.set(key, result);
    };

    if (transferCount === 0) {
      for (const service of originServices) if (service.stopSet.has(toKey)) add([service], [fromKey, toKey]);
    } else if (transferCount === 1) {
      for (const first of originServices) for (const stop of first.stopSet) {
        if (stop === fromKey || stop === toKey) continue;
        for (const last of byStop.get(stop) || []) if (last.route.id !== first.route.id && last.stopSet.has(toKey)) add([first, last], [fromKey, stop, toKey]);
      }
    } else {
      for (const first of originServices) for (const firstTransfer of first.stopSet) {
        if (firstTransfer === fromKey || firstTransfer === toKey) continue;
        for (const middle of byStop.get(firstTransfer) || []) {
          if (middle.route.id === first.route.id) continue;
          for (const secondTransfer of middle.stopSet) {
            if (secondTransfer === firstTransfer || secondTransfer === fromKey || secondTransfer === toKey) continue;
            for (const last of byStop.get(secondTransfer) || []) {
              if (!last.stopSet.has(toKey) || last.route.id === first.route.id || last.route.id === middle.route.id) continue;
              add([first, middle, last], [fromKey, firstTransfer, secondTransfer, toKey]);
            }
          }
        }
      }
    }
    return [...found.values()].sort((a, b) => a.stopsTravelled - b.stopsTravelled).slice(0, limit);
  };

  for (let transfers = 0; transfers <= 2; transfers++) {
    const data = buildLayer(transfers);
    if (data.length) return { success: true, transferCount: transfers, count: data.length, data, suggestions: [] };
  }
  return { success: false, error: "No route found for these stops.", code: "NO_ROUTE", suggestions: [...new Set([...suggestStops(from, routeSet), ...suggestStops(to, routeSet)])].slice(0, 10), data: [] };
}

async function saveRoutes() { await writeFile(routesPath, `${JSON.stringify(routes, null, 2)}\n`, "utf8"); }
async function saveAliases() { await writeFile(aliasesPath, `${JSON.stringify(aliases, null, 2)}\n`, "utf8"); }
async function saveReports() { await mkdir(path.dirname(reportsPath), { recursive: true }); await writeFile(reportsPath, `${JSON.stringify(reports, null, 2)}\n`, "utf8"); }
async function audit(action, detail = {}) { await mkdir(path.dirname(auditPath), { recursive: true }); await appendFile(auditPath, `${JSON.stringify({ at: new Date().toISOString(), admin: process.env.ADMIN_USER || "admin", action, ...detail })}\n`, "utf8"); }

function send(res, status, body, extra = {}) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": allowedOrigin, "access-control-allow-credentials": "true", "vary": "Origin", ...extra });
  res.end(body === null ? "" : JSON.stringify(body));
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large."), { status: 413 });
  }
  try { return body ? JSON.parse(body) : {}; }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}

function getSession(req) {
  const token = (req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("dhaka_bus_session="))?.split("=")[1];
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) { if (token) sessions.delete(token); return null; }
  session.expiresAt = Date.now() + SESSION_MS;
  return session;
}

function requireAdmin(req, res) {
  if (!getSession(req)) { send(res, 401, { error: "Admin sign-in required." }); return false; }
  return true;
}

function countReport(client) {
  const now = Date.now(); const recent = (reportWindow.get(client) || []).filter((at) => now - at < 60 * 60 * 1000);
  if (recent.length >= MAX_REPORTS_PER_HOUR) return false;
  recent.push(now); reportWindow.set(client, recent); return true;
}

function fromSourceRecord(record, index) {
  const stops = Array.isArray(record.routes) ? record.routes : [];
  return { id: index + 1, name: String(record.english || `Bus ${index + 1}`), nameBn: String(record.bangle || ""), type: String(record.service_type || ""), from: stops[0] || "", to: stops.at(-1) || "", stops, color: routes[index]?.color || "#0f766e", image: String(record.image || ""), serviceTime: String(record.time || ""), status: "Approved", lastVerifiedOn: null };
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "access-control-allow-origin": allowedOrigin, "access-control-allow-credentials": "true", "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS", "access-control-allow-headers": "content-type", "vary": "Origin" });
      return res.end();
    }

    if (req.method === "GET" && pathname === "/api/health") return send(res, 200, { status: "ok", routeCount: publicRoutes().length, stopCount: uniqueStops().length });

    if (req.method === "GET" && (pathname === "/api/routes" || pathname === "/api/services")) {
      const q = canonical(url.searchParams.get("q") || ""); const type = normalize(url.searchParams.get("type") || "");
      const data = publicRoutes().filter((route) => (!q || normalize(route.name).includes(q) || normalize(route.nameBn).includes(q) || route.stops.some((stop) => canonical(stop).includes(q))) && (!type || normalize(route.type).includes(type)));
      return send(res, 200, { count: data.length, data });
    }

    if (req.method === "GET" && pathname === "/api/stops") {
      const q = url.searchParams.get("q") || ""; const data = q ? suggestStops(q) : uniqueStops();
      return send(res, 200, { count: data.length, data, suggestions: Boolean(q) });
    }

    const stopServices = pathname.match(/^\/api\/stops\/(.+)\/services$/);
    if (req.method === "GET" && stopServices) {
      const stopKey = canonical(stopServices[1]);
      const data = publicRoutes().filter((route) => route.stops.some((stop) => canonical(stop) === stopKey));
      if (!data.length) return send(res, 404, { error: "Stop was not found.", suggestions: suggestStops(stopServices[1]) });
      return send(res, 200, { stop: uniqueStops().find((stop) => canonical(stop) === stopKey), count: data.length, data });
    }

    if (req.method === "GET" && (pathname === "/api/journeys" || pathname === "/api/search")) {
      const result = findJourneys(url.searchParams.get("from") || "", url.searchParams.get("to") || "");
      const code = result.code === "MISSING_STOP" || result.code === "SAME_STOP" ? 400 : 200;
      return send(res, code, result);
    }

    if (req.method === "POST" && pathname === "/api/reports") {
      const body = await readBody(req); const description = String(body.description || "").trim();
      if (!body.reportType || !["wrong stop order", "missing stop", "missing service", "closed/changed service", "other"].includes(String(body.reportType).toLocaleLowerCase())) return send(res, 400, { error: "Choose a valid report type." });
      if (description.length < 10 || description.length > 1000) return send(res, 400, { error: "Description must be 10 to 1000 characters." });
      const client = process.env.TRUST_PROXY === "true" ? (req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown") : (req.socket.remoteAddress || "unknown");
      if (!countReport(client)) return send(res, 429, { error: "Report limit reached. Try again later." });
      const report = { id: randomBytes(12).toString("hex"), reportType: String(body.reportType), serviceId: body.serviceId ? Number(body.serviceId) : null, stopName: String(body.stopName || ""), description, contact: String(body.contact || ""), status: "Pending", createdAt: new Date().toISOString(), reviewedBy: null, decisionNote: "" };
      reports.push(report); await saveReports();
      return send(res, 201, { message: "Report received for administrator review.", id: report.id, status: report.status });
    }

    if (pathname.startsWith("/api/admin")) {
      if (!process.env.ADMIN_PASSWORD && pathname !== "/api/admin/login") return send(res, 503, { error: "Set ADMIN_PASSWORD before using admin features." });
      if (req.method === "POST" && pathname === "/api/admin/login") {
        if (!adminPasswordHash) return send(res, 503, { error: "Set ADMIN_PASSWORD before signing in." });
        const body = await readBody(req); const supplied = String(body.password || "");
        const suppliedHash = scryptSync(supplied, adminScryptSalt, 64);
        const userAllowed = !process.env.ADMIN_USER || String(body.username || "") === process.env.ADMIN_USER;
        if (!userAllowed || suppliedHash.length !== adminPasswordHash.length || !timingSafeEqual(suppliedHash, adminPasswordHash)) return send(res, 401, { error: "Invalid admin credentials." });
        const token = randomBytes(32).toString("hex"); sessions.set(token, { expiresAt: Date.now() + SESSION_MS });
        const secure = process.env.NODE_ENV === "production" || req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
        return send(res, 200, { authenticated: true, expiresInSeconds: SESSION_MS / 1000 }, { "set-cookie": `dhaka_bus_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}` });
      }
      if (req.method === "POST" && pathname === "/api/admin/logout") {
        const session = getSession(req); if (!session) return send(res, 401, { error: "Admin sign-in required." });
        const token = (req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("dhaka_bus_session="))?.split("=")[1];
        if (token) sessions.delete(token);
        return send(res, 200, { authenticated: false }, { "set-cookie": "dhaka_bus_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
      }
      if (!requireAdmin(req, res)) return;
      if (req.method === "GET" && pathname === "/api/admin/me") return send(res, 200, { authenticated: true, username: process.env.ADMIN_USER || "admin" });
      if (req.method === "GET" && pathname === "/api/admin/reports") return send(res, 200, { count: reports.length, data: reports });
      const reportMatch = pathname.match(/^\/api\/admin\/reports\/([^/]+)$/);
      if (req.method === "PATCH" && reportMatch) {
        const report = reports.find((item) => item.id === reportMatch[1]); if (!report) return send(res, 404, { error: "Report not found." });
        const body = await readBody(req); const statuses = ["Pending", "Under Review", "Approved/Applied", "Rejected", "Resolved"];
        if (!statuses.includes(body.status)) return send(res, 400, { error: "Invalid report status." });
        report.status = body.status; report.decisionNote = String(body.decisionNote || "").slice(0, 1000); report.reviewedBy = process.env.ADMIN_USER || "admin";
        await saveReports(); await audit("report-status", { reportId: report.id, status: report.status }); return send(res, 200, report);
      }
      if (req.method === "GET" && pathname === "/api/admin/services") return send(res, 200, { count: routes.length, data: routes });
      const serviceMatch = pathname.match(/^\/api\/admin\/services\/(\d+)$/);
      if (req.method === "POST" && pathname === "/api/admin/services") {
        const body = await readBody(req); const name = String(body.name || "").trim(); const stops = Array.isArray(body.stops) ? body.stops.map((s) => String(s).trim()).filter(Boolean) : [];
        if (!name || stops.length < 2) return send(res, 400, { error: "A service needs a name and at least two stops." });
        const id = Math.max(0, ...routes.map((route) => Number(route.id))) + 1;
        const route = { id, name, nameBn: String(body.nameBn || ""), type: String(body.type || ""), from: stops[0], to: stops.at(-1), stops, color: "#0f766e", image: "", serviceTime: String(body.serviceTime || ""), status: "Draft", lastVerifiedOn: null, lastModifiedAt: new Date().toISOString() };
        routes.push(route); await saveRoutes(); await audit("service-create", { serviceId: id }); return send(res, 201, route);
      }
      if (serviceMatch && (req.method === "PATCH" || req.method === "DELETE")) {
        const id = Number(serviceMatch[1]); const index = routes.findIndex((route) => route.id === id); if (index < 0) return send(res, 404, { error: "Service not found." });
        if (req.method === "DELETE") { routes.splice(index, 1); await saveRoutes(); await audit("service-delete", { serviceId: id }); return send(res, 200, { deleted: id }); }
        const body = await readBody(req); const current = routes[index];
        const next = { ...current };
        for (const key of ["name", "nameBn", "type", "serviceTime", "image", "status"]) if (key in body) next[key] = String(body[key]).trim();
        if ("lastVerifiedOn" in body) next.lastVerifiedOn = body.lastVerifiedOn ? String(body.lastVerifiedOn) : null;
        if ("stops" in body) { if (!Array.isArray(body.stops) || body.stops.map(String).filter((s) => s.trim()).length < 2) return send(res, 400, { error: "A service needs at least two stops." }); next.stops = body.stops.map((s) => String(s).trim()).filter(Boolean); next.from = next.stops[0]; next.to = next.stops.at(-1); }
        if (!["Draft", "Approved", "Hidden"].includes(next.status)) return send(res, 400, { error: "Status must be Draft, Approved or Hidden." });
        next.lastModifiedAt = new Date().toISOString(); routes[index] = next; await saveRoutes(); await audit("service-update", { serviceId: id, fields: Object.keys(body) }); return send(res, 200, next);
      }
      if (req.method === "GET" && pathname === "/api/admin/stops") {
        const grouped = new Map();
        for (const route of routes) for (const stop of route.stops || []) { const key = canonical(stop); if (!grouped.has(key)) grouped.set(key, { canonical: stop, variants: new Set(), serviceIds: new Set() }); grouped.get(key).variants.add(stop); grouped.get(key).serviceIds.add(route.id); }
        return send(res, 200, { count: grouped.size, data: [...grouped.values()].map((item) => ({ canonical: item.canonical, variants: [...item.variants], serviceCount: item.serviceIds.size })), aliases });
      }
      const stopMatch = pathname.match(/^\/api\/admin\/stops\/(.+)$/);
      if (stopMatch && (req.method === "PATCH" || req.method === "DELETE")) {
        const stopName = stopMatch[1]; const stopKey = canonical(stopName);
        const affected = routes.filter((route) => route.stops.some((stop) => canonical(stop) === stopKey));
        if (!affected.length) return send(res, 404, { error: "Stop not found." });
        if (req.method === "PATCH") {
          const body = await readBody(req); const nextName = String(body.name || "").trim(); const nextKey = canonical(nextName);
          if (!nextName) return send(res, 400, { error: "A replacement stop name is required." });
          if (nextKey !== stopKey && uniqueStops(routes).some((stop) => canonical(stop) === nextKey)) return send(res, 409, { error: "Target stop already exists. Use the merge endpoint instead." });
          for (const route of affected) { route.stops = route.stops.map((stop) => canonical(stop) === stopKey ? nextName : stop); route.from = route.stops[0]; route.to = route.stops.at(-1); route.lastModifiedAt = new Date().toISOString(); }
          aliases = aliases.map((item) => canonical(item.canonical) === stopKey ? { ...item, canonical: nextName } : item);
          await saveRoutes(); await saveAliases(); await audit("stop-rename", { stop: stopName, name: nextName, serviceIds: affected.map((route) => route.id) });
          return send(res, 200, { renamed: stopName, to: nextName, changedServices: affected.length });
        }
        if (affected.some((route) => route.stops.filter((stop) => canonical(stop) !== stopKey).length < 2)) return send(res, 409, { error: "Cannot delete this stop because a service would have fewer than two stops." });
        for (const route of affected) { route.stops = route.stops.filter((stop) => canonical(stop) !== stopKey); route.from = route.stops[0]; route.to = route.stops.at(-1); route.lastModifiedAt = new Date().toISOString(); }
        aliases = aliases.filter((item) => canonical(item.canonical) !== stopKey);
        await saveRoutes(); await saveAliases(); await audit("stop-delete", { stop: stopName, serviceIds: affected.map((route) => route.id) });
        return send(res, 200, { deleted: stopName, changedServices: affected.length });
      }
      if (req.method === "GET" && pathname === "/api/admin/alias-suggestions") return send(res, 200, { count: aliasSuggestions.length, data: aliasSuggestions });
      const suggestionMatch = pathname.match(/^\/api\/admin\/alias-suggestions\/(\d+)\/approve$/);
      if (req.method === "POST" && suggestionMatch) {
        const suggestion = aliasSuggestions[Number(suggestionMatch[1])];
        if (!suggestion) return send(res, 404, { error: "Alias suggestion not found." });
        aliases = aliases.filter((item) => normalize(item.alias) !== normalize(suggestion.alias));
        aliases.push({ alias: suggestion.alias, canonical: suggestion.canonical, createdAt: new Date().toISOString() });
        suggestion.status = "Approved"; suggestion.reviewedAt = new Date().toISOString();
        await saveAliases(); await writeFile(aliasSuggestionsPath, `${JSON.stringify(aliasSuggestions, null, 2)}\n`, "utf8");
        await audit("alias-suggestion-approved", { alias: suggestion.alias, canonical: suggestion.canonical });
        return send(res, 200, suggestion);
      }
      if (req.method === "POST" && (pathname === "/api/admin/aliases" || pathname === "/api/admin/stops/merge")) {
        const body = await readBody(req); const alias = String(body.alias || body.source || "").trim(); const target = String(body.canonical || body.target || "").trim();
        if (!alias || !target || canonical(alias) === canonical(target)) return send(res, 400, { error: "Provide two different stop names." });
        if (!uniqueStops(routes).some((stop) => canonical(stop) === canonical(target))) return send(res, 400, { error: "Target stop does not exist." });
        aliases = aliases.filter((item) => normalize(item.alias) !== normalize(alias)); aliases.push({ alias, canonical: target, createdAt: new Date().toISOString() });
        await saveAliases(); await audit("stop-alias", { alias, canonical: target }); return send(res, 201, { alias, canonical: target });
      }
      if (req.method === "DELETE" && pathname === "/api/admin/aliases") {
        const alias = url.searchParams.get("alias") || ""; const oldCount = aliases.length; aliases = aliases.filter((item) => normalize(item.alias) !== normalize(alias));
        if (aliases.length === oldCount) return send(res, 404, { error: "Alias not found." });
        await saveAliases(); await audit("stop-alias-delete", { alias }); return send(res, 200, { deleted: alias });
      }
      if (req.method === "POST" && pathname === "/api/admin/import") {
        const source = JSON.parse(await readFile(sourcePath, "utf8"));
        if (!Array.isArray(source.data)) return send(res, 500, { error: "Source data must contain a data array." });
        const before = new Map(routes.map((route) => [route.id, JSON.stringify(route)]));
        const imported = source.data.map(fromSourceRecord);
        const changedIds = imported.filter((route) => before.get(route.id) !== JSON.stringify(route)).map((route) => route.id);
        const skipped = source.data.map((record, index) => ({ record, index })).filter(({ record }) => !record.english || !Array.isArray(record.routes) || record.routes.length < 2).map(({ index }) => index + 1);
        routes = imported.filter((route) => !skipped.includes(route.id)); await saveRoutes();
        const summary = { imported: routes.length, changedIds, unchanged: routes.length - changedIds.length, skippedIds: skipped };
        await audit("dataset-import", summary); return send(res, 200, summary);
      }
      return send(res, 404, { error: "Admin endpoint not found." });
    }

    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed." });
    return send(res, 404, { error: "Endpoint not found." });
  } catch (error) {
    console.error("API request failed:", error);
    return send(res, error.status || 500, { error: error.status ? error.message : "Internal server error." });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`Dhaka Bus API listening on http://localhost:${port}`));
