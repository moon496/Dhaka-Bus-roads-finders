# Dhaka Bus Route Finder

Responsive React app and Node.js API for local Dhaka bus services. The imported dataset has 156 services, 3,190 stop entries and 301 distinct raw stop strings.

## Project structure

```text
frontend/                    React 19 + Vite client
backend/                     Dependency-free Node HTTP API
dataset/bus_routes.json      Normalized runtime service catalogue
dataset/dhaka-city-local-bus.json  Supplied source JSON, retained unchanged
dataset/stop_aliases.json    Approved canonical stop aliases
dataset/stop_alias_suggestions.json  Pending merge suggestions
dataset/data_quality_report.json    Duplicate/missing-data review summary
docs/                        Requirements, design, API, test and operating guides
LICENSE
```

## Run locally

Requirements: Node.js 20+ and npm. Start the API first; admin requires an environment password.

```powershell
$env:ADMIN_USER = "admin"
$env:ADMIN_PASSWORD = "set-a-unique-secret"
cd backend
npm start
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open Vite's printed URL (normally `http://localhost:5173`). Vite proxies `/api` to the API on port 3001. See the [Installation Guide](docs/Installation_Guide.md).

## Features and limits

- Direct journey search, then one-transfer and up-to-two-transfer options if no direct bus exists; at most 10 ranked results.
- English/Bangla primary commuter interface, fuzzy stop suggestions, approved aliases, service directory and services-by-stop view.
- Guest data reports and authenticated admin review/service/alias management.
- No fare, timetable inference, live arrivals or GPS. Reverse direction and interchange are assumptions based on the ordered stop data and need local validation.
- The source SRS proposes Express/PostgreSQL; this repository currently uses Node's built-in HTTP module and JSON persistence. The source SRS is a draft; review open decisions before claiming academic acceptance.

## Documentation

Start at [docs/README.md](docs/README.md). See the [SRS](docs/SRS.md), [API](docs/API_Documentation.md), [schema](docs/Database_Schema.md), [data dictionary](docs/Data_Dictionary.md), [test plan](docs/Test_Plan.md), [test cases](docs/Test_Cases.md), [User Manual](docs/User_Manual.md), [Installation](docs/Installation_Guide.md), and [Deployment](docs/Deployment_Guide.md).

## License and data rights

Project code is licensed under [MIT](LICENSE). The route data and linked images may have separate rights. Confirm source terms before redistribution.
