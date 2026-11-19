# Database Schema

## Current persistence

The running project does not use a relational database. It stores these JSON collections on disk and loads route data into memory at API startup:

| File | Logical collection | Mutations |
|---|---|---|
| `dataset/bus_routes.json` | `BusService` with embedded ordered `stops[]` | Admin create/edit/delete/import |
| `dataset/stop_aliases.json` | Approved `StopAlias(alias, canonical)` mappings | Admin create/merge/delete |
| `dataset/stop_alias_suggestions.json` | Pending alias review suggestions | Admin approve changes status |
| `backend/data/reports.json` | Community reports | Public create; admin review status/note |
| `backend/data/admin-audit.ndjson` | Append-only admin action events | API appends on admin changes |

There is no persistent `AdminUser` table. One admin identity is configured through `ADMIN_USER` and `ADMIN_PASSWORD`; the password is scrypt-hashed at server startup, and session records are in memory. This is a dependency-free implementation choice; the supplied SRS proposes PostgreSQL and the team should confirm whether it is required.

## Logical service record

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `id` | integer | yes | Stable local service ID; bus names can repeat |
| `name` | string | yes | English service name |
| `nameBn` | string | yes | Bangla service name or empty string |
| `type` | string | yes | Source service type or empty string |
| `from`, `to` | string | yes | Derived from first and last listed stop |
| `stops` | string[] | yes | Ordered route sequence, at least 2 for admin-created records |
| `image` | string | yes | Optional source image URL |
| `serviceTime` | string | yes | Optional source operating-hours text; blank means unknown |
| `color` | string | yes | Presentation value, not operator data |
| `status` | enum | yes | `Draft`, `Approved`, or `Hidden` |
| `lastVerifiedOn` | date/null | yes | Optional manual verification date |
| `lastModifiedAt` | timestamp/null | yes | Set on admin service updates |

## Other logical records

**Stop** is currently derived from every route's `stops[]`. A normalized name acts as its key. Punctuation, case and repeated spaces normalize automatically. Approved aliases map an additional spelling to one canonical stop. A semantic merge does not rewrite original stop strings.

**Report** fields: `id`, `reportType`, optional `serviceId` and `stopName`, `description`, optional `contact`, `status`, `createdAt`, `reviewedBy`, and `decisionNote`. Public responses omit contact; the authenticated admin endpoint includes it.

**AdminAudit** is one newline-delimited JSON event per action: `at`, admin identity, action name, and relevant record IDs/fields. It does not include report contact or description.

## Relational target model from the supplied SRS

If PostgreSQL becomes a project requirement, normalize into `BusService`, `Stop`, `StopAlias`, `ServiceStop(service_id, stop_id, stop_order)`, `Report`, and `AdminUser`. BusService-to-Stop is many-to-many through `ServiceStop`; aliases point to one stop; a report optionally refers to a service and/or stop. Preserve service ID/name distinctions and route sequence on migration. The relational target model has not been implemented.
