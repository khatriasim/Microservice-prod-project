# EstateHub DFD Level 2 — 10.0 Admin Management

## Boundary flow

Input: staff dashboard login and user/post/category/notification management command.

Output: dashboard totals/lists and management result.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 10.1 | Validate Staff Access | Receive admin session → check staff status → permit or reject dashboard request. |
| 10.2 | Load Dashboard | Read D1 users, posts, categories, and notifications → calculate/display counts and recent records. |
| 10.3 | Manage Users | Receive authorized edit/delete request → read/write D1 Users → return management result. |
| 10.4 | Manage Posts and Categories | Receive authorized CRUD request → read/write D1 Posts and Categories → return management result. |
| 10.5 | Review Notifications | Read D1 Notifications → return notification records for dashboard review. |

Data store: D1 Django Database. Chat and job administration are intentionally excluded.
