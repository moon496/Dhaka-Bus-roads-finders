import { useEffect, useMemo, useState } from "react";
import busRoutes from "../../dataset/bus_routes.json";
import { findDirectRoutes, getUniqueStops } from "./utils/routeFinder";
import AdminPanel from "./AdminPanel.jsx";
import "./App.css";

const copy = {
  en: { home: "Home", journeys: "Find routes", services: "Services", stops: "Stops", about: "About", heroTag: "YOUR DHAKA BUS GUIDE", heroLine1: "Find a bus.", heroLine2: "Find your way.", heroText: "Search local bus routes, inspect stops, and plan direct or transfer journeys across Dhaka.", find: "Find your route", plan: "PLAN YOUR JOURNEY", where: "Where are you going?", hint: "Choose origin and destination stops.", from: "FROM", to: "TO", origin: "Starting stop", destination: "Destination stop", swap: "Swap origin and destination", search: "Search routes", popular: "ROUTES TO GET STARTED", browse: "Bus services", stopBrowse: "Find services at a stop", result: "Journey options", noRoute: "No route found", noRouteHelp: "Try a suggested stop name or report a data issue.", report: "Report route information", aboutTitle: "Local routes, easier to search.", aboutText: "Find direct buses and journeys with up to two transfers. Route data is informational and may not reflect current operations.", direction: "Direction", listed: "listed stops", transfer: "transfer", transfers: "transfers", hours: "Operating hours", type: "Service type", details: "View stops", hide: "Hide stops", submit: "Submit report", language: "বাংলা", searchServices: "Search services", showAll: "Show all services", journey: "journey", journeys: "journeys", found: "found", directJourney: "Direct journey", direct: "Direct", stopsTravelled: "stops travelled", boardAt: "BOARD AT", getOffAt: "GET OFF AT", unavailable: "Not available", reverseInferred: "Reverse order inferred from listed stops", changeBus: "Change bus at", reportJourney: "Report an issue with this journey", reportMissing: "Report missing information", tryRoute: "Try a route", directory: "SERVICE DIRECTORY", directoryHint: "Search bus names, service types, or listed stops.", searchPlaceholder: "Bus, service type or stop", stopLookup: "STOP LOOKUP", stopName: "Stop name", typeStop: "Type a stop name", searchAtStop: "Search services", hideList: "Hide list", reportHint: "Reports are queued for administrator review and do not immediately change public route data.", reportType: "Report type", chooseType: "Choose a type", relatedService: "Related service (optional)", none: "None selected", relatedStop: "Related stop (optional)", description: "Description (10-1000 characters)", descriptionHint: "Tell us what needs to be corrected.", contact: "Contact (optional)", contactHint: "Only share contact details if you want a reply.", quickHint: "Quick searches use service endpoints from the dataset.", stopBrowseHint: "Find all approved services passing through a stop.", routeCaveat: "Route direction and stop spelling need local confirmation. Reverse direction is inferred from the listed stop sequence.", directFeature: "Direct routes", transferFeature: "Up to 2 transfers", languageFeature: "Bangla / English", serviceCount: "bus services", stopCount: "stops", stopsCount: "stops", aboutEyebrow: "ABOUT THIS PROJECT", reportEyebrow: "COMMUNITY DATA QUALITY", resultsCount: "journeys found", footerLine: "Find your way across Dhaka.", dataUnavailable: "Not available", searchFailed: "Could not reach the route service." },
  bn: { home: "হোম", journeys: "রুট খুঁজুন", services: "বাস সার্ভিস", stops: "স্টপ", about: "পরিচিতি", heroTag: "ঢাকার বাস গাইড", heroLine1: "বাস খুঁজুন।", heroLine2: "সহজে পথ চলুন।", heroText: "ঢাকার বাস রুট, স্টপ এবং বদলি-সহ যাত্রার তথ্য খুঁজুন।", find: "রুট খুঁজুন", plan: "যাত্রা পরিকল্পনা", where: "কোথায় যাবেন?", hint: "শুরুর ও গন্তব্য স্টপ বাছুন।", from: "শুরু", to: "গন্তব্য", origin: "শুরুর স্টপ", destination: "গন্তব্য স্টপ", swap: "শুরু ও গন্তব্য অদলবদল", search: "রুট খুঁজুন", popular: "কিছু রুট দিয়ে শুরু করুন", browse: "বাস সার্ভিস", stopBrowse: "স্টপে কোন বাস যায়", result: "যাত্রার বিকল্প", noRoute: "রুট পাওয়া যায়নি", noRouteHelp: "প্রস্তাবিত স্টপের নাম বাছুন অথবা ভুল তথ্য জানান।", report: "রুটের তথ্য জানান", aboutTitle: "ঢাকার বাস রুট খুঁজুন সহজে।", aboutText: "সরাসরি বাস ও সর্বোচ্চ দুইবার বাস বদলের যাত্রা খুঁজুন। তথ্য পরিবর্তিত হতে পারে; বর্তমান সার্ভিস নিশ্চিত করে নিন।", direction: "দিক", listed: "টি তালিকাভুক্ত স্টপ", transfer: "বার বদল", transfers: "বার বদল", hours: "চলাচলের সময়", type: "সার্ভিসের ধরন", details: "স্টপ দেখুন", hide: "লুকান", submit: "রিপোর্ট পাঠান", language: "English", searchServices: "সার্ভিস খুঁজুন", showAll: "সব সার্ভিস দেখুন", journey: "টি যাত্রা", journeys: "টি যাত্রা", found: "পাওয়া গেছে", directJourney: "সরাসরি যাত্রা", direct: "সরাসরি", stopsTravelled: "টি স্টপ অতিক্রম", boardAt: "যাত্রা শুরু", getOffAt: "নামার স্থান", unavailable: "তথ্য নেই", reverseInferred: "তালিকাভুক্ত স্টপ থেকে উল্টো দিক অনুমান করা হয়েছে", changeBus: "এখানে বাস বদলান:", reportJourney: "এই যাত্রার তথ্য জানান", reportMissing: "তথ্য না থাকলে জানান", tryRoute: "একটি রুট বেছে নিন", directory: "বাস সার্ভিস তালিকা", directoryHint: "বাসের নাম, ধরন বা স্টপ দিয়ে খুঁজুন।", searchPlaceholder: "বাস, সার্ভিসের ধরন বা স্টপ", stopLookup: "স্টপ খুঁজুন", stopName: "স্টপের নাম", typeStop: "স্টপের নাম লিখুন", searchAtStop: "সার্ভিস খুঁজুন", hideList: "তালিকা লুকান", reportHint: "রিপোর্ট প্রশাসকের পর্যালোচনার জন্য জমা হয়; তা সঙ্গে সঙ্গে রুটের তথ্য বদলায় না।", reportType: "রিপোর্টের ধরন", chooseType: "ধরন বাছুন", relatedService: "সার্ভিস (ঐচ্ছিক)", none: "নির্বাচন নেই", relatedStop: "স্টপ (ঐচ্ছিক)", description: "বিবরণ (১০-১০০০ অক্ষর)", descriptionHint: "কোন তথ্য সংশোধন করা দরকার লিখুন।", contact: "যোগাযোগ (ঐচ্ছিক)", contactHint: "উত্তর চাইলে যোগাযোগের তথ্য দিন।" },
};

