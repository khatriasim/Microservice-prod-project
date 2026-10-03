# EstateHub DFD Level 2 — Agent Management (9.0)

Use this document to create the DFD Level 2 diagram for process **9.0 Agent Management**. It balances with its Level-1 parent: external inputs and outputs must match the parent process.

## Data stores referenced

- **D1 — Django database**: users, user profiles (agent role), posts, categories, comments, likes, follows, notifications.
- **D2 — Property database**: properties, bookings.

## Level 2 for 9.0 — Agent Management

| Subprocess | Data flow |
| --- | --- |
| 9.1 Request Agent Directory | User/Buyer requests agent listing → read D1 UserProfiles where `is_agent = true` → return agent directory. |
| 9.2 View Agent Details | User/Buyer requests a specific agent → read D1 UserProfile → return agent details (name, email, role, profile image). |
| 9.3 Request Agent-Owned Listings | Agent requests own listings → read D2 Properties where `agent_user_id` matches authenticated agent → return agent-owned property list. |
| 9.4 Request Property Viewing Requests | Agent requests viewing requests for their properties → read D2 Bookings joined to D2 Properties owned by the agent → return property viewing request list with updated booking status. |

## Inter-process flows

- `1.0 → 9.0`: authenticated user ID and role context from the JWT/session.
- `2.0 → 9.0`: property records owned by the agent from D2 Properties.
- `4.0 → 9.0`: booking records for the agent's properties from D2 Bookings.

**Note:** `9.0` reads results owned by `2.0` (Property Management) and `4.0` (Booking Management); it does not introduce a separate agent database.

## External interfaces

- **User/Buyer**: agent directory search, agent details view.
- **Agent**: own listings list, property viewing requests list.

## Data stores

- **D1** — Django database (UserProfiles for agent role).
- **D2** — Property database (Properties, Bookings).

## Diagram consistency rules

- Show **data names** on arrows, such as "agent directory", "agent details", "agent-owned listings", "property viewing requests"; avoid labels such as "processes" or "manages".
- An external entity must not connect directly to a data store; route it through a process.
- Do not connect D1 and D2 directly. User identity crosses the boundary through JWT-derived user IDs.
- Show the property-created Kafka/email path as asynchronous.
- Exclude all chat objects, conversations, messages, job listings, job profiles, and job matches.
