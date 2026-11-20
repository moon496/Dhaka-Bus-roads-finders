# Data Dictionary

## Source JSON

The attached source has a top-level `data` array with 156 services and 3,190 ordered stop entries. `service_type` is blank in 116 records and `time` in 145 records. It has 301 distinct raw stop strings; the same named stop can have punctuation/spelling variants.

| Source key | Type | Meaning / data rule |
|---|---|---|
| `english` | string | English bus/service name; not unique |
| `bangle` | string | Bangla service name; source key is misspelled and maps to `nameBn` |
| `image` | string | Optional external URL; not required by the UI |
| `routes` | string[] | Ordered stop names; can include repeated stops |
| `service_type` | string | Optional service category; blank remains unknown |
| `time` | string | Optional operating hours text; blank is not estimated |

## Normalized `BusService` JSON

| Field | Source/derivation | Meaning |
|---|---|---|
| `id` | Source array order | Stable local numeric key; duplicate names remain separate services |
| `name` | `english` | English service name |
| `nameBn` | `bangle` | Bangla service name or empty |
| `type` | `service_type` | Source value or empty; UI displays “Not available” if blank |
| `from`, `to` | First/last `routes` entry | Derived endpoints, not verified terminal names |
| `stops` | `routes` | Original ordered stop labels |
| `image` | `image` | Optional source image URL |
| `serviceTime` | `time` | Original text or empty; not a live schedule |
| `color` | Generated palette | Presentation-only color |
| `status` | Import/admin | `Draft`, `Approved`, `Hidden`; public search lists Approved services |
| `lastVerifiedOn` | Admin | Optional date; null until an admin records verification |
| `lastModifiedAt` | Admin | Timestamp set after service edit |

## Derived search values

| Value | Meaning |
|---|---|
| `canonical stop key` | Unicode NFKC, lowercase, punctuation/symbol spacing and whitespace normalization, then approved alias resolution |
| `journey.legs[]` | Service ID/name, board/alight stop, ordered segment, stop count and inferred direction for each bus |
| `stopsTravelled` | Sum of per-leg stop transitions; excludes the boarding endpoint |
| `transferStops[]` | Canonical interchange stop names between journey legs |
| `suggestions[]` | Exact/prefix/substring or edit-distance-at-most-2 stop matches, up to 10 |

An alias is an administrator-approved alternative spelling. A suggested semantic merge stays pending until reviewed. Names such as “Bashundhara” and “Bashundhara (300 Feet Gate)” are not automatically assumed equivalent.
