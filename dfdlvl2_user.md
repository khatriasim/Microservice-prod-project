# EstateHub DFD Level 2 — User-Facing Processes

Use this document to create DFD Level 2 diagrams for user-facing flows. Each diagram balances with its Level-1 parent: external inputs and outputs must match the parent process.

## Data stores referenced

- **D1 — Django database**: users, user profiles, posts, categories, comments, likes, follows, notifications.
- **D2 — Property database**: properties, favourites, bookings, search logs.
- **D3 — Redis cache**: cached blog-list results (optional technical detail).
- **D4 — Kafka topic: `property_created`**: event channel for newly created property listings.
- **D5 — Email service**: external delivery for OTP and new-listing emails.

## 2.1 Level 2 for 1.0 — User Authentication & Profile

| Subprocess | Data flow |
| --- | --- |
| 1.1 Register Account | User submits username, email, password → validate credentials → create User in D1 → return registration result. |
| 1.2 Authenticate User | User submits credentials → validate against D1 Users → issue JWT/cookie session → return authenticated session. |
| 1.3 Verify Email / Resend OTP | User submits OTP or resend request → read/update D1 UserProfile verification state → send OTP through D5 when needed → return verification result. |
| 1.4 Manage Profile and Password | Authenticated user submits profile/password change → validate → update D1 User/UserProfile → return updated account data. |
| 1.5 Identify Agent Role | Read D1 UserProfile `is_agent` for protected property actions → return role/authorization context. |

External interfaces: User/Buyer, Agent, Admin. Data stores: D1, D5.

## 2.2 Level 2 for 2.0 — Property Management

| Subprocess | Data flow |
| --- | --- |
| 2.1 Validate Agent | Listing request and session context → verify authenticated user/agent role → authorization decision. |
| 2.2 Create Property | Validated agent listing data → write D2 Properties with agent ID/name/email and `available` status → return listing record. |
| 2.3 Publish New-Property Event | Newly stored property data → publish `property_created` event to D4 Kafka. |
| 2.4 Search and View Properties | Visitor/user filters → read available properties from D2 → write D2 SearchLogs for authenticated filtered searches → return matching listings/details. |
| 2.5 Update or Delete Property | Agent change/delete request → verify the agent owns the listing → update/delete D2 Property → return result. |

External interfaces: Agent, User/Buyer. Data stores: D2, D4.

## 2.3 Level 2 for 3.0 — Favorite Management

| Subprocess | Data flow |
| --- | --- |
| 3.1 Add / Remove Favorite | Authenticated user submits add/remove → verify property exists → write/delete D2 Favorite record → return favourite state. |
| 3.2 List Favourites | Authenticated user requests list → read D2 Favorites and D2 Properties → return favourite list with property details. |

External interfaces: User/Buyer. Data stores: D2.

## 2.4 Level 2 for 4.0 — Booking Management

| Subprocess | Data flow |
| --- | --- |
| 4.1 Create Booking Request | Buyer submits property ID and viewing date with session context. |
| 4.2 Validate Booking | Read D2 Properties to confirm property exists; read D2 Bookings to find an existing buyer/property booking. |
| 4.3 Store or Return Booking | If new, write pending booking with authenticated buyer ID to D2 Bookings; if duplicate, return the existing booking. |
| 4.4 Update Viewing Status | Agent submits booking ID/status → read booking/property → verify listing ownership → update D2 Bookings → return updated booking. |
| 4.5 Cancel Booking | Buyer submits booking ID → verify booking buyer ID → delete record from D2 Bookings → return cancellation result. |

External interfaces: User/Buyer, Agent. Data stores: D2.

**Implementation note:** booking creation, status changes, and cancellation do **not** currently produce booking notifications. Do not add a "send booking notification" subprocess unless labelled as a future requirement.

## 2.5 Level 2 for 5.0 — Recommendation Management

| Subprocess | Data flow |
| --- | --- |
| 5.1 Load Preference Signals | Authenticated user ID → read D2 SearchLogs and Favorites. |
| 5.2 Build Preference Profile | Aggregate city, property-type, bedroom, and price-range preferences from search and favourite data. |
| 5.3 Load Candidate Listings | Read available properties from D2 Properties. |
| 5.4 Score and Filter | Score candidates against the preference profile and exclude properties the user has already favourited. |
| 5.5 Return Ranked Results | Return limited, ranked property recommendations to the user. |

External interfaces: User/Buyer. Data stores: D2.

## 2.6 Level 2 for 6.0 — Blog Management

Validate author → create/update/delete or retrieve post → associate categories → read/write D1 Posts and Categories → invalidate/read D3 cache for published-list reads → return post data.

External interfaces: User/Buyer, Admin. Data stores: D1, D3.

## 2.7 Level 2 for 7.0 — Blog Interaction

Validate user → create comment, toggle post/comment like, or toggle follow → write D1 Comments/Likes/LikeComments/Follows → create D1 Notification for the affected author/followed user → return interaction result or feed.

External interfaces: User/Buyer. Data stores: D1.

## 2.8 Level 2 for 8.0 — Notification Management

| Subprocess | Data flow |
| --- | --- |
| 8.1 Create Social Notification | Receive blog like/comment/follow/new-post event → write recipient, sender, type, optional post to D1 Notifications. |
| 8.2 Retrieve Notifications | User notification request → read their D1 Notifications ordered by time → return notification list. |
| 8.3 Mark Notifications Read | User action → update unread D1 Notifications for that user → return success/status. |
| 8.4 Consume Listing Event | Read property-created message from D4 Kafka → pass property details to asynchronous email task. |
| 8.5 Send New-Listing Email | Read active user emails from D1 Users → send new-listing email through D5 Email Service. |

External interfaces: User/Buyer, Agent, Kafka, Email Service. Data stores: D1, D4, D5.

## Diagram consistency rules

- Show **data names** on arrows, such as "booking request", "property record", or "notification list"; avoid labels such as "processes" or "manages".
- An external entity must not connect directly to a data store; route it through a process.
- Do not connect D1 and D2 directly. User identity crosses the boundary through JWT-derived user IDs.
- Show the property-created Kafka/email path as asynchronous.
- Keep DFD Level 0 to one process; do not place databases or internal processes in it.
- Exclude all chat objects, conversations, messages, job listings, job profiles, and job matches.
