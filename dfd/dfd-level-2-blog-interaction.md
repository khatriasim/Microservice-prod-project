# EstateHub DFD Level 2 — 7.0 Blog Interaction

## Boundary flow

Input: authenticated comment, post-like, comment-like, follow/unfollow, or feed request.

Output: interaction result, updated counts/feed, and social-notification data.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 7.1 | Create Comment | Receive post ID/content and user context → write D1 Comment → send comment event to 8.0. |
| 7.2 | Toggle Post Like | Receive post ID and user context → create/delete D1 Like → send like event to 8.0 when created → return state/count. |
| 7.3 | Toggle Comment Like | Receive comment ID and user context → create/delete D1 LikeComment → send comment-like event to 8.0 when created → return state/count. |
| 7.4 | Toggle Follow | Receive target user and user context → create/delete D1 Follow → send follow event to 8.0 when created → return state. |
| 7.5 | Build Feed | Receive user context → read D1 Follows and published D1 Posts → return posts from followed authors. |

Data store: D1 Django Database (Comments, Likes, LikeComments, Follows, Posts).
