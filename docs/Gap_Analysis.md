# Gap Analysis Against the Supplied SRS

The supplied SRS is a draft for academic review, not an approved change request. This checklist maps its proposed MVP to the current repository. Functional behavior is implemented unless marked partial/deferred; performance, usability and real-world accuracy targets remain unverified because the planned tests have not been run.

## Implemented

- Search direct journeys, then one and up to two transfers; identify transfer stops; rank by transfers then total stop transitions; cap at 10 and suppress repeated service sequences.
- Case/punctuation/spacing normalization, edit-distance suggestions, approved alias mappings, and a pending list for semantic merge review.
- Browse services and services at a stop; service detail includes English/Bangla bus names, type, source hours text and ordered stop list; empty source values remain unknown.
- English/Bangla toggle for the primary commuter flow, journey/report UI, service and stop browser. Bus names fall back to English; stop names remain English because the source has no Bangla stop labels.
- Guest reports with type/description validation, Pending status, timestamp, optional contact, and five-per-hour per-process limiting.
- Admin session login, service create/edit/hide/delete, stop rename/delete, alias merge/approval, report review, verification date and repeatable import with change summary.
- Source dataset retained byte-for-byte, normalized runtime data, four diagrams and user/install/deploy/API/test documents.

## Partially implemented or unverified

- Stop data is embedded in each service JSON record rather than normalized PostgreSQL entities. Admin stop edits apply across route records; there is no standalone Stop table.
- Last-modified timestamps and append-only audit events are present; persistence/audit has not been load-tested or tested across multiple API instances.
- The specified 2-second/500-ms performance goals, 20-concurrent-user profile, 20 real journey checks, WCAG 2.1 AA contrast and 360 px usability criteria have not been measured.
- The source assumes two-way operation and transfer at a shared canonical stop. Both assumptions require confirmation on real routes.
- Automatic punctuation normalization handles simple variants; semantically different labels require admin review. Bangla stop-name search needs collected translations/aliases.

## Deferred or intentionally not claimed

- Express/PostgreSQL architecture proposed by the SRS. The current implementation uses the Node built-in HTTP module and JSON files to avoid new runtime dependencies. Confirm whether the course requires the proposed stack.
- Interactive OpenStreetMap/Leaflet map; there are no coordinates in the source dataset.
- Live tracking, arrival prediction, fare/time/distance estimates, ticketing, payment, native apps, saved routes and offline caching.
- A relational admin-user table, shared sessions/rate limits for multiple API instances, and transactional database guarantees.

## Dataset items needing team review

- `dataset/data_quality_report.json` records repeated service names, missing optional fields and repeated stops.
- Dewan lists Science Lab twice; decide whether it represents a loop or data error.
- Review the three pending alias suggestions; confirm the Bashundhara variants are the same interchange before approving.
- Confirm reuse rights for externally hosted images and verify 20 sample journeys with riders/operators.
