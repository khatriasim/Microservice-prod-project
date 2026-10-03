# EstateHub DFD Level 1 — Main Processes

## External entities

- User / Buyer
- Agent
- Admin
- Kafka (`property_created` event channel)
- Email Service

## Data stores

| ID | Store | Contents |
| --- | --- | --- |
| D1 | Django Database | users, profiles, posts, categories, comments, likes, follows, in-app notifications |
| D2 | Property Database | properties, favourites, bookings, search logs |
| D3 | Redis Cache (optional) | cached published-blog list results |
| D4 | Kafka `property_created` Topic | new property listing events |

## Processes and data flows

| No. | Process | Main input | Data store interaction | Main output |
| --- | --- | --- | --- | --- |
| 1.0 | User Authentication & Profile | credentials, OTP, profile changes | read/write D1 | JWT/cookie session, account/profile result, OTP email request |
| 2.0 | Property Management | agent listing CRUD; property search filters | read/write D2; writes D4 on create | listing result, property search result, new-property event |
| 3.0 | Favorite Management | add/remove/list favourite request | read/write D2 Favorites; reads D2 Properties | favourite state/list |
| 4.0 | Booking Management | book, cancel, or status-update request | read/write D2 Bookings; reads D2 Properties | booking result/status/list |
| 5.0 | Recommendation Management | recommendation request | reads D2 SearchLogs, Favorites, Properties | ranked property recommendations |
| 6.0 | Blog Management | post/category CRUD, post browse/detail request | read/write D1; optional D3 cache | post/category data and management result |
| 7.0 | Blog Interaction | comment, like, follow, feed request | read/write D1 comments/likes/follows; writes D1 Notifications | interaction result, feed, notification event |
| 8.0 | Notification Management | notification read/list request; blog events; Kafka property event | read/write D1 Notifications; reads D4; sends email | notification list/status and new-listing emails |
| 9.0 | Agent Management | agent directory/owned listings/viewing request | reads D1 UserProfiles and D2 Properties/Bookings | agent details, owned listings, viewing data |
| 10.0 | Admin Management | staff dashboard commands | read/write D1 | user/post/category/notification dashboard results |

## Inter-process flows

- `1.0 → 2.0, 3.0, 4.0, 5.0, 7.0, 9.0`: authenticated user ID and role context.
- `2.0 → D4 → 8.0`: asynchronous `property_created` event.
- `8.0 → Email Service`: new-listing email for active users.
- `6.0 → 8.0`: new post data for follower notifications.
- `7.0 → 8.0`: like, comment, comment-like, and follow notification data.
- `2.0 → 5.0`: available properties and search-log preferences.
- `3.0 → 5.0`: favourite-property preferences.

## Diagram prompt

```text
Create a DFD Level 1 for EstateHub. Include external entities User/Buyer, Agent, Admin,
Kafka, and Email Service. Include the ten processes 1.0 through 10.0 exactly as specified
in the accompanying table. Use separate stores D1 Django Database and D2 Property Database;
optionally show D3 Redis cache. Show D4 Kafka property_created topic from 2.0 Property
Management to 8.0 Notification Management, then an asynchronous email flow to Email Service.
Label arrows with data names. Show JWT-derived user and role context from 1.0 to protected
processes. Exclude chat and jobs.
```
