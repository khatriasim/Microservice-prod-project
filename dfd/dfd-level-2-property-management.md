# EstateHub DFD Level 2 — 2.0 Property Management

## Boundary flow

Input: agent listing CRUD data or visitor/user property search criteria.

Output: property-management result, available listings/details, and a new-property event.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 2.1 | Validate Agent | Receive listing request and JWT user context → check authenticated agent role → authorization decision. |
| 2.2 | Create Property | Receive valid listing data → write property with agent ID/name/email and `available` status to D2 → return property record. |
| 2.3 | Publish New-Property Event | Receive newly stored property record → publish `property_created` data to D4 Kafka. |
| 2.4 | Search and View Properties | Receive filters → read available D2 Properties → write D2 SearchLog for authenticated filtered searches → return matching listing data. |
| 2.5 | Update or Delete Property | Receive agent change/delete request → check property owner → update/delete D2 Property → return result. |

Data stores: D2 Property Database (Properties, SearchLogs); D4 Kafka `property_created` topic.
