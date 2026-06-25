# API Design

## DevFlow — REST API Specification

**Base URL:** `/api/v1`  
**Auth:** All endpoints require Bearer token (Clerk JWT) unless marked `[Public]`.  
**Content-Type:** `application/json`

---

## 1. Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Success (Paginated)

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [
      { "field": "title", "message": "Required" }
    ]
  }
}
```

---

## 2. Authentication & Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/clerk` | [Public] Clerk webhook for user sync (user.created, user.updated, user.deleted) |

Clerk handles all auth flows (login, signup, OAuth). The API only verifies JWTs and syncs user data via webhooks.

---

## 3. Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile (includes profile, preferences, connected accounts) |
| PATCH | `/users/me` | Update profile (displayName, bio, skills, githubUsername, leetcodeUsername, portfolioUrl) |
| PATCH | `/users/me/preferences` | Update preferences (theme, notification settings) |
| GET | `/users/me/workspaces` | List workspaces the current user belongs to |
| GET | `/users/:userId` | Get public profile of a user (within shared workspace) |
| PATCH | `/users/me/onboarding` | Mark onboarding as completed |
| PATCH | `/users/me/avatar` | Upload/update avatar (multipart/form-data) |

---

## 4. Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces` | Create a new workspace |
| GET | `/workspaces/:workspaceId` | Get workspace details |
| PATCH | `/workspaces/:workspaceId` | Update workspace (name, description, icon, settings) |
| DELETE | `/workspaces/:workspaceId` | Soft delete workspace (owner only) |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:workspaceId/members` | List workspace members |
| POST | `/workspaces/:workspaceId/members/invite` | Invite member by email |
| PATCH | `/workspaces/:workspaceId/members/:memberId` | Change member role |
| DELETE | `/workspaces/:workspaceId/members/:memberId` | Remove member |
| POST | `/workspaces/:workspaceId/members/leave` | Leave workspace |

### Audit Log

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:workspaceId/audit-log` | Get audit log (admin+) |

**Query params:** `?page=1&limit=20&entityType=task&action=created`

---

## 5. Projects

All project endpoints are scoped to a workspace.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:workspaceId/projects` | Create project |
| GET | `/workspaces/:workspaceId/projects` | List projects |
| GET | `/workspaces/:workspaceId/projects/:projectId` | Get project details |
| PATCH | `/workspaces/:workspaceId/projects/:projectId` | Update project |
| DELETE | `/workspaces/:workspaceId/projects/:projectId` | Soft delete project |

### Project Statuses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/projects/:pId/statuses` | Add status column |
| PATCH | `/workspaces/:wId/projects/:pId/statuses/:statusId` | Update status |
| DELETE | `/workspaces/:wId/projects/:pId/statuses/:statusId` | Delete status |
| PATCH | `/workspaces/:wId/projects/:pId/statuses/reorder` | Reorder statuses |

### Project Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/projects/:pId/labels` | Add label |
| PATCH | `/workspaces/:wId/projects/:pId/labels/:labelId` | Update label |
| DELETE | `/workspaces/:wId/projects/:pId/labels/:labelId` | Delete label |

---

## 6. Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/projects/:pId/tasks` | Create task |
| GET | `/workspaces/:wId/projects/:pId/tasks` | List tasks (with filters) |
| GET | `/workspaces/:wId/projects/:pId/tasks/:taskId` | Get task details |
| PATCH | `/workspaces/:wId/projects/:pId/tasks/:taskId` | Update task |
| DELETE | `/workspaces/:wId/projects/:pId/tasks/:taskId` | Soft delete task |
| PATCH | `/workspaces/:wId/projects/:pId/tasks/reorder` | Reorder tasks (drag & drop) |
| POST | `/workspaces/:wId/projects/:pId/tasks/bulk` | Bulk update tasks |

**Task list query params:**
```
?status=<statusId>
&priority=urgent,high
&assignee=<userId>
&label=<labelId>
&dueDate=overdue|today|week
&search=<query>
&sort=createdAt|dueDate|priority
&order=asc|desc
&page=1
&limit=50
```

### Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `.../:taskId/subtasks` | Add subtask |
| PATCH | `.../:taskId/subtasks/:subtaskId` | Update subtask |
| DELETE | `.../:taskId/subtasks/:subtaskId` | Delete subtask |
| PATCH | `.../:taskId/subtasks/reorder` | Reorder subtasks |

### Task Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `.../:taskId/comments` | List comments |
| POST | `.../:taskId/comments` | Add comment |
| PATCH | `.../:taskId/comments/:commentId` | Edit comment |
| DELETE | `.../:taskId/comments/:commentId` | Delete comment |

