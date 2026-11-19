import { useState } from "react";

const statuses = ["Draft", "Approved", "Hidden"];
const reportStatuses = ["Pending", "Under Review", "Approved/Applied", "Rejected", "Resolved"];

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: { ...(options.body ? { "content-type": "application/json" } : {}), ...options.headers } });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return body;
}

function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [data, setData] = useState({ routes: [], reports: [], suggestions: [], stops: [] });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mergeAlias, setMergeAlias] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");
  const [newService, setNewService] = useState({ name: "", nameBn: "", type: "", serviceTime: "", stops: "" });

  async function refresh() {
    const [routes, reports, suggestions, stops] = await Promise.all([
      api("/api/admin/services"), api("/api/admin/reports"), api("/api/admin/alias-suggestions"), api("/api/admin/stops"),
    ]);
    setData({ routes: routes.data, reports: reports.data, suggestions: suggestions.data, stops: stops.data });
  }

  async function login(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await api("/api/admin/login", { method: "POST", body: JSON.stringify({ username, password }) }); setPassword(""); setAuthenticated(true); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function run(action, successMessage) {
    setBusy(true); setMessage("");
    try { await action(); await refresh(); setMessage(successMessage); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function saveService(event, route) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const body = { name: form.get("name"), nameBn: form.get("nameBn"), type: form.get("type"), serviceTime: form.get("serviceTime"), status: form.get("status"), lastVerifiedOn: form.get("lastVerifiedOn") || null, stops: String(form.get("stops")).split(/\r?\n/).map((stop) => stop.trim()).filter(Boolean) };
    await run(() => api(`/api/admin/services/${route.id}`, { method: "PATCH", body: JSON.stringify(body) }), `Updated ${route.name}.`);
  }

  async function createService(event) {
    event.preventDefault();
    const stops = newService.stops.split(/\r?\n/).map((stop) => stop.trim()).filter(Boolean);
    await run(async () => { await api("/api/admin/services", { method: "POST", body: JSON.stringify({ ...newService, stops }) }); setNewService({ name: "", nameBn: "", type: "", serviceTime: "", stops: "" }); }, "Service created as Draft.");
  }

  async function logout() {
    try { await api("/api/admin/logout", { method: "POST" }); } catch { /* session may already have expired */ }
    setAuthenticated(false); setData({ routes: [], reports: [], suggestions: [], stops: [] });
  }

  return <section className="admin-panel">
    <div className="section-heading"><span className="eyebrow">ADMINISTRATION</span><h2>Review and manage data</h2><p>Admin access is configured by the server environment. Reports do not alter published service data until an admin applies a reviewed change.</p></div>
    {!authenticated ? <form className="admin-login" onSubmit={login}>
      <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username"/></label>
      <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required/></label>
      <button className="search-button" disabled={busy}>Admin sign in</button>
      {message && <p className="inline-notice" role="alert">{message}</p>}
    </form> : <>
      <div className="admin-toolbar"><strong>Signed in</strong><button className="text-button" type="button" onClick={logout}>Sign out</button><button className="text-button" type="button" disabled={busy} onClick={() => run(() => api("/api/admin/import", { method: "POST", body: "{}" }), "Source dataset imported.")}>Re-import source dataset</button></div>
      {message && <p className="inline-notice" role="status">{message}</p>}

      <details className="admin-group" open><summary>Services ({data.routes.length})</summary>
        <form className="admin-service-form" onSubmit={createService}><h3>Add service</h3><label>English name<input required value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })}/></label><label>Bangla name<input value={newService.nameBn} onChange={(e) => setNewService({ ...newService, nameBn: e.target.value })}/></label><label>Service type<input value={newService.type} onChange={(e) => setNewService({ ...newService, type: e.target.value })}/></label><label>Operating hours<input value={newService.serviceTime} onChange={(e) => setNewService({ ...newService, serviceTime: e.target.value })}/></label><label className="wide-field">Stops, one per line<textarea required rows="4" value={newService.stops} onChange={(e) => setNewService({ ...newService, stops: e.target.value })}/></label><button className="search-button" disabled={busy}>Add as Draft</button></form>
        {data.routes.map((route) => <details className="admin-service" key={route.id}><summary>#{route.id} {route.name} · {route.status || "Approved"}</summary><form className="admin-service-form" onSubmit={(event) => saveService(event, route)}><label>English name<input name="name" defaultValue={route.name}/></label><label>Bangla name<input name="nameBn" defaultValue={route.nameBn}/></label><label>Service type<input name="type" defaultValue={route.type}/></label><label>Operating hours<input name="serviceTime" defaultValue={route.serviceTime}/></label><label>Status<select name="status" defaultValue={route.status || "Approved"}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>Last verified on<input name="lastVerifiedOn" type="date" defaultValue={route.lastVerifiedOn?.slice(0, 10) || ""}/></label><label className="wide-field">Stops, one per line<textarea name="stops" rows="4" defaultValue={route.stops.join("\n")}/></label><button className="search-button" disabled={busy}>Save service</button><button type="button" className="danger-button" disabled={busy} onClick={() => { if (window.confirm(`Delete ${route.name}?`)) run(() => api(`/api/admin/services/${route.id}`, { method: "DELETE" }), "Service deleted."); }}>Delete service</button></form></details>)}
      </details>

      <details className="admin-group"><summary>Stops and aliases ({data.stops.length} stops, {data.suggestions.filter((item) => item.status === "Pending").length} pending suggestions)</summary>
        <form className="admin-service-form" onSubmit={(event) => { event.preventDefault(); run(() => api("/api/admin/stops/merge", { method: "POST", body: JSON.stringify({ alias: mergeAlias, canonical: mergeTarget }) }), `Mapped ${mergeAlias} to ${mergeTarget}.`); }}><label>Alias<input required value={mergeAlias} onChange={(e) => setMergeAlias(e.target.value)}/></label><label>Canonical stop<input required value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)}/></label><button className="search-button" disabled={busy}>Save alias</button></form>
        {data.stops.map((stop) => <div className="admin-review-row" key={stop.canonical}><span><strong>{stop.canonical}</strong><small>{stop.serviceCount} services · {stop.variants.join(", ")}</small></span><form onSubmit={(event) => { event.preventDefault(); const name = new FormData(event.currentTarget).get("name"); run(() => api(`/api/admin/stops/${encodeURIComponent(stop.canonical)}`, { method: "PATCH", body: JSON.stringify({ name }) }), `Renamed ${stop.canonical}.`); }}><input name="name" aria-label={`Rename ${stop.canonical}`} placeholder="New canonical name" required/><button className="text-button" disabled={busy}>Rename</button></form><button className="danger-button" disabled={busy} onClick={() => { if (window.confirm(`Remove ${stop.canonical} from every service?`)) run(() => api(`/api/admin/stops/${encodeURIComponent(stop.canonical)}`, { method: "DELETE" }), `Removed ${stop.canonical}.`); }}>Delete stop</button></div>)}
        {data.suggestions.map((item, index) => <div className="admin-review-row" key={`${item.alias}-${index}`}><span><strong>{item.alias}</strong> → {item.canonical} <small>({item.status})</small></span>{item.status === "Pending" && <button className="text-button" disabled={busy} onClick={() => run(() => api(`/api/admin/alias-suggestions/${index}/approve`, { method: "POST", body: "{}" }), "Alias approved.")}>Approve merge</button>}</div>)}
      </details>

      <details className="admin-group"><summary>Community reports ({data.reports.length})</summary>{data.reports.length ? data.reports.map((report) => <form className="admin-review-row report-review" key={report.id} onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); run(() => api(`/api/admin/reports/${report.id}`, { method: "PATCH", body: JSON.stringify({ status: form.get("status"), decisionNote: form.get("decisionNote") }) }), "Report status updated."); }}><div><strong>{report.reportType}</strong><p>{report.description}</p><small>{report.stopName || "No stop selected"} · {new Date(report.createdAt).toLocaleString()}</small></div><select name="status" defaultValue={report.status}>{reportStatuses.map((status) => <option key={status}>{status}</option>)}</select><input name="decisionNote" defaultValue={report.decisionNote} placeholder="Review note"/><button className="text-button" disabled={busy}>Update</button></form>) : <p>No community reports yet.</p>}</details>
    </>}
  </section>;
}

export default AdminPanel;