function App() {
  const [language, setLanguage] = useState("en");
  const t = { ...copy.en, ...copy[language] };
  const allStops = useMemo(() => getUniqueStops(busRoutes), []);
  const [routes, setRoutes] = useState(busRoutes);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [suggestions, setSuggestions] = useState(allStops);
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [serviceQuery, setServiceQuery] = useState("");
  const [showServices, setShowServices] = useState(false);
  const [stopQuery, setStopQuery] = useState("");
  const [stopServices, setStopServices] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/routes").then((response) => response.json()).then((body) => { if (Array.isArray(body.data)) setRoutes(body.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const value = suggestionQuery;
    if (value.trim().length < 2) { setSuggestions(allStops); return undefined; }
    const timer = window.setTimeout(() => {
      fetch(`/api/stops?q=${encodeURIComponent(value)}`).then((response) => response.json()).then((body) => setSuggestions(body.data?.length ? body.data : allStops.filter((stop) => stop.toLocaleLowerCase().includes(value.toLocaleLowerCase())))).catch(() => setSuggestions(allStops.filter((stop) => stop.toLocaleLowerCase().includes(value.toLocaleLowerCase()))));
    }, 120);
    return () => window.clearTimeout(timer);
  }, [suggestionQuery, allStops]);

  async function search(nextFrom = from, nextTo = to) {
    setFrom(nextFrom); setTo(nextTo); setBusy(true); setResult(null); setNotice(""); setExpanded(null);
    try {
      const response = await fetch(`/api/journeys?from=${encodeURIComponent(nextFrom)}&to=${encodeURIComponent(nextTo)}`);
      const body = await response.json();
      setResult(body);
    } catch {
      const direct = findDirectRoutes(routes, nextFrom, nextTo);
      setResult({ ...direct, transferCount: 0, data: direct.routes.map((bus) => ({ transfers: 0, stopsTravelled: bus.totalStops - 1, transferStops: [], legs: [{ serviceId: bus.id, name: bus.name, nameBn: bus.nameBn || "", serviceType: bus.type, operatingHours: bus.serviceTime, boardAt: bus.journeyStops[0], alightAt: bus.journeyStops.at(-1), stops: bus.journeyStops, stopsTravelled: bus.totalStops - 1, direction: bus.direction }] })) });
    } finally { setBusy(false); window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }
  }

  async function browseStop(event) {
    event.preventDefault(); setStopServices(null); setNotice("");
    try {
      const response = await fetch(`/api/stops/${encodeURIComponent(stopQuery)}/services`);
      const body = await response.json();
      if (!response.ok) setNotice(body.suggestions?.length ? `${body.error} ${body.suggestions.join(", ")}` : body.error);
      else setStopServices(body);
    } catch { setNotice(t.searchFailed); }
  }

  const visibleServices = routes.filter((route) => `${route.name} ${route.nameBn} ${route.type} ${route.stops.join(" ")}`.toLocaleLowerCase().includes(serviceQuery.toLocaleLowerCase()));
  const quickRoutes = routes.filter((route) => route.stops.length > 1).slice(0, 4);
  const resultError = language === "bn" ? ({ MISSING_STOP: t.noRouteHelp, SAME_STOP: t.noRouteHelp, NO_ROUTE: t.noRoute }[result?.code] || result?.error || t.noRoute) : (result?.error || t.noRoute);

  return <div className="app" lang={language === "bn" ? "bn" : "en"}>
    <nav className="navbar" aria-label="Main navigation"><a href="#home" className="logo"><span aria-hidden="true">🚌</span><span>Dhaka<span className="logo-highlight">Bus</span></span></a><div className="nav-links"><a href="#home">{t.home}</a><a href="#search">{t.journeys}</a><a href="#services">{t.services}</a><a href="#stops">{t.stops}</a></div><button className="language-button" onClick={() => setLanguage(language === "en" ? "bn" : "en")}>{t.language}</button></nav>

    <main><section className="hero" id="home"><div className="hero-content"><span className="hero-tag">{t.heroTag}</span><h1>{t.heroLine1}<br /><span>{t.heroLine2}</span></h1><p>{t.heroText}</p><a href="#search" className="hero-button">{t.find} <span aria-hidden="true">→</span></a><div className="hero-features"><span>✓ {t.directFeature}</span><span>✓ {t.transferFeature}</span><span>✓ {t.languageFeature}</span></div></div><div className="hero-visual" aria-hidden="true"><div className="hero-circle"/><div className="hero-bus">🚌</div><div className="floating-card card-one"><span>📍</span><div><strong>{routes.length} {t.serviceCount}</strong><small>In the route directory</small></div></div><div className="floating-card card-two"><span>🛣️</span><div><strong>{allStops.length} {t.stopCount}</strong><small>Search by stop name</small></div></div></div></section>

    <section className="search-section" id="search"><div className="section-heading"><span className="eyebrow">{t.plan}</span><h2>{t.where}</h2><p>{t.hint}</p></div><form className="search-box" onSubmit={(event) => { event.preventDefault(); search(); }}><div className="location-field"><label htmlFor="from">{t.from}</label><div className="input-wrapper"><span className="location-dot green"/><input id="from" list="locations" placeholder={t.origin} value={from} onChange={(event) => { setFrom(event.target.value); setSuggestionQuery(event.target.value); }} autoComplete="off" required/></div></div><button className="swap-button" type="button" onClick={() => { setFrom(to); setTo(from); setSuggestionQuery(to); }} aria-label={t.swap} title={t.swap}>⇄</button><div className="location-field"><label htmlFor="to">{t.to}</label><div className="input-wrapper"><span className="location-dot red"/><input id="to" list="locations" placeholder={t.destination} value={to} onChange={(event) => { setTo(event.target.value); setSuggestionQuery(event.target.value); }} autoComplete="off" required/></div></div><datalist id="locations">{suggestions.map((stop) => <option key={stop} value={stop}/>)}</datalist><button className="search-button" type="submit" disabled={busy}>{busy ? "Searching…" : `🔎 ${t.search}`}</button></form></section>

    {result && <section className="results-section" id="results" aria-live="polite"><div className="results-heading"><div><span className="eyebrow">{t.result}</span><h2>{result.data?.length ? `${result.data.length} ${result.data.length === 1 ? t.journey : t.journeys} ${t.found}` : t.noRoute}</h2><p>{from} → {to}</p></div>{result.data?.length > 0 && <span className="result-count">{result.transferCount === 0 ? t.direct : `${result.transferCount} ${result.transferCount === 1 ? t.transfer : t.transfers}`}</span>}</div>{result.data?.length ? <div className="bus-grid">{result.data.map((option, index) => <article className="bus-card" key={`${option.legs.map((leg) => leg.serviceId).join("-")}-${index}`}><div className="journey-summary"><strong>{option.transfers === 0 ? t.directJourney : `${option.transfers} ${option.transfers === 1 ? t.transfer : t.transfers}`}</strong><span>{option.stopsTravelled} {t.stopsTravelled}</span></div>{option.legs.map((leg, legIndex) => <div className="journey-leg" key={`${leg.serviceId}-${legIndex}`}><div className="bus-card-top"><div className="bus-icon">🚌</div><div><h3>{language === "bn" && leg.nameBn ? leg.nameBn : leg.name}</h3><small>{leg.serviceType || t.unavailable}</small></div><span className="bus-status">{leg.stopsTravelled} stops</span></div><div className="route-info"><div className="route-point"><span className="location-dot green"/><div><small>{t.boardAt}</small><strong>{leg.boardAt}</strong></div></div><div className="route-line">{leg.stops.map((stop, stopIndex) => <span key={`${leg.serviceId}-${stopIndex}`} title={stop}/>)}</div><div className="route-point"><span className="location-dot red"/><div><small>{t.getOffAt}</small><strong>{leg.alightAt}</strong></div></div></div><div className="bus-card-footer"><span>{leg.direction === "Reverse inferred" ? t.reverseInferred : `${leg.stops.length} ${t.listed}`}</span><button type="button" aria-expanded={expanded === `${index}-${legIndex}`} onClick={() => setExpanded(expanded === `${index}-${legIndex}` ? null : `${index}-${legIndex}`)}>{expanded === `${index}-${legIndex}` ? t.hide : t.details}</button></div>{expanded === `${index}-${legIndex}` && <ol className="stop-list">{leg.stops.map((stop, stopIndex) => <li className="stop-item" key={`${leg.serviceId}-detail-${stopIndex}`}>{stop}</li>)}</ol>}{legIndex < option.legs.length - 1 && <div className="transfer-note">{t.changeBus} <strong>{option.transferStops[legIndex]}</strong></div>}<div className="service-meta"><span>{t.type}: {leg.serviceType || t.unavailable}</span><span>{t.hours}: {leg.operatingHours || t.dataUnavailable}</span></div></div>)}<button type="button" className="report-inline" onClick={() => { document.getElementById("report")?.scrollIntoView({ behavior: "smooth" }); }}>{t.reportJourney}</button></article>)}</div> : <div className="no-results"><h3>{resultError}</h3><p>{t.noRouteHelp}</p>{result.suggestions?.length > 0 && <div className="suggestion-chips">{result.suggestions.map((stop) => <button key={stop} onClick={() => { if (!from.trim() || !allStops.some((item) => item.toLowerCase() === from.toLowerCase())) setFrom(stop); else setTo(stop); }}>{stop}</button>)}</div>}<button className="text-button" onClick={() => document.getElementById("report")?.scrollIntoView({ behavior: "smooth" })}>{t.reportMissing}</button></div>}</section>}

    <section className="popular-section" id="routes"><div className="section-heading"><span className="eyebrow">{t.popular}</span><h2>{t.tryRoute}</h2><p>{t.quickHint}</p></div><div className="popular-grid">{quickRoutes.map((route) => <button className="popular-card" key={route.id} onClick={() => search(route.stops[0], route.stops.at(-1))}><span className="popular-icon">🚌</span><span className="popular-path"><strong>{route.stops[0]}</strong><span>↓</span><strong>{route.stops.at(-1)}</strong><small>{route.name}</small></span><span className="popular-arrow">→</span></button>)}</div></section>

    <section className="search-section service-directory" id="services"><div className="section-heading"><span className="eyebrow">{t.directory}</span><h2>{t.browse}</h2><p>{t.directoryHint}</p></div><div className="catalogue-tools"><label htmlFor="service-query">{t.searchServices}</label><input id="service-query" value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder={t.searchPlaceholder}/><button type="button" className="text-button" onClick={() => setShowServices(!showServices)}>{showServices ? t.hideList : t.showAll}</button></div>{showServices && <div className="service-list">{visibleServices.map((route) => <article className="service-row" key={route.id}><div><strong>{language === "bn" && route.nameBn ? route.nameBn : route.name}</strong><small>{route.type || "Not available"} · {route.stops.length} stops</small></div><span>{route.from} → {route.to}</span><button type="button" onClick={() => search(route.from, route.to)}>Find journey</button></article>)}</div>}</section>

    <section className="search-section stop-browser" id="stops"><div className="section-heading"><span className="eyebrow">{t.stopLookup}</span><h2>{t.stopBrowse}</h2><p>{t.stopBrowseHint}</p></div><form className="catalogue-tools" onSubmit={browseStop}><label htmlFor="stop-query">{t.stopName}</label><input id="stop-query" list="locations" value={stopQuery} onChange={(event) => setStopQuery(event.target.value)} placeholder={t.typeStop} required/><button className="search-button" type="submit">{t.searchAtStop}</button></form>{notice && <p className="inline-notice" role="status">{notice}</p>}{stopServices && <div className="service-list"><h3>{stopServices.stop} · {stopServices.count} services</h3>{stopServices.data.map((route) => <div className="service-row" key={route.id}><strong>{(language === "bn" && route.nameBn ? route.nameBn : route.name)}</strong><span>{route.from} → {route.to}</span><button onClick={() => search(stopServices.stop, route.to)}>{language === "bn" ? "Plan from here" : "Plan from here"}</button></div>)}</div>}</section>

    <section className="search-section" id="report"><div className="section-heading"><span className="eyebrow">{t.reportEyebrow}</span><h2>{t.report}</h2><p>{t.reportHint}</p></div><ReportForm services={routes} language={language}/></section>

    <section className="search-section admin-section" id="admin"><AdminPanel/></section>
    <section className="about-section" id="about"><span className="eyebrow">{t.aboutEyebrow}</span><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><p className="data-note">{t.routeCaveat}</p></section></main>
    <footer className="footer"><a href="#home" className="logo">🚌 Dhaka<span className="logo-highlight">Bus</span></a><p>{t.footerLine}</p><span>© 2026 Dhaka Bus Route Finder · Open source project</span></footer>
  </div>;
}

