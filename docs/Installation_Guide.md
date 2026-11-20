# Installation Guide

## Requirements

- Node.js 20+ and npm.
- Current browser with JavaScript enabled.
- Repository contents, including the normalized and source datasets.

The API uses Node built-ins and has no npm dependencies. The React client needs its npm dependencies installed.

## Start the API

In PowerShell from the repository root:

```powershell
$env:PORT = "3001"
$env:ADMIN_USER = "admin"
$env:ADMIN_PASSWORD = "set-a-unique-long-secret-here"
$env:CORS_ORIGIN = "http://localhost:5173"
cd backend
npm start
```

Set a private test/deployment password in your own shell; do not commit it. Admin features return `503` until `ADMIN_PASSWORD` is set. `ADMIN_USER` defaults to `admin`. `CORS_ORIGIN` defaults to `*` for public API use; Vite's local same-origin proxy handles browser calls in development. See [backend/.env.example](../backend/.env.example) for variable names. Node does not automatically load that example file.

Check `http://localhost:3001/api/health` in a browser.

## Start the frontend

Open a second PowerShell at the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local Vite URL (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to port 3001. Journey, report and admin functions require the API; if it is down, the UI can only use its direct-route fallback.

## Production build

```powershell
cd frontend
npm ci
npm run build
npm run preview
```

Vite writes static assets to `frontend/dist`. The API must also run in production. The source and normalized JSON files must stay at their documented relative paths.
