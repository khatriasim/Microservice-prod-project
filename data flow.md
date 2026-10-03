# EstateHub Data-Flow Diagram (DFD) Specification

Use this document to create EstateHub DFDs. It covers the implemented property, account, blog, and notification features only; **chat and job-search features are out of scope**.

## System boundary and data stores

EstateHub is a Next.js web application backed by two services behind a gateway:

- **Django notification service**: accounts, profiles, blog, social interactions, in-app notifications, and email tasks.
- **FastAPI property service**: property listings, favourites, bookings, search logs, and recommendations.
- **D1 — Django database**: users, user profiles, posts, categories, comments, likes, follows, and in-app notifications.
- **D2 — Property database**: properties, favourites, bookings, and search logs.
- **D3 — Redis cache**: cached blog-list results (supporting store; show only if the diagram needs technical detail).
- **D4 — Kafka topic: `property_created`**: event channel for newly created property listings.
- **D5 — Email service**: external delivery service used for OTP emails and new-listing emails.

The property database stores Django user IDs in property, booking, favourite, and search-log records. These are logical references authenticated from the shared JWT; they are not cross-database foreign keys.

External entities:

- **User/Buyer**: registers, signs in, searches listings, saves properties, books viewings, reads and interacts with blog content, and receives notifications.
- **Agent**: a signed-in user with `UserProfile.is_agent = true`; creates/manages listings and manages viewing status for their own properties.
- **Admin**: a staff user who manages users, posts, categories, and notification records from the Django dashboard.

## 1. DFD Level 0 — Context diagram

Draw one process only: **0.0 EstateHub Property Management System**. Do not show internal services or data stores at this level.

| External entity | Data sent to the system | Data returned by the system |
| --- | --- | --- |
| User/Buyer | registration/login data; profile updates; property search criteria; favourite commands; booking requests/cancellations; blog posts/comments/likes/follows; notification read actions | authentication/session result; account/profile data; property search and recommendation results; favourite list; booking status; blog content/feed; in-app notifications; email notifications/OTP |
| Agent | login/profile data; new or edited listing data; listing deletion request; viewing-status updates | authentication/session result; property-management result; agent listings; property-booking list and updated booking status; new-listing email delivery result occurs asynchronously to users |
| Admin | dashboard login; user/post/category/notification management commands | dashboard lists, totals, and management results |

Suggested diagram prompt:

```text
Create a DFD Level 0 context diagram for EstateHub. Put one central process named
"0.0 EstateHub Property Management System". Place three external entities around it:
User/Buyer, Agent, and Admin. Show bidirectional labelled data flows from User/Buyer
for credentials/profile data, property searches, favourites, bookings, blog interactions,
and notification actions; return sessions, listings/recommendations, favourites, booking
results, blog data, and notifications. Show Agent flows for credentials, listing CRUD, and
viewing-status updates; return managed listings and booking results. Show Admin flows for
dashboard management commands; return dashboard records and results. Exclude chat and jobs.
Do not show databases or microservices at Level 0.
```

## 2. DFD Level 1 — Main processes

Use the following processes inside the EstateHub system boundary. Show D1 and D2 as separate data stores. D3–D5 are optional technical stores/entities; include D4 and D5 to show the asynchronous new-listing email flow.

