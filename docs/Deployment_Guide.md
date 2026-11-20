# Deployment Guide

## Runtime layout

Deploy the Vite build as static files and run `backend/server.js` under Node.js 20+. Prefer a same-origin reverse proxy: serve static content at `/` and forward `/api/*` to the API. This avoids browser cookie/CORS issues for administrator sessions.

## Build and start

Build the frontend with `npm ci` and `npm run build` from `frontend/`, then publish `frontend/dist`. From `backend/`, run `npm start`. The service binds to `0.0.0.0` and uses `PORT` or defaults to 3001. Configure the platform to restart the process after failure.

Set `ADMIN_PASSWORD` to a unique secret and optionally set `ADMIN_USER`. Set `CORS_ORIGIN` to the exact frontend origin if the API is directly cross-origin. If deployed behind a TLS terminator, use HTTPS and set `NODE_ENV=production` so admin cookies are Secure. Set `TRUST_PROXY=true` only when a trusted reverse proxy strips inbound spoofed `X-Forwarded-For` and writes the real client address.

## Persistent files and backups

Give the API write access to `dataset/bus_routes.json`, `dataset/stop_aliases.json`, and `backend/data/`. Preserve those paths across deployments. Back up these files and the original `dataset/dhaka-city-local-bus.json`. Admin mutations write JSON files directly; stop the API or serialize administrative writes before restoring/updating files. `POST /api/admin/import` rebuilds service records from the source JSON and can overwrite manual edits; keep its returned change summary with the deployment record.

Sessions and report-rate counters live in process memory and reset on restart. Use a persistent single API instance for this release; multi-instance deployments would need shared session/rate-limit storage and coordinated file writes. Configure log retention for `backend/data/admin-audit.ndjson` and protect report contact information.

## Deployment checks

- Call `GET /api/health` and confirm expected service/stop counts.
- Check route and transfer search, service/stop browsing, report submission and admin login in a non-production test environment.
- Confirm admin endpoints reject unauthenticated requests.
- Confirm the static host serves app routes and forwards API paths as configured.
- Use HTTPS, a restricted CORS origin, and persistent writable storage.
- Review source dataset/image redistribution rights before public release.

## Current architecture limits

The supplied SRS proposes Express and PostgreSQL, while this implementation is a dependency-free Node HTTP API with JSON persistence. It is suitable for a small single-instance academic project, but not a substitute for transactional database writes or shared sessions at scale. There is no rate-limit persistence, multi-admin user table, map coordinate service, or live vehicle feed. The interactive map is a deferred Should-have item because the source has no coordinates.
