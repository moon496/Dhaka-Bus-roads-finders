# Test Cases

These cases operationalize the supplied SRS's acceptance and functional requirements. Status is **Not run**; no test execution is claimed.

| ID | Requirement | Test input/action | Expected result |
|---|---|---|---|
| TC-SEARCH-01 | FR-01/02, AC-01 | Search Mirpur 10 to Farmgate | Direct options are shown with service names and ordered route segments |
| TC-SEARCH-02 | FR-02 | Search Farmgate to Mirpur 10 | Direct matches appear with reversed stop sequence labelled as inferred direction |
| TC-SEARCH-03 | FR-04, AC-02 | Search Banasree to Savar | With no direct option, a one-transfer journey using a shared stop is shown |
| TC-SEARCH-04 | FR-04, FR-07 | Search Mirpur 11 to Police Plaza | If no direct/one-transfer match exists, a two-transfer path is shown and both interchange stops are identified |
| TC-SEARCH-05 | FR-05/06 | Search Mirpur 10 to Farmgate, where source has over 10 matches | At most 10 unique service sequences appear; fewer transfers rank first, then fewer stops travelled |
| TC-SEARCH-06 | FR-03, AC-03 | Search `Bashtola -` and `- Ray Saheb Bazar` | Punctuation variants normalize to the same stop |
| TC-SEARCH-07 | FR-03, AC-03 | Search `Bashundhara (300 Feet Gate)` before alias approval | It remains distinct from `Bashundhara`; after admin approval, both resolve to the canonical stop |
| TC-SEARCH-08 | FR-07, AC-04 | Search an unknown stop and a same-stop pair | Clear validation/no-route response; typo suggestions appear when within distance 2 |
| TC-SEARCH-09 | FR-09 | Request `/api/stops?q=Farmagte` | Stop suggestion includes Farmgate (if edit distance <= 2) |
| TC-BROWSE-01 | FR-10, AC-05 | Open a service with blank `type`/`serviceTime` | Stored stop order is shown; blank values say “Not available” |
| TC-BROWSE-02 | FR-11 | Browse services at Farmgate | Every approved service containing the canonical stop appears |
| TC-BROWSE-03 | FR-13 | Search the service directory by name, type and stop | Matching services can be browsed and opened for journey search |
| TC-LANG-01 | FR-14, AC-06 | Toggle language during a populated search | Primary interface labels switch; search values remain; missing Bangla service names fall back to English |
| TC-DATA-01 | FR-15, FR-16 | Inspect blank data and results | No fare/time/location is guessed; route guidance and freshness caveat are visible |
| TC-DATA-02 | DR-05 | Inspect Dewan record | Both Science Lab entries remain intact and are included in data-quality review |
| TC-REPORT-01 | FR-20/21, AC-07 | Submit valid Missing stop report as guest | 201 response; Pending report and timestamp are persisted; public route data is unchanged |
| TC-REPORT-02 | FR-20 | Submit description of 9 and 1001 characters | Both requests return 400 with validation guidance |
| TC-REPORT-03 | FR-22 | Submit six reports from one client in an hour | First five accepted; sixth returns 429 |
| TC-ADMIN-01 | FR-32, AC-08 | Call `GET /api/admin/reports` without session | 401; no report/contact data returned |
| TC-ADMIN-02 | FR-30 | Sign in; create, edit, hide, approve and delete a Draft test service | Mutations persist; Draft/Hidden are omitted from public results; Approved becomes searchable |
| TC-ADMIN-03 | FR-30, AC-03 | Approve a pending alias or create an alias | Search resolves the alias to the canonical stop; audit event is written |
| TC-ADMIN-04 | FR-31 | Change a report to Under Review, then Resolved with a note | Status, note, reviewer and timestamp are stored; public service data is not auto-edited |
| TC-ADMIN-05 | FR-34 | Set and clear last-verified date on a service | Date persists and is visible to administrators |
| TC-ADMIN-06 | FR-35 | Re-import unchanged source, then changed disposable source | Import is repeatable and reports changed, unchanged and skipped records |
| TC-API-01 | Interfaces | Call unknown path and unsupported method; send malformed and >16 KB JSON | 404, 405, 400 and 413 respectively |
| TC-SEC-01 | NFR-04/06/07 | Restart API, test session expiry and HTTPS deployment cookie | Password not stored in repo; session is protected, expires after inactivity, and uses Secure under production HTTPS |
| TC-UI-01 | NFR-09/10 | Complete a search and view at 360 px | Core search works with labeled inputs and no horizontal scrolling |
| TC-PERF-01 | NFR-01/02 | Run reference load profile at 20 concurrent users | 95% journey searches <2 sec and autocomplete <500 ms; record results rather than assume pass |
| TC-QUALITY-01 | NFR-13 | Manually verify the 20 selected journeys with local operators/riders | At least 90% match a valid current option, otherwise revise data/assumptions |