| No. | Process | Inputs | Reads/writes | Outputs |
| --- | --- | --- | --- | --- |
| 1.0 | User Authentication & Profile | registration, login, OTP verification/resend, password/profile changes | D1 Users and UserProfiles; D5 for OTP email | JWT/cookie session, account/profile result, OTP email |
| 2.0 | Property Management | agent listing create/update/delete; visitor/user search filters | D2 Properties; writes D4 after a new listing | listing CRUD result, available-property search results, property-created event |
| 3.0 | Favorite Management | authenticated user's add/remove/list favourite requests | D2 Favorites and Properties | favourite state/list with property details |
| 4.0 | Booking Management | viewing booking, cancellation, or agent status-update requests | D2 Bookings and Properties | booking confirmation, cancellation result, booking list, updated status |
| 5.0 | Recommendation Management | authenticated user recommendation request; prior search/favourite signals | D2 SearchLogs, Favorites, and Properties | ranked recommended properties |
| 6.0 | Blog Management | post create/edit/delete/list/detail; category assignments | D1 Posts, Categories, and post-category links; D3 cache for published-list reads | posts, post detail, category-filtered results, management result |
| 7.0 | Blog Interaction | comment, post like, comment like, follow/unfollow, feed request | D1 Comments, Likes, LikeComments, Follows; creates D1 Notifications for interaction events | interaction result, feed, updated counts; notification event data |
| 8.0 | Notification Management | notification-list/read actions; new-post notification events; new-property Kafka event | D1 Notifications; D4 event consumption; D5 email delivery | read/unread notification list/status; asynchronous new-listing emails |
| 9.0 | Agent Management | request for agents or an agent's own listings/viewing requests | D1 UserProfiles for agent role; D2 Properties and Bookings | agent directory/details, agent-owned listings, property viewing requests |
| 10.0 | Admin Management | staff dashboard commands for users, posts, categories, and notifications | D1 Users, Posts, Categories, Notifications | dashboard totals, lists, and create/edit/delete results |

Level-1 inter-process flows:

- `1.0 → 2.0/3.0/4.0/5.0/7.0/9.0`: authenticated user ID and role context from the JWT/session.
- `2.0 → 8.0`: new property event through D4 (Kafka); `8.0 → D5`: new-listing email request to active users.
- `6.0 → 8.0`: post publication causes new-post notifications for followers.
- `7.0 → 8.0`: likes, comments, comment likes, and follows create in-app notification data.
- `2.0 → 5.0`: searchable available property data; `3.0 → 5.0`: saved-property preferences; property searching in 2.0 writes D2 SearchLogs consumed by 5.0.
- `9.0` reads results owned by `2.0` and `4.0`; it does not introduce a separate agent database.

Suggested diagram prompt:

```text
Create a DFD Level 1 for EstateHub with external entities User/Buyer, Agent, Admin,
Kafka, and Email Service. Use processes: 1.0 User Authentication & Profile; 2.0 Property
Management; 3.0 Favorite Management; 4.0 Booking Management; 5.0 Recommendation
Management; 6.0 Blog Management; 7.0 Blog Interaction; 8.0 Notification Management;
9.0 Agent Management; and 10.0 Admin Management. Use separate stores D1 Django Database
(users, profiles, blog, social interactions, notifications) and D2 Property Database
(properties, favourites, bookings, search logs). Add D4 Kafka property_created topic between
Property Management and Notification Management, and an Email Service connected to
Notification Management. Label all flows with data, not generic verbs. Show authentication
context flowing from 1.0 to protected processes. Exclude chat and job features.
```

## 3. DFD Level 2 — Recommended detailed processes

Create Level 2 diagrams for the following complex flows. Each diagram should balance with its Level-1 parent: its external inputs and outputs must match the parent process.

### 3.1 Level 2 for 1.0 — User Authentication & Profile

| Subprocess | Data flow |
| --- | --- |
| 1.1 Register Account | User submits username, email, and password → validate credentials → create User in D1 → return registration result. |
| 1.2 Authenticate User | User submits credentials → validate against D1 Users → issue JWT/cookie session → return authenticated session. |
| 1.3 Verify Email / Resend OTP | User submits OTP or resend request → read/update D1 UserProfile verification state → send OTP through D5 when needed → return verification result. |
| 1.4 Manage Profile and Password | Authenticated user submits profile/password change → validate → update D1 User/UserProfile → return updated account data. |
| 1.5 Identify Agent Role | Read D1 UserProfile `is_agent` for protected property actions → return role/authorization context. |

### 3.2 Level 2 for 2.0 — Property Management

