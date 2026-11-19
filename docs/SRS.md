# Software Requirements Specification

## Document status and source

This working SRS is aligned with the supplied *Dhaka City Bus Route Finder*, version 2.0, dated 19 November 2026. The source PDF labels itself a draft for academic review and marks approval pending; its assumptions and proposed decisions therefore remain subject to the project team's review. This document separates implemented behavior from items that still need validation.

## 1. Purpose and scope

Dhaka Bus Route Finder is a responsive bilingual web application for discovering local bus services and planning journeys between stops using the supplied catalogue. Commuters can search for direct journeys and journeys with up to two transfers, inspect service and stop details, browse services at a stop, and submit data reports for administrator review. Administrators can manage service records, stop aliases and reports.

The dataset contains Dhaka-area local bus services and some nearby areas already present in the records. It is not a complete or live authority feed.

### Out of scope

Live GPS and arrival prediction, tickets and payments, fares, distance/time estimation, non-bus transport, native mobile apps, and a map requiring coordinates. Favourites/offline use and a map remain optional future work.

## 2. Users and environment

- **Commuter:** no account required; searches, browses and files reports.
- **Administrator:** authenticates to review reports and manage services and stop aliases.
- **Environment:** modern desktop/mobile browser (target minimum viewport 360 px); Node.js 20+ for the API.
- An internet connection is needed to reach a hosted API. The client can show the bundled dataset and direct-search fallback if the API is unavailable.

## 3. Dataset and assumptions

The source has 156 service records, 3,190 stop entries and 301 distinct stop strings. Fields are `english`, `bangle`, `image`, `routes`, `service_type` and `time`. `bangle` is mapped to `nameBn`; blank service type and time remain blank and display as “Not available.” Seven names occur more than once, so the service ID, not the name, identifies a record. One service repeats Science Lab; repeated stops are retained pending review. Source image URLs are external and optional.

The source has no stop IDs, coordinates, fares, route numbers or route-direction metadata. Bus names have Bangla translations, but stop names are English-only. The system does not invent missing values. Punctuation/case/whitespace normalization is automatic; semantically distinct names such as “Bashundhara” and “Bashundhara (300 Feet Gate)” are not merged automatically. Candidate aliases are pending review until an administrator approves them.

Reverse travel and transfers assume a bus operates both ways along its listed stops and that shared canonical stops permit interchange. The source PDF explicitly calls for confirming the two-way assumption with real routes; it is still an open validation item.

## 4. Functional requirements

| ID | Requirement | Priority | Current status |
|---|---|---:|---|
| FR-01 | Select origin and destination by English stop name with autocomplete. | Must | Implemented |
| FR-02 | Return direct services containing both stops, in either inferred direction. | Must | Implemented; direction assumption needs field validation |
| FR-03 | Match case, punctuation, whitespace and approved stop aliases. | Must | Implemented |
| FR-04 | If no direct option exists, search one transfer, then at most two; name each transfer stop. | Must | Implemented in API |
| FR-05 | Rank fewer transfers first, then fewer total stops travelled. | Must | Implemented |
| FR-06 | Return at most 10 options and do not repeat the same service sequence or service within a journey. | Must | Implemented |
| FR-07 | Reject identical/unknown stops and offer corrections when available. | Must | Implemented |
| FR-08 | Explain when no journey is found and provide a route-data report path. | Must | Implemented |
| FR-09 | Offer fuzzy stop suggestions with edit distance up to 2. | Should | Implemented in API autocomplete/suggestions |
| FR-10 | Show English/Bangla service name, type, hours and ordered stops; show “Not available” for blanks. | Must | Implemented |
| FR-11 | List services passing through a stop. | Must | Implemented |
| FR-12 | Show stops travelled for every leg. | Must | Implemented |
| FR-13 | Provide a searchable service directory. | Should | Implemented |
| FR-14 | Provide Bangla/English interface toggle; use English fallback where translations are unavailable. | Must | Implemented for primary commuter flows; some administrative labels remain English |
| FR-15 | Never invent fare, time or location values. | Must | Implemented |
| FR-16 | State route information is guidance and can differ from current operations. | Must | Implemented |
| FR-20 | Let a guest report wrong order, missing stop/service, changed service or other issue; description 10-1000 characters. | Must | Implemented |
| FR-21 | Store reports as Pending with timestamp and do not change public data automatically. | Must | Implemented |
| FR-22 | Limit each client to 5 reports per hour. | Should | Implemented in process memory; reverse proxy must preserve client IP if trusted |
| FR-30 | Admin can create/edit/hide/delete services and stop names, and create/merge stop aliases. | Must | Implemented; stops are edited/deleted across route JSON, not held in a separate stop table |
| FR-31 | Admin can review reports and set status with a note. | Must | Implemented |
| FR-32 | Admin features require authentication. | Must | Implemented with environment-configured admin credential and session cookie |
| FR-33 | Record last-modified time and admin for service/stop changes. | Must | Partially implemented: service timestamps and append-only audit events; stop aliases have audit events |
| FR-34 | Admin can mark a service verified and view verification date. | Should | Field supported; verification date can be edited through service API |
| FR-35 | Provide repeatable dataset import and flag skipped/changed records. | Must | Implemented; import returns changed IDs, unchanged count and skipped IDs |
| FR-40 | Show service stops on an interactive map when coordinates exist. | Should | Deferred; source has no coordinates |
| FR-41/42 | Saved routes/history or offline result cache. | Could | Deferred |

