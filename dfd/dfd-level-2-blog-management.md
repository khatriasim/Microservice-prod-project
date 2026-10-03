# EstateHub DFD Level 2 — 6.0 Blog Management

## Boundary flow

Input: authenticated post/category CRUD data or public post browse/detail/filter request.

Output: post/category management result, post data, and new-post notification data.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 6.1 | Validate Author or Admin | Receive session context → validate permission for create/edit/delete/category actions. |
| 6.2 | Create or Update Post | Receive post content, status, and category IDs → write D1 Posts and post-category association → return post data. |
| 6.3 | Retrieve Posts | Receive browse/search/author/category request → read published D1 Posts and Categories; optionally read/write D3 cache → return post list/detail. |
| 6.4 | Delete Post | Receive authorized delete request → remove post from D1 → invalidate D3 cache → return result. |
| 6.5 | Manage Categories | Receive authorized category CRUD request → read/write D1 Categories → return category result. |
| 6.6 | Emit New-Post Data | Receive newly created post → send post/follower event data to 8.0 Notification Management. |

Data stores: D1 Django Database (Posts, Categories, post-category links); optional D3 Redis Cache.