### Task Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `.../:taskId/activities` | Get task activity log |

### Task Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `.../:taskId/attachments` | Upload attachment |
| DELETE | `.../:taskId/attachments/:attachmentId` | Delete attachment |

---

## 7. Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/documents` | Create document |
| GET | `/workspaces/:wId/documents` | List documents (tree structure) |
| GET | `/workspaces/:wId/documents/:docId` | Get document |
| PATCH | `/workspaces/:wId/documents/:docId` | Update document |
| DELETE | `/workspaces/:wId/documents/:docId` | Soft delete document |
| PATCH | `/workspaces/:wId/documents/:docId/move` | Move document (change parent) |
| PATCH | `/workspaces/:wId/documents/reorder` | Reorder documents |

### Document Versions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `.../:docId/versions` | List versions |
| GET | `.../:docId/versions/:versionId` | Get specific version |
| POST | `.../:docId/versions/:versionId/restore` | Restore version |

### Document Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:wId/documents/search?q=<query>` | Full-text search |

---

## 8. Code Snippets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/snippets` | Create snippet |
| GET | `/workspaces/:wId/snippets` | List snippets (with filters) |
| GET | `/workspaces/:wId/snippets/:snippetId` | Get snippet |
| PATCH | `/workspaces/:wId/snippets/:snippetId` | Update snippet |
| DELETE | `/workspaces/:wId/snippets/:snippetId` | Soft delete snippet |
| POST | `/workspaces/:wId/snippets/:snippetId/favorite` | Toggle favorite |

**Snippet list query params:**
```
?visibility=personal|team
&language=javascript
&tag=react
&folder=<folderId>
&search=<query>
&favorites=true
&sort=createdAt|title
&page=1
&limit=20
```

### Snippet Folders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/snippet-folders` | Create folder |
| GET | `/workspaces/:wId/snippet-folders` | List folders |
| PATCH | `/workspaces/:wId/snippet-folders/:folderId` | Update folder |
| DELETE | `/workspaces/:wId/snippet-folders/:folderId` | Delete folder |

---

## 9. GitHub Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/integrations/github/connect` | Connect GitHub account (exchange OAuth code for token) |
| DELETE | `/integrations/github/disconnect` | Disconnect GitHub account |
| GET | `/integrations/github/repos` | List user repositories |
| GET | `/integrations/github/repos/:owner/:repo` | Get repository details |
| GET | `/integrations/github/repos/:owner/:repo/commits` | Get recent commits |
| GET | `/integrations/github/repos/:owner/:repo/pulls` | Get pull requests |
| GET | `/integrations/github/repos/:owner/:repo/issues` | Get issues |
| POST | `/integrations/github/repos/:owner/:repo/link` | Link repo to DevFlow project |
| GET | `/integrations/github/activity` | Get contribution activity |

---

## 10. LeetCode Tracker

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/integrations/leetcode/connect` | Connect LeetCode by username |
| DELETE | `/integrations/leetcode/disconnect` | Disconnect LeetCode |
| GET | `/integrations/leetcode/profile` | Get LeetCode profile & stats |
| POST | `/integrations/leetcode/sync` | Force refresh LeetCode data |
| GET | `/integrations/leetcode/submissions` | Get recent submissions |
| GET | `/integrations/leetcode/contests` | Get contest history |
| GET | `/integrations/leetcode/analytics` | Get analytics (progress over time) |
| POST | `/integrations/leetcode/entries` | Add manual problem entry |
| DELETE | `/integrations/leetcode/entries/:entryId` | Delete manual entry |

---

## 11. API Testing

### Collections

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/api-collections` | Create collection |
| GET | `/workspaces/:wId/api-collections` | List collections |
| PATCH | `/workspaces/:wId/api-collections/:colId` | Update collection |
| DELETE | `/workspaces/:wId/api-collections/:colId` | Delete collection |

### Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/api-requests` | Create saved request |
| GET | `/workspaces/:wId/api-requests?collection=<colId>` | List requests in collection |
| PATCH | `/workspaces/:wId/api-requests/:reqId` | Update request |
| DELETE | `/workspaces/:wId/api-requests/:reqId` | Delete request |

### Send Request (Proxy)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/api-proxy/send` | Execute HTTP request via server proxy |

The server acts as a proxy to avoid CORS issues. Request body contains the full request spec (method, url, headers, body).

### Environments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/api-environments` | Create environment |
| GET | `/workspaces/:wId/api-environments` | List environments |
| PATCH | `/workspaces/:wId/api-environments/:envId` | Update environment |
| DELETE | `/workspaces/:wId/api-environments/:envId` | Delete environment |

