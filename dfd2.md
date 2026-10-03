# EstateHub DFD Level 2 — User and Agent Flows

This file contains the data needed to create the final EstateHub DFD Level 2 diagram for **User/Buyer** and **Agent** activities.

The diagram may be drawn as one large diagram with two external-entity swimlanes, or as two balanced diagrams:

1. **User/Buyer DFD Level 2**
2. **Agent DFD Level 2**

The Admin dashboard, chat, and job-search features are excluded.

## 1. External entities

### User/Buyer

A User/Buyer can:

- Register an account
- Log in
- Verify email / request an OTP
- Update profile and password
- Search and view available properties
- Save and remove favourite properties
- Request, view, and cancel property viewings
- Request property recommendations
- View blog posts and categories
- Comment on posts
- Like posts and comments
- Follow or unfollow users
- View and mark notifications as read
- View the agent directory and agent details

### Agent

An Agent is a signed-in user whose `UserProfile.is_agent` value is `true`.

An Agent can:

- Use all applicable User/Buyer capabilities
- Create property listings
- Update property listings
- Delete property listings
- Search and view properties
- View viewing requests for their own properties
- Update the status of viewing requests for their own properties
- View their own property listings
- View agent directory information

The Agent role is identified through the authenticated user ID and `UserProfile.is_agent` flag.

## 2. Data stores and external services

| ID | Name | Data stored or handled |
| --- | --- | --- |
| D1 | Django Database | Users, user profiles, posts, categories, comments, likes, comment likes, follows, and in-app notifications |
| D2 | Property Database | Properties, favourites, bookings, and search logs |
| D3 | Redis Cache | Cached published blog-list results; optional technical detail |
| D4 | Kafka `property_created` topic | New-property events published after an agent creates a property |
| D5 | Email Service | OTP emails and asynchronous new-listing emails |

The property database stores Django user IDs in `agent_user_id`, `buyer_id`, `favorite.user_id`, and `search_log.user_id`. These are logical references validated through the authenticated JWT/session; they are not cross-database foreign keys.

## 3. Shared authentication and profile flow

These processes support both User/Buyer and Agent activity.

| Process | Input | Processing and data-store flow | Output |
| --- | --- | --- | --- |
| 1.1 Register Account | Registration data: username, email, password | Validate credentials; create a User record in D1 | Registration result |
| 1.2 Authenticate User | Login credentials | Validate credentials against D1 Users; create JWT or cookie session | JWT/cookie session |
| 1.3 Verify Email / Resend OTP | OTP verification request or resend request | Read/update email-verification state in D1 UserProfile; send OTP through D5 when needed | Verification result and OTP email |
| 1.4 Manage Profile and Password | Authenticated profile or password change | Validate the session; update D1 User and/or UserProfile | Updated account data |
| 1.5 Identify Agent Role | Authenticated user ID | Read `UserProfile.is_agent` from D1; return user role and authorization context | User ID, role, and authorization context |

### Authentication outputs used by other processes

- `1.2 → 1.5`: authenticated user ID and session context
- `1.5 → 2.1`: agent authorization context
- `1.5 → 3.1`: authenticated buyer ID
- `1.5 → 4.1`: authenticated buyer ID
- `1.5 → 5.1`: authenticated recommendation-user ID
- `1.5 → 6.1`: authenticated blog-author ID
- `1.5 → 7.1`: authenticated interaction-user ID
- `1.5 → 8.2`: authenticated notification-recipient ID
- `1.5 → 9.3`: authenticated agent ID
- `1.5 → 9.4`: authenticated agent ID

## 4. User/Buyer property and viewing flows

### 4.1 Search and view properties — process 2.4

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 2.4a | User/Buyer → 2.4 Search and View Properties | Search filters: city, price range, bedrooms, property type |
| 2.4b | 2.4 → D2 Property Database | Available-property query |
| 2.4c | D2 → 2.4 | Matching property records |
| 2.4d | 2.4 → D2 | Authenticated search criteria as a SearchLog |
| 2.4e | 2.4 → User/Buyer | Matching listings and property details |

An authenticated user's search criteria are written to D2 `SearchLog`. A visitor may search without creating a search log.

### 4.2 Add or remove a favourite — processes 3.1 and 3.2

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 3.1a | User/Buyer → 3.1 Add / Remove Favourite | Favourite command: user ID and property ID |
| 3.1b | 3.1 → D2 Property Database | Property existence and ownership check |
| 3.1c | 3.1 → D2 | Create or delete Favourite record |
| 3.1d | 3.1 → User/Buyer | Updated favourite state |
| 3.2a | User/Buyer → 3.2 List Favourites | Favourite-list request and authenticated user ID |
| 3.2b | 3.2 → D2 | Favourite records and related Property records |
| 3.2c | 3.2 → User/Buyer | Favourite list with property details |

