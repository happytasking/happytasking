# Country eligibility

## Source country selector

AITraining.jobs embeds an ISO 3166-1 alpha-2 list in marketing-page JavaScript
(`{code:"AF",name:"Afghanistan"}` …). **243 codes**. It is not a Server Action
and is not derived from live role metadata.

Selecting a country sets `fetchRoles.country` (server-side). Their result set
for `country=X` includes:

- listings whose `location` mentions that country
- `location: null`
- `"Remote"`
- `"Remote International"`

That is **their** product rule. Happy Tasking does **not** copy it.

## Happy Tasking semantics

Stored on `Opportunity`:

- `countryEligibility`: `EXPLICIT` | `GLOBAL` | `UNSPECIFIED`
- `countryRestrictions`: ISO 3166-1 alpha-2 codes when `EXPLICIT`
- Multi-country listings are `EXPLICIT` with multiple codes (no extra enum)

Parse rules (`parseCountryLocation`):

| Location text | Result |
| --- | --- |
| empty / null | `UNSPECIFIED` |
| `Remote` only | `UNSPECIFIED` (remote ≠ worldwide) |
| `Remote International`, worldwide, global, anywhere | `GLOBAL` |
| Named countries / ISO codes | `EXPLICIT` + codes |
| Multi-country lists | `EXPLICIT` + all matched codes |

Language in the title does **not** imply country eligibility.

## TaskMatch filter

`/taskmatch?country=BR` (and any other ISO code):

**Default:** `GLOBAL` **or** `EXPLICIT` containing that code.

**Not included:** `UNSPECIFIED` (including bare Remote).

Opt-in: `includeUnspecified=true`.

Invalid `country=INVALID` is ignored (no 500, treated as all countries).

User selection is the only country signal. Anonymous IP geolocation is **not**
used on TaskMatch (existing geo is for visits/login only).

## Serving architecture

```
AITraining.jobs unfiltered feed  (hourly)
        ↓
country eligibility normalization
        ↓
Happy Tasking database
        ↓
/taskmatch?country=DZ   ← local query
```

Country-specific `fetchRoles` calls are audit-only, not ingestion.

## Controlled comparison (source site, audit only)

Unfiltered total ~1,687. Their `country=` totals were far higher because they
include unspecified/remote:

US 1369, IN 1187, CA 1166, GB 1160, AU 1146, BR 1139, FR 1138, DE 1136,
JP 1135, ZA 1130, DZ 1129.

BR vs DZ differed by ~10 explicit Brazil listings. Happy Tasking counts are
lower because unspecified is excluded by default.

## Facet counts

Country confirmed counts are grouped from the Happy Tasking database
(`EXPLICIT` codes + a separate GLOBAL count). Never from 200 live source
requests.