### Request History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:wId/request-history` | List history (paginated) |
| DELETE | `/workspaces/:wId/request-history` | Clear history |

---

## 12. Productivity

### Pomodoro

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/pomodoro/sessions` | Start/record session |
| GET | `/workspaces/:wId/pomodoro/sessions` | List sessions |
| GET | `/workspaces/:wId/pomodoro/stats` | Get focus statistics |

**Stats query params:** `?period=today|week|month|all`

### Daily Planner

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:wId/planner?date=2026-06-25` | Get plan for date |
| PUT | `/workspaces/:wId/planner` | Create or update daily plan |
| PATCH | `/workspaces/:wId/planner/items/:itemId` | Toggle item completion |

---

## 13. Chat

### Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/chat/channels` | Create channel |
| GET | `/workspaces/:wId/chat/channels` | List channels |
| GET | `/workspaces/:wId/chat/channels/:channelId` | Get channel details |
| PATCH | `/workspaces/:wId/chat/channels/:channelId` | Update channel |
| DELETE | `/workspaces/:wId/chat/channels/:channelId` | Delete channel |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `.../:channelId/messages` | Get messages (paginated, newest first) |
| POST | `.../:channelId/messages` | Send message (also emitted via Socket.IO) |
| PATCH | `.../:channelId/messages/:msgId` | Edit message |
| DELETE | `.../:channelId/messages/:msgId` | Delete message |

### Direct Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workspaces/:wId/chat/dm` | Create or get DM channel with a user |

---

## 14. Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List user notifications (paginated) |
| GET | `/notifications/unread-count` | Get unread count |
| PATCH | `/notifications/:notifId/read` | Mark as read |
| POST | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:notifId` | Delete notification |

---

## 15. File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/image` | Upload image to Cloudinary |
| POST | `/upload/file` | Upload file to Cloudinary |

**Request:** `multipart/form-data` with `file` field  
**Response:** `{ url, publicId, format, size }`

---

## 16. Search (Global)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:wId/search?q=<query>&type=all` | Search across all content types |

**Query params:**
```
?q=<search query>
&type=all|projects|tasks|documents|snippets|api-collections
&limit=10
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "projects": [
      { "id": "...", "name": "Alpha", "icon": "...", "type": "project" }
    ],
    "tasks": [
      { "id": "...", "title": "Fix auth bug", "status": "...", "project": "Alpha", "type": "task" }
    ],
    "documents": [
      { "id": "...", "title": "API Guide", "snippet": "...matched text...", "type": "document" }
    ],
    "snippets": [
      { "id": "...", "title": "useDebounce", "language": "typescript", "type": "snippet" }
    ],
    "apiCollections": [
      { "id": "...", "name": "Auth API", "type": "api-collection" }
    ]
  }
}
```

Results are grouped by type with metadata for display in the command palette.
Each result includes enough context for the frontend to render an icon, title, subtitle, and navigation link.
This endpoint powers both the top-bar search input and the Cmd+K command palette.

---

## 17. Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:wId/dashboard` | Get aggregated dashboard data |

**Response includes:**
- `todaysTasks` — tasks due today or overdue, assigned to current user
- `recentProjects` — last 5 projects accessed by user
- `githubActivity` — recent commits/PRs (if GitHub connected)
- `leetcodeProgress` — solved count, streak (if LeetCode connected)
- `recentDocuments` — last 5 documents edited by user
- `productivityStats` — focus hours this week, sessions completed
- `unreadNotifications` — count of unread notifications

The frontend also fetches the mini calendar and pomodoro state from their respective endpoints.

---

## 18. AI (Reserved — Not Implemented in V1)

Routes are defined but return `501 Not Implemented` in V1.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/code-review` | AI code review (future) |
| POST | `/ai/generate-docs` | AI documentation generation (future) |
| POST | `/ai/detect-bugs` | AI bug detection (future) |
| POST | `/ai/suggest-tasks` | AI task suggestions (future) |
| POST | `/ai/chat` | AI chat assistant (future) |

---

## 19. Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | [Public] Health check |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-25T10:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "cloudinary": "configured"
  }
}
```

---

## 20. Rate Limiting

| Scope | Limit |
|-------|-------|
| Global (per IP) | 100 requests/minute |
| Auth endpoints | 20 requests/minute |
| File upload | 10 requests/minute |
| API proxy (send request) | 30 requests/minute |
| Search | 30 requests/minute |

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1719309600
```

---

## 21. Pagination Convention

All list endpoints support:
```
?page=1          (1-based, default: 1)
&limit=20        (default: 20, max: 100)
```

Cursor-based pagination used for chat messages and activity feeds:
```
?cursor=<lastId>
&limit=50
```
