# Test Plan

## Purpose and scope

Test the requirements in [SRS](SRS.md) against the React client, Node API, source import, route planner, report workflow and administrator actions. The tests below are planned acceptance checks; this revision has not been executed against the current build.

## Levels

1. **Data checks:** parse source and normalized JSON; compare 156 services, 3,190 stop entries and 301 distinct raw strings; inspect duplicate names, empty optional fields and repeated stops.
2. **Unit checks:** canonical stop normalization, alias resolution, Levenshtein distance, direct/transfer search, ranking, cap and duplicate suppression.
3. **API checks:** public endpoints, validation/status codes, report length and rate limits, session protection, CRUD/import and persistence after restart.
4. **UI checks:** English/Bangla switch, stop suggestions, direct/transfer itinerary cards, service detail, stop browsing, report submission, admin review and responsive use.
5. **Non-functional checks:** search latency at 95th percentile with 20 concurrent users, 360 px viewport, keyboard flow, WCAG 2.1 AA contrast, HTTPS/session behavior, and 20 manually validated journeys.

## Environment and test data

Node.js 20+, npm, current Chrome/Firefox/Edge/Safari. Use a disposable working copy for admin write tests. Set `ADMIN_USER` and a unique test-only `ADMIN_PASSWORD` in that environment. Start API and UI using the [Installation Guide](Installation_Guide.md). Never use production credentials or reports for tests.

Dataset examples useful for repeatable manual acceptance:

- Direct and result-cap pair: Mirpur 10 to Farmgate (source includes more than 10 direct service records).
- One transfer: Banasree to Savar; an available route uses Ansar Camp as interchange.
- Two transfers: Mirpur 11 to Police Plaza; a candidate itinerary uses Bashtola then Gulshan 1.
- Punctuation variants: `Bashtola` / `Bashtola -`, and `Ray Saheb Bazar` / `- Ray Saheb Bazar`.
- Pending semantic alias to review: `Bashundhara (300 Feet Gate)` / `Bashundhara`.
- Repeated stop anomaly: Dewan service lists `Science Lab` twice.

The route and transfer examples are based on the checked-in source sequence and the proposed two-direction assumption. Confirm the routes with riders/operators before treating them as factual service validation.

## Entry and exit criteria

Entry: clean install, dataset available, API/config prepared, and test copy backed up. Exit: every Must case passes; Should cases are recorded; no unhandled errors; the team resolves or explicitly accepts every open data assumption. Record software/browser versions, data revision, steps, expected/actual output, latency and status.

## Risks

Stop names may be inconsistent; aliases can produce incorrect interchanges if approved without review. Reverse direction is inferred. A JSON file store is vulnerable to concurrent writes and requires persistent storage. In-memory rate limits and sessions reset on restart. Do not make claims about route correctness, live service, fares or schedule accuracy from automated checks alone.
