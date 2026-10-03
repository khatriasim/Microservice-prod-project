# EstateHub DFD Level 0 — Context Diagram

## Scope

Show EstateHub as one process only. Include property, account, blog, and notification features. Exclude chat and job features.

## Central process

`0.0 EstateHub Property Management System`

## External entities and flows

| Entity | Data sent to the system | Data received from the system |
| --- | --- | --- |
| User / Buyer | registration and login data; profile updates; property searches; favourite actions; viewing bookings/cancellations; blog interactions; notification read actions | account/session result; profile data; listings and recommendations; favourite list; booking status; blog content/feed; in-app notifications; OTP and new-listing emails |
| Agent | login/profile data; property create/update/delete data; booking status updates | account/session result; listing-management result; agent listings; viewing requests and updated statuses |
| Admin | dashboard login; user, post, category, and notification management commands | dashboard records, counts, and management results |

## Diagram prompt

```text
Create a DFD Level 0 context diagram for EstateHub. Use one central process named
"0.0 EstateHub Property Management System". Connect the external entities User/Buyer,
Agent, and Admin to it with labelled bidirectional data flows. User/Buyer sends credentials,
profile data, property search criteria, favourite actions, booking requests, blog interactions,
and notification actions; receives session/profile results, listings/recommendations, favourites,
booking results, blog data, notifications, and email messages. Agent sends listing CRUD data and
viewing-status updates; receives managed-listing and viewing results. Admin sends dashboard
management commands and receives dashboard records/results. Exclude internal databases,
microservices, chat, and jobs.
```