### 4.3 Create or retrieve a viewing booking — processes 4.1, 4.2, and 4.3

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 4.1a | User/Buyer → 4.1 Create Booking Request | Booking request: property ID, viewing date, authenticated buyer ID |
| 4.2a | 4.1 → 4.2 Validate Booking | Booking validation request |
| 4.2b | 4.2 → D2 Property Database | Property existence and availability check |
| 4.2c | 4.2 → D2 Property Database | Existing buyer/property booking check |
| 4.3a | 4.2 → 4.3 Store or Return Booking | New-booking decision or existing-booking record |
| 4.3b | 4.3 → D2 | New pending Booking record, only when no duplicate exists |
| 4.3c | 4.3 → User/Buyer | New booking confirmation or existing booking details |

### 4.4 Cancel a booking — process 4.5

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 4.5a | User/Buyer → 4.5 Cancel Booking | Cancellation request: booking ID and authenticated buyer ID |
| 4.5b | 4.5 → D2 Property Database | Verify the booking belongs to the buyer |
| 4.5c | 4.5 → D2 | Delete the buyer's Booking record |
| 4.5d | 4.5 → User/Buyer | Cancellation result |

Booking creation, status changes, and cancellation do not currently create booking notifications. Do not add a booking-notification process unless it is labelled as a future requirement.

## 5. User/Buyer recommendation flow — process 5.0

| Process | Input | Data-store flow | Output |
| --- | --- | --- | --- |
| 5.1 Load Preference Signals | Authenticated user ID | Read D2 SearchLogs and Favourites | Search and favourite preference signals |
| 5.2 Build Preference Profile | Search and favourite signals | Aggregate city, property type, bedroom, and price-range preferences | User preference profile |
| 5.3 Load Candidate Listings | User preference profile | Read available properties from D2 Properties | Candidate property records |
| 5.4 Score and Filter | Preference profile and candidate properties | Score candidates; exclude properties already favourited | Ranked candidate list |
| 5.5 Return Ranked Results | Ranked candidate list | — | Limited property recommendations |

Flow sequence:

`User/Buyer → 5.1 → 5.2 → 5.3 → 5.4 → 5.5 → User/Buyer`

Data-store sequence:

`D2 SearchLogs + D2 Favourites → D2 Properties → ranked recommendations`

## 6. User/Buyer blog-content and interaction flows

### 6.1 Blog Management — process 6.0

| Subprocess | Data flow |
| --- | --- |
| 6.1 Create Post | Authenticated author submits post title, content, status, and categories → validate author → write D1 Post and post-category associations → return created post |
| 6.2 Update Post | Authenticated author submits post changes → verify authorship → update D1 Post and category associations → return updated post |
| 6.3 Delete Post | Authenticated author submits delete request → verify authorship → delete D1 Post and related associations → return deletion result |
| 6.4 Retrieve Posts | User requests a post list, post detail, or category-filtered list → read D1 Posts, Categories, and post-category links; optionally read D3 cache → return blog content |
| 6.5 Invalidate Blog Cache | Published-post create/update/delete changes D1 content → invalidate affected D3 cache entries → return cache result |

Main flows:

- `User/Buyer → 6.1/6.2/6.3`: post create, update, or delete request
- `6.1/6.2/6.3 → D1`: post and category data
- `User/Buyer → 6.4`: blog list/detail/category request
- `6.4 → D1/D3`: blog content and cached list data
- `6.4 → User/Buyer`: posts, post details, and category-filtered results

### 6.2 Blog Interaction — process 7.0

| Subprocess | Data flow |
| --- | --- |
| 7.1 Comment on Post | Authenticated user submits post ID and comment content → write D1 Comment → create notification event for the post author |
| 7.2 Like Post | Authenticated user submits post ID → create or remove D1 Like → create notification event for the post author |
| 7.3 Like Comment | Authenticated user submits comment ID → create or remove D1 LikeComment → create notification event for the comment author |
| 7.4 Follow or Unfollow User | Authenticated user submits target user ID → create or remove D1 Follow → create notification event for the followed user when following |
| 7.5 View Interaction Feed | Authenticated user requests feed → read relevant D1 Posts, Comments, Likes, and Follows → return feed data |

Main flows:

- `User/Buyer → 7.1/7.2/7.3/7.4`: comment, like, comment-like, follow, or unfollow request
- `7.1/7.2/7.3/7.4 → D1`: interaction records
- `7.1/7.2/7.3/7.4 → 8.1`: notification event data
- `User/Buyer → 7.5`: feed request
- `7.5 → D1`: interaction and content data
- `7.5 → User/Buyer`: interaction feed

