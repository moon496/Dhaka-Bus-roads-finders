# API Documentation

Local base URL: `http://localhost:3001`. API responses are UTF-8 JSON. The server is read/write for authenticated administration; commuter endpoints are public. In development, Vite proxies `/api` to port 3001. Set `CORS_ORIGIN` to an exact origin for cross-origin production use.

## Public endpoints

### `GET /api/health`

Returns `{ "status":"ok", "routeCount":156, "stopCount":N }`. Counts reflect the current approved catalogue and normalized stop aliases.

### `GET /api/routes` and `GET /api/services`

Returns approved services. Optional `q` searches English/Bangla service names and stop names; optional `type` filters service type. Response: `{ "count":N, "data":[BusService, ...] }`. Hidden and Draft services are excluded.

### `GET /api/stops`

Returns canonical stop names sorted alphabetically: `{ "count":N, "data":["Airport", "Banani"] }`. With `?q=farngate`, returns up to 10 exact, prefix, substring or edit-distance-at-most-2 suggestions.

### `GET /api/stops/{stopName}/services`

Lists all approved services passing through the canonical stop. The path segment must be URL-encoded. Unknown stops return `404` and possible name suggestions.

### `GET /api/journeys?from=Mirpur%2010&to=Farmgate`

Searches direct services first; only when none exist does it search one transfer, then two transfers. Options are ranked by fewest transfers, then total stops travelled, capped at 10. Repeated service IDs within a journey and repeated service sequences are removed. A transfer is a shared canonical stop. Direction is inferred from the listed sequence and the source's two-way-service assumption remains unverified.

Success response:

```json
{
  "success": true,
  "transferCount": 1,
  "count": 1,
  "data": [{
    "transfers": 1,
    "stopsTravelled": 8,
    "transferStops": ["Farmgate"],
    "legs": [{
      "serviceId": 12,
      "name": "Example Service",
      "nameBn": "",
      "serviceType": "",
      "operatingHours": "",
      "boardAt": "Origin",
      "alightAt": "Farmgate",
      "stops": ["Origin", "Farmgate"],
      "stopsTravelled": 1,
      "direction": "Listed order"
    }]
  }],
  "suggestions": []
}
```

`direction` is `Listed order`, `Reverse inferred`, or `Same stop`. The example values are illustrative. `400` covers missing origin/destination and identical stops. No journey returns `200`, `success:false`, an error, and suggestions where available. `/api/search` remains a compatibility alias.

### `POST /api/reports`

Accepts a public report. JSON body:

```json
{"reportType":"Missing stop","serviceId":12,"stopName":"Example Stop","description":"This service now serves another stop.","contact":"optional"}
```

Types: `Wrong stop order`, `Missing stop`, `Missing service`, `Closed/changed service`, `Other`. Description length: 10-1000 characters. Service and stop are optional. Contact is optional and is only returned to an authenticated admin. Successful submission returns `201` with a reference ID and `Pending` status. More than 5 submissions per client per hour returns `429`. Limit counters are in memory and reset on server restart.

## Admin setup and authentication

Set `ADMIN_PASSWORD` before starting the server; optionally set `ADMIN_USER` (defaults to `admin`). The password is not stored in the repository or report database. Admin login uses `POST /api/admin/login` with `{ "username":"admin", "password":"..." }`. The server issues an HttpOnly, SameSite session cookie that expires after 30 minutes of inactivity. The admin UI uses same-origin requests through Vite's proxy. Set `CORS_ORIGIN` exactly when using a separate frontend origin; use HTTPS in production.

## Admin endpoints

Every endpoint below requires a valid session except login.

| Method and path | Action |
|---|---|
| `POST /api/admin/login` | Authenticate, set session cookie |
| `POST /api/admin/logout` | End session and clear cookie |
| `GET /api/admin/me` | Read session identity |
| `GET /api/admin/services` | List all service records, including Draft/Hidden |
| `POST /api/admin/services` | Create a Draft service; requires name and at least 2 stops |
| `PATCH /api/admin/services/{id}` | Update service names, type, hours, ordered stops, status or verification date |
| `DELETE /api/admin/services/{id}` | Delete service record |
| `GET /api/admin/stops` | List stop variants and approved aliases |
| `PATCH /api/admin/stops/{stopName}` | Rename a stop across every service record; use merge if the target already exists |
| `DELETE /api/admin/stops/{stopName}` | Remove a stop from every service (rejected if any service would have fewer than 2 stops) |
| `POST /api/admin/aliases` or `/api/admin/stops/merge` | Map an alias to an existing canonical stop |
| `DELETE /api/admin/aliases?alias=...` | Remove an alias mapping |
| `GET /api/admin/alias-suggestions` | List pending source-data merge suggestions |
| `POST /api/admin/alias-suggestions/{index}/approve` | Approve a suggested alias merge |
| `GET /api/admin/reports` | View reports, including optional contact details |
| `PATCH /api/admin/reports/{id}` | Set status and decision note |
| `POST /api/admin/import` | Re-import supplied source JSON and return changed/skipped record summary |

Service statuses: `Draft`, `Approved`, `Hidden`. Report statuses: `Pending`, `Under Review`, `Approved/Applied`, `Rejected`, `Resolved`. Updating a report never edits public route data automatically.

## Persistence, errors, and limits

- Services: `dataset/bus_routes.json`.
- Approved aliases: `dataset/stop_aliases.json`.
- Pending alias candidates: `dataset/stop_alias_suggestions.json`.
- Reports and admin audit: `backend/data/` (created on first write).
- All JSON writes require writable persistent storage. Sessions and report rate counters are in memory and reset on restart.
- `400`: validation/JSON error. `401`: admin session required or invalid login. `404`: unknown endpoint/service/report/stop. `405`: unsupported method. `413`: request body exceeds 16 KB. `429`: report rate limit. `503`: admin password not configured. Other server errors return `500`.
- There is no pagination. The API stores route data as JSON rather than PostgreSQL; see the SRS and deployment guide for this implementation decision.