function ReportForm({ services, language }) {
  const [message, setMessage] = useState(""); const [sending, setSending] = useState(false);
  const t = { ...copy.en, ...copy[language] };
  const types = language === "bn"
    ? [["Wrong stop order", "ভুল স্টপের ক্রম"], ["Missing stop", "স্টপ বাদ পড়েছে"], ["Missing service", "সার্ভিসের তথ্য নেই"], ["Closed/changed service", "সার্ভিস বন্ধ বা পরিবর্তিত"], ["Other", "অন্যান্য"]]
    : [["Wrong stop order", "Wrong stop order"], ["Missing stop", "Missing stop"], ["Missing service", "Missing service"], ["Closed/changed service", "Closed/changed service"], ["Other", "Other"]];
  async function submit(event) {
    event.preventDefault(); setSending(true); setMessage(""); const form = new FormData(event.currentTarget);
    const payload = { reportType: form.get("reportType"), serviceId: form.get("serviceId") || null, stopName: form.get("stopName"), description: form.get("description"), contact: form.get("contact") };
    try { const response = await fetch("/api/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || "Could not submit report."); setMessage(language === "bn" ? `রিপোর্ট জমা হয়েছে। রেফারেন্স: ${body.id}` : `Report received. Reference: ${body.id}`); event.currentTarget.reset(); }
    catch (error) { setMessage(language === "bn" ? `রিপোর্ট পাঠানো যায়নি: ${error.message}` : `${error.message} Check that the API is running.`); }
    finally { setSending(false); }
  }
  return <form className="report-form" onSubmit={submit}>
    <label>{t.reportType}<select name="reportType" required><option value="">{t.chooseType}</option>{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>{t.relatedService}<select name="serviceId"><option value="">{t.none}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
    <label>{t.relatedStop}<input name="stopName" maxLength="120" placeholder={t.stopName}/></label>
    <label className="wide-field">{t.description}<textarea name="description" minLength="10" maxLength="1000" rows="4" required placeholder={t.descriptionHint}/></label>
    <label className="wide-field">{t.contact}<input name="contact" maxLength="200" type="text" placeholder={t.contactHint}/></label>
    <button className="search-button" type="submit" disabled={sending}>{sending ? (language === "bn" ? "পাঠানো হচ্ছে…" : "Sending…") : t.submit}</button>
    {message && <p className="inline-notice" role="status">{message}</p>}
  </form>;
}

export default App;