| Subprocess | Data flow |
| --- | --- |
| 2.1 Validate Agent | Listing request and session context → verify authenticated user/agent role → authorization decision. |
| 2.2 Create Property | Validated agent listing data → write D2 Properties with agent ID/name/email and `available` status → return listing record. |
| 2.3 Publish New-Property Event | Newly stored property data → publish `property_created` event to D4 Kafka. |
| 2.4 Search and View Properties | Visitor/user filters → read available properties from D2 → write D2 SearchLogs for authenticated filtered searches → return matching listings/details. |
| 2.5 Update or Delete Property | Agent change/delete request → verify the agent owns the listing → update/delete D2 Property → return result. |

### 3.3 Level 2 for 4.0 — Booking Management

| Subprocess | Data flow |
| --- | --- |
| 4.1 Create Booking Request | Buyer submits property ID and viewing date with session context. |
| 4.2 Validate Booking | Read D2 Properties to confirm property exists; read D2 Bookings to find an existing buyer/property booking. |
| 4.3 Store or Return Booking | If new, write pending booking with authenticated buyer ID to D2 Bookings; if duplicate, return the existing booking. |
| 4.4 Update Viewing Status | Agent submits booking ID/status → read booking/property → verify listing ownership → update D2 Bookings → return updated booking. |
| 4.5 Cancel Booking | Buyer submits booking ID → verify booking buyer ID → delete record from D2 Bookings → return cancellation result. |

**Implementation note:** booking creation, status changes, and cancellation do **not** currently produce booking notifications. Do not add a “send booking notification” subprocess unless it is labelled as a future requirement.

### 3.4 Level 2 for 5.0 — Recommendation Management

| Subprocess | Data flow |
| --- | --- |
| 5.1 Load Preference Signals | Authenticated user ID → read D2 SearchLogs and Favorites. |
| 5.2 Build Preference Profile | Aggregate city, property-type, bedroom, and price-range preferences from search and favourite data. |
| 5.3 Load Candidate Listings | Read available properties from D2 Properties. |
| 5.4 Score and Filter | Score candidates against the preference profile and exclude properties the user has already favourited. |
| 5.5 Return Ranked Results | Return limited, ranked property recommendations to the user. |

### 3.5 Level 2 for 6.0 and 7.0 — Blog content and interaction

**6.0 Blog Management:** validate author → create/update/delete or retrieve post → associate categories → read/write D1 Posts and Categories → invalidate/read D3 cache for published lists → return post data.

**7.0 Blog Interaction:** validate user → create comment, toggle post/comment like, or toggle follow → write D1 Comments/Likes/LikeComments/Follows → create D1 Notification for the affected author/followed user → return interaction result or feed.

### 3.6 Level 2 for 8.0 — Notification Management

| Subprocess | Data flow |
| --- | --- |
| 8.1 Create Social Notification | Receive blog like/comment/follow/new-post event → write recipient, sender, type, optional post to D1 Notifications. |
| 8.2 Retrieve Notifications | User notification request → read their D1 Notifications ordered by time → return notification list. |
| 8.3 Mark Notifications Read | User action → update unread D1 Notifications for that user → return success/status. |
| 8.4 Consume Listing Event | Read property-created message from D4 Kafka → pass property details to asynchronous email task. |
| 8.5 Send New-Listing Email | Read active user emails from D1 Users → send new-listing email through D5 Email Service. |

### 3.7 Level 2 for 10.0 — Admin Management

Admin session and management command → validate staff access → read dashboard counts/lists from D1 → create/update/delete users, posts, categories, or notifications in D1 → return dashboard page/result. Do not include job administration in this diagram.

## DFD consistency rules

- Show **data names** on arrows, such as “booking request”, “property record”, or “notification list”; avoid labels such as “processes” or “manages”.
- An external entity must not connect directly to a data store; route it through a process.
- Do not connect D1 and D2 directly. User identity crosses the boundary through JWT-derived user IDs.
- Show the property-created Kafka/email path as asynchronous.
- Keep DFD Level 0 to one process; do not place databases or internal processes in it.
- Exclude all chat objects, conversations, messages, job listings, job profiles, and job matches.
