# EstateHub DFD Level 2 — 8.0 Notification Management

## Boundary flow

Input: notification list/read action, social/blog notification event, or `property_created` Kafka event.

Output: in-app notification list/read result or asynchronous new-property email.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 8.1 | Create Social Notification | Receive like, comment, comment-like, follow, or new-post event → write recipient, sender, type, and optional post to D1 Notifications. |
| 8.2 | Retrieve Notifications | Receive user notification request → read that user's D1 Notifications ordered by creation time → return list. |
| 8.3 | Mark Notifications Read | Receive user read action → update unread D1 Notifications for that user → return status. |
| 8.4 | Consume Listing Event | Receive property record from D4 Kafka `property_created` topic → pass data to asynchronous email task. |
| 8.5 | Send New-Listing Email | Read active user email addresses from D1 Users → send property details through Email Service. |

Data stores: D1 Django Database (Notifications and Users); D4 Kafka `property_created` topic. External entity: Email Service.