## 7. Notification flows

### 7.1 Social notifications — process 8.1

| Input | Processing | Output |
| --- | --- | --- |
| Blog like, comment, comment-like, follow, or new-post event | Validate sender and recipient; write recipient, sender, notification type, optional post ID, and timestamp to D1 Notifications | In-app notification record |

### 7.2 Retrieve and read notifications — processes 8.2 and 8.3

| Process | Data flow |
| --- | --- |
| 8.2 Retrieve Notifications | User/Buyer or Agent sends notification-list request with authenticated user ID → read that user's D1 Notifications ordered by creation time → return unread/read notification list |
| 8.3 Mark Notifications Read | User/Buyer or Agent sends read action → update unread D1 Notifications for that user → return updated read status |

## 8. Agent property-management flow

### 8.1 Validate agent and create a property — processes 2.1, 2.2, and 2.3

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 2.1a | Agent → 2.1 Validate Agent | Listing request and authenticated session |
| 2.1b | 2.1 → D1 Django Database | Read `UserProfile.is_agent` |
| 2.1c | 2.1 → 2.2 Create Property | Agent authorization decision |
| 2.2a | 2.2 → D2 Property Database | New property record with agent ID, agent name, agent email, listing data, and `available` status |
| 2.2b | D2 → 2.2 | Stored property record |
| 2.2c | 2.2 → Agent | Listing creation result |
| 2.3a | 2.2 → 2.3 Publish New-Property Event | Newly stored property data |
| 2.3b | 2.3 → D4 Kafka `property_created` | Property-created event |

### 8.2 Update or delete a property — process 2.5

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 2.5a | Agent → 2.5 Update or Delete Property | Property ID, requested changes or delete command, authenticated agent ID |
| 2.5b | 2.5 → D2 Property Database | Verify the property exists and belongs to the agent |
| 2.5c | 2.5 → D2 | Updated property record or delete operation |
| 2.5d | 2.5 → Agent | Update or deletion result |

### 8.3 View agent-owned listings — process 9.3

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 9.3a | Agent → 9.3 List Agent-Owned Listings | Authenticated agent ID and own-listings request |
| 9.3b | 9.3 → D2 Property Database | Query properties where `agent_user_id` equals the authenticated agent ID |
| 9.3c | D2 → 9.3 | Agent-owned property records |
| 9.3d | 9.3 → Agent | Agent-owned listing list |

### 8.4 View and update property viewing requests — processes 9.4 and 4.4

| Flow | Source → destination | Data label |
| --- | --- | --- |
| 9.4a | Agent → 9.4 List Property Viewing Requests | Authenticated agent ID and viewing-request list request |
| 9.4b | 9.4 → D2 Property Database | Agent-owned property records |
| 9.4c | 9.4 → D2 Property Database | Booking records whose property belongs to the agent |
| 9.4d | D2 → 9.4 | Property viewing request list |
| 9.4e | 9.4 → Agent | Viewing requests and current booking status |
| 4.4a | Agent → 4.4 Update Viewing Status | Booking ID, new status, authenticated agent ID |
| 4.4b | 4.4 → D2 Property Database | Verify property ownership and booking relationship |
| 4.4c | 4.4 → D2 | Updated Booking status |
| 4.4d | 4.4 → Agent | Updated booking/viewing request |

## 9. Agent directory flow available to User/Buyer

| Process | Data flow |
| --- | --- |
| 9.1 Find Agents | User/Buyer requests agent directory → read D1 UserProfiles where `is_agent = true` → return agent directory |
| 9.2 View Agent Details | User/Buyer requests a specific agent → read the agent's D1 UserProfile → return agent name, email, role, and profile image |

## 10. Asynchronous new-listing email flow

This flow begins when an Agent creates a property.

`Agent → 2.1 Validate Agent → 2.2 Create Property → D2 Properties`

`2.2 → 2.3 Publish New-Property Event → D4 Kafka property_created`

`D4 → 8.4 Consume Listing Event → property details`

`8.4 → 8.5 Send New-Listing Email`

`8.5 → D1 Users`: read active user email addresses

`8.5 → D5 Email Service`: new-listing email request

`D5 → User/Buyer and Agent`: delivered new-listing email

Show D4 and D5 as asynchronous flows. Do not draw D1 and D2 as directly connected.

## 11. Complete process list for the final diagram

### User/Buyer processes