## 5. Non-functional requirements

- **Performance:** target journey search under 2 seconds at 95th percentile for the supplied dataset and 20 concurrent users; autocomplete under 500 ms. These targets require measurement before they can be claimed met.
- **Security:** admin password is read from environment and hashed with Node scrypt at startup; authenticated sessions are HttpOnly, SameSite and idle-expiring. Production should use HTTPS. Do not commit secrets. The API bounds request bodies, validates inputs and rate-limits report submission. Configure the deployed origin and trusted proxy deliberately.
- **Privacy:** contact details on a report are optional and only returned from the authenticated admin report endpoint.
- **Usability/accessibility:** responsive layout, labeled controls, keyboard operation and visible focus. Run a WCAG contrast and 360 px viewport review before academic acceptance.
- **Reliability/data quality:** original source file is preserved; public routes are not modified by reports. Route direction and semantic stop merges remain review items.
- **Maintainability/portability:** UI, route-finding and API logic are separated; the API persists route data, aliases and reports in JSON files.

## 6. Interfaces and implementation decisions

The source SRS proposes React, Express and PostgreSQL. This repository currently uses React/Vite and Node's built-in HTTP server with JSON persistence, so it can run without dependency installation for the API. This is an implementation choice, not a change to the source SRS's proposed decision; confirm whether the course/team requires Express/PostgreSQL before deployment. See [API Documentation](API_Documentation.md), [Database Schema](Database_Schema.md) and [Deployment Guide](Deployment_Guide.md).

The current API exposes `GET /api/stops`, `GET /api/journeys`, `GET /api/services`, `GET /api/stops/{name}/services`, `POST /api/reports`, and authenticated `/api/admin/...` endpoints. Production must use HTTPS and persistent storage for the JSON files.

## 7. Acceptance criteria

1. A direct pair returns the direct service and its ordered segment.
2. Without a direct service, a valid shared stop produces a one-transfer journey; otherwise a two-transfer journey is returned when available.
3. Results are ordered by transfer count and stops travelled, capped at 10, with each transfer stop identified.
4. Punctuation/case variants and approved aliases match; unknown names produce useful suggestions when available.
5. The app can switch primary commuter text between English and Bangla; unavailable translations fall back to English.
6. Service and stop browsing show stored names/order and do not invent missing service facts.
7. Guest reports validate length/type, are rate-limited, and remain Pending until admin action.
8. Unauthenticated admin requests are rejected; authenticated admins can manage services, aliases and report status.
9. Verify the 20 sample journeys, 95th-percentile performance, and accessibility targets defined by the source SRS before calling academic acceptance complete.

## 8. Open decisions to confirm with the team

- Confirm that services operate in both directions; otherwise add direction metadata.
- Review the repeated Science Lab stop in the Dewan service.
- Review proposed stop merges; specifically verify that the two Bashundhara labels are the same interchange.
- Confirm that reusing externally hosted images is permitted.
- Decide whether Bangla stop translations are needed before the demo.
- Confirm whether JSON persistence is acceptable or whether the proposed Express/PostgreSQL architecture is mandatory.
