# EstateHub DFD Level 2 — 5.0 Recommendation Management

## Boundary flow

Input: authenticated user recommendation request.

Output: ranked, limited recommended properties.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 5.1 | Load Preference Signals | Receive authenticated user ID → read that user's D2 SearchLogs and Favorites. |
| 5.2 | Build Preference Profile | Aggregate preferred cities, property types, bedroom counts, and price ranges from the signals. |
| 5.3 | Load Candidate Listings | Read available properties from D2 Properties. |
| 5.4 | Score and Filter Candidates | Compare candidates with the preference profile; remove properties already in the user's favourites. |
| 5.5 | Return Ranked Results | Sort by score, limit results, and return recommended property records. |

Data store: D2 Property Database (SearchLogs, Favorites, Properties).