- 1.1 Register Account
- 1.2 Authenticate User
- 1.3 Verify Email / Resend OTP
- 1.4 Manage Profile and Password
- 1.5 Identify Agent Role
- 2.4 Search and View Properties
- 3.1 Add / Remove Favourite
- 3.2 List Favourites
- 4.1 Create Booking Request
- 4.2 Validate Booking
- 4.3 Store or Return Booking
- 4.5 Cancel Booking
- 5.1 Load Preference Signals
- 5.2 Build Preference Profile
- 5.3 Load Candidate Listings
- 5.4 Score and Filter
- 5.5 Return Ranked Results
- 6.1 Create Post
- 6.2 Update Post
- 6.3 Delete Post
- 6.4 Retrieve Posts
- 6.5 Invalidate Blog Cache
- 7.1 Comment on Post
- 7.2 Like Post
- 7.3 Like Comment
- 7.4 Follow or Unfollow User
- 7.5 View Interaction Feed
- 8.1 Create Social Notification
- 8.2 Retrieve Notifications
- 8.3 Mark Notifications Read
- 9.1 Find Agents
- 9.2 View Agent Details

### Agent processes

- 1.1 Register Account
- 1.2 Authenticate User
- 1.3 Verify Email / Resend OTP
- 1.4 Manage Profile and Password
- 1.5 Identify Agent Role
- 2.1 Validate Agent
- 2.2 Create Property
- 2.3 Publish New-Property Event
- 2.4 Search and View Properties
- 2.5 Update or Delete Property
- 3.1 Add / Remove Favourite
- 3.2 List Favourites
- 4.1 Create Booking Request
- 4.2 Validate Booking
- 4.3 Store or Return Booking
- 4.4 Update Viewing Status
- 4.5 Cancel Booking
- 5.1 Load Preference Signals
- 5.2 Build Preference Profile
- 5.3 Load Candidate Listings
- 5.4 Score and Filter
- 5.5 Return Ranked Results
- 6.1 Create Post
- 6.2 Update Post
- 6.3 Delete Post
- 6.4 Retrieve Posts
- 6.5 Invalidate Blog Cache
- 7.1 Comment on Post
- 7.2 Like Post
- 7.3 Like Comment
- 7.4 Follow or Unfollow User
- 7.5 View Interaction Feed
- 8.1 Create Social Notification
- 8.2 Retrieve Notifications
- 8.3 Mark Notifications Read
- 9.3 List Agent-Owned Listings
- 9.4 List Property Viewing Requests

## 12. Diagram-generation prompt

```text
Create one final EstateHub DFD Level 2 diagram showing what a User/Buyer and an Agent can do in the system.

Use two external entities: User/Buyer on the left and Agent below it. Put the numbered processes in the centre. Put data stores D1 Django Database, D2 Property Database, D3 Redis Cache, D4 Kafka property_created, and D5 Email Service on the right.

Show the shared authentication flow first:
User/Buyer and Agent send registration data, login credentials, OTP requests, and profile/password changes to processes 1.1–1.4. Process 1.2 returns a JWT/cookie session. Process 1.5 reads UserProfile.is_agent from D1 and sends authenticated user ID, agent role, and authorization context to protected processes.

Show User/Buyer flows for property search (2.4), favourites (3.1–3.2), booking creation/validation/storage/cancellation (4.1–4.3 and 4.5), recommendations (5.1–5.5), blog management (6.1–6.5), blog interactions (7.1–7.5), notification retrieval and read actions (8.2–8.3), and agent directory/detail views (9.1–9.2).

Show Agent flows for agent validation (2.1), property create/update/delete (2.2–2.5), viewing-request listing (9.4), viewing-status update (4.4), and own-listing listing (9.3). Agent creation of a property must publish a property_created event to D4 Kafka. D4 must feed process 8.4, which passes property details to 8.5. Process 8.5 reads active user emails from D1 and sends new-listing emails through D5.

Show blog likes, comments, comment likes, follows, and new-post events flowing into 8.1 Create Social Notification. 8.1 writes notification records to D1. 8.2 reads those records for the authenticated user, and 8.3 updates their unread/read state.

Label every arrow with the data being transferred, not a generic verb. Route every external entity-to-store connection through a process. Do not connect D1 directly to D2. Show the Kafka and email path as asynchronous. Exclude Admin, chat, conversations, messages, job listings, job profiles, and job matches.
```

## 13. DFD consistency rules

- Use data names on arrows, such as `registration data`, `property search filters`, `booking request`, `property record`, `notification event`, and `new-listing email`.
- Do not connect an external entity directly to a data store.
- Do not connect D1 and D2 directly.
- Show JWT-derived user identity and role context crossing the service boundary.
- Show the `property_created` Kafka event and email delivery as asynchronous.
- Keep chat and job-search features out of the diagram.
