# MongoDB Database Design

## DevFlow — Data Models & Schema Design

---

## 1. Design Principles

- **Embed when read together:** Subdocuments for data always fetched with the parent (e.g., subtasks within tasks).
- **Reference when shared:** ObjectId references for data shared across entities (e.g., users, workspaces).
- **Soft deletes:** `deletedAt` field on entities where recovery may be needed (workspaces, projects, tasks, documents, snippets).
- **Timestamps:** All collections include `createdAt` and `updatedAt` via Mongoose timestamps.
- **Consistent naming:** camelCase for fields, singular for collection names stored as plural by Mongoose convention.

---

## 2. Collections Overview

```
Core:
  ├── users
  ├── workspaces
  └── workspaceMembers

Project Management:
  ├── projects
  ├── tasks
  ├── taskComments
  └── taskActivities

Documentation:
  ├── documents
  └── documentVersions

Code Snippets:
  ├── snippets
  └── snippetFolders

GitHub:
  └── githubConnections

LeetCode:
  └── leetcodeProfiles

API Testing:
  ├── apiCollections
  ├── apiRequests
  ├── apiEnvironments
  └── requestHistory

Productivity:
  ├── pomodoroSessions
  └── dailyPlans

Collaboration:
  ├── chatChannels
  ├── chatMessages
  └── notifications

System:
  └── auditLogs
```

---

## 3. Schema Definitions

### 3.1 Users

Synced from Clerk via webhooks. Source of truth is Clerk; this is a local cache for queries and relations.

```
users {
  _id:            ObjectId
  clerkId:        String        (unique, indexed) — Clerk user ID
  email:          String        (unique, indexed)
  firstName:      String
  lastName:       String
  displayName:    String
  avatar:         String        — Cloudinary URL or Clerk avatar
  bio:            String        (max 500 chars)
  
  profile: {
    skills:         [String]    — e.g., ["React", "Node.js", "Python"]
    githubUsername:  String      — public GitHub username (display purposes)
    leetcodeUsername: String     — public LeetCode username (display purposes)
    portfolioUrl:   String      — personal portfolio/website link
    location:       String      — optional location string
  }
  
  preferences: {
    theme:          String      — "light" | "dark" | "system"
    notifications: {
      email:        Boolean     — default: true (architecture-ready, delivery deferred)
      inApp:        Boolean     — default: true
      browser:      Boolean     — default: false
      taskAssigned: Boolean     — default: true
      taskComment:  Boolean     — default: true
      mentions:     Boolean     — default: true
      projectUpdates: Boolean   — default: true
      chatMessages: Boolean     — default: true
    }
  }
  
  connectedAccounts: {
    github: {
      connected:    Boolean
      username:     String
      accessToken:  String      (encrypted)
      refreshToken: String      (encrypted)
      connectedAt:  Date
    }
    leetcode: {
      connected:    Boolean
      username:     String
      connectedAt:  Date
    }
  }
  
  plan:            String       — "free" | "pro"   (default: "free", not enforced in V1)
  lastActiveAt:    Date
  onboardingCompleted: Boolean  — default: false
  
  deletedAt:       Date | null
  createdAt:       Date
  updatedAt:       Date
}

Indexes:
  - { clerkId: 1 }              (unique)
  - { email: 1 }                (unique)
```

### 3.2 Workspaces

```
workspaces {
  _id:            ObjectId
  name:           String        (required, 1-50 chars)
  slug:           String        (unique, indexed) — URL-friendly name
  description:    String        (max 500 chars)
  icon:           String        — emoji or Cloudinary URL
  owner:          ObjectId      → users._id  (indexed)
  
  settings: {
    defaultProjectView: String  — "kanban" | "list" | "calendar"
    allowMemberInvites: Boolean — default: false (only admins can invite)
  }
  
  deletedAt:      Date | null
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { slug: 1 }                 (unique)
  - { owner: 1 }
  - { deletedAt: 1 }
```

### 3.3 Workspace Members

```
workspaceMembers {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id
  user:           ObjectId      → users._id
  role:           String        — "owner" | "admin" | "member" | "viewer"
  
  invitedBy:      ObjectId      → users._id
  invitedAt:      Date
  joinedAt:       Date
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1, user: 1 }   (unique compound)
  - { user: 1 }
  - { workspace: 1, role: 1 }
```

### 3.4 Projects

```
projects {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id  (indexed)
  name:           String        (required, 1-100 chars)
  description:    String        (max 1000 chars)
  icon:           String        — emoji
  color:          String        — hex color code
  
  statuses: [                   — custom columns, ordered
    {
      _id:        ObjectId
      name:       String        — e.g., "Todo", "In Progress", "Done"
      color:      String        — hex color
      order:      Number
      isDefault:  Boolean       — new tasks go here
      isDone:     Boolean       — marks task as completed
    }
  ]
  
  labels: [
    {
      _id:        ObjectId
      name:       String
      color:      String
    }
  ]
  
  github: {
    repoOwner:    String
    repoName:     String
    connected:    Boolean
  }
  
  createdBy:      ObjectId      → users._id
  
  deletedAt:      Date | null
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1, deletedAt: 1 }
  - { workspace: 1, name: 1 }
```

### 3.5 Tasks

```
tasks {
  _id:            ObjectId
  project:        ObjectId      → projects._id    (indexed)
  workspace:      ObjectId      → workspaces._id  (indexed)
  
  title:          String        (required, 1-200 chars)
  description:    String        — rich text / markdown
  status:         ObjectId      — references project.statuses[]._id
  priority:       String        — "urgent" | "high" | "medium" | "low" | "none"
  
  assignees:      [ObjectId]    → users._id
  labels:         [ObjectId]    — references project.labels[]._id
  dueDate:        Date | null
  
  subtasks: [
    {
      _id:        ObjectId
      title:      String
      completed:  Boolean       — default: false
      order:      Number
    }
  ]
  
  attachments: [
    {
      _id:        ObjectId
      name:       String
      url:        String        — Cloudinary URL
      type:       String        — MIME type
      size:       Number        — bytes
      uploadedBy: ObjectId      → users._id
      uploadedAt: Date
    }
  ]
  
  order:          Number        — position within status column
  
  githubIssue: {
    number:       Number
    url:          String
    state:        String
  }
  
  githubPR: {
    number:       Number
    url:          String
    state:        String
  }
  
  createdBy:      ObjectId      → users._id
  completedAt:    Date | null
  
  deletedAt:      Date | null
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { project: 1, status: 1, order: 1 }
  - { project: 1, deletedAt: 1 }
  - { workspace: 1, assignees: 1 }
  - { workspace: 1, dueDate: 1 }
  - { workspace: 1, createdBy: 1 }
```

### 3.6 Task Comments

```
taskComments {
  _id:            ObjectId
  task:           ObjectId      → tasks._id       (indexed)
  author:         ObjectId      → users._id
  content:        String        — markdown text
  
  mentions:       [ObjectId]    → users._id
  
  editedAt:       Date | null
  deletedAt:      Date | null
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { task: 1, createdAt: -1 }
```

### 3.7 Task Activities

```
taskActivities {
  _id:            ObjectId
  task:           ObjectId      → tasks._id       (indexed)
  workspace:      ObjectId      → workspaces._id
  user:           ObjectId      → users._id
  
  action:         String        — "created" | "updated" | "deleted" | 
                                   "status_changed" | "assigned" | 
                                   "unassigned" | "priority_changed" |
                                   "due_date_changed" | "comment_added" |
                                   "attachment_added" | "label_added" |
                                   "label_removed" | "subtask_added" |
                                   "subtask_completed"
  
  details: {
    field:        String        — which field changed
    from:         Mixed         — previous value
    to:           Mixed         — new value
  }
  
  createdAt:      Date
}

Indexes:
  - { task: 1, createdAt: -1 }
  - { workspace: 1, createdAt: -1 }
```

### 3.8 Documents

```
documents {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id  (indexed)
  
  title:          String        (required, 1-200 chars)
  content:        String        — markdown content
  icon:           String        — emoji
  coverImage:     String        — Cloudinary URL
  
  parent:         ObjectId | null → documents._id (self-referencing for nesting)
  order:          Number        — position among siblings
  
  createdBy:      ObjectId      → users._id
  lastEditedBy:   ObjectId      → users._id
  
  deletedAt:      Date | null
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1, parent: 1, order: 1 }
  - { workspace: 1, deletedAt: 1 }
  - { workspace: 1, title: "text", content: "text" }  (text index for search)
```

### 3.9 Document Versions

```
documentVersions {
  _id:            ObjectId
  document:       ObjectId      → documents._id   (indexed)
  
  title:          String
  content:        String        — full content snapshot
  
  editedBy:       ObjectId      → users._id
  createdAt:      Date
}

Indexes:
  - { document: 1, createdAt: -1 }
```

### 3.10 Snippets

```
snippets {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id  (indexed)
  
  title:          String        (required, 1-100 chars)
  description:    String        (max 500 chars)
  language:       String        — programming language
  code:           String        (required)
  
  tags:           [String]
  folder:         ObjectId | null → snippetFolders._id
  
  visibility:     String        — "personal" | "team"
  isFavorite:     Boolean       — default: false (per-user favorites stored separately or as array)
  favoritedBy:    [ObjectId]    → users._id
  
  createdBy:      ObjectId      → users._id
  
  deletedAt:      Date | null
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1, visibility: 1, deletedAt: 1 }
  - { workspace: 1, language: 1 }
  - { workspace: 1, tags: 1 }
  - { workspace: 1, folder: 1 }
  - { createdBy: 1, visibility: 1 }
  - { workspace: 1, title: "text", description: "text" }
```

### 3.11 Snippet Folders

```
snippetFolders {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id
  name:           String        (required, 1-50 chars)
  parent:         ObjectId | null → snippetFolders._id
  order:          Number
  
  createdBy:      ObjectId      → users._id
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1, parent: 1 }
```

### 3.12 GitHub Connections

```
githubConnections {
  _id:            ObjectId
  user:           ObjectId      → users._id       (unique, indexed)
  workspace:      ObjectId      → workspaces._id
  
  githubUserId:   Number
  username:       String
  accessToken:    String        (encrypted)
  
  cachedRepos: [
    {
      repoId:       Number
      name:         String
      fullName:     String
      description:  String
      language:     String
      stars:        Number
      forks:        Number
      isPrivate:    Boolean
      url:          String
      updatedAt:    Date
    }
  ]
  
  reposCachedAt:  Date
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { user: 1 }                 (unique)
  - { workspace: 1 }
```

### 3.13 LeetCode Profiles

```
leetcodeProfiles {
  _id:            ObjectId
  user:           ObjectId      → users._id       (unique, indexed)
  
  username:       String
  
  profile: {
    ranking:        Number
    reputation:     Number
    avatar:         String
  }
  
  stats: {
    totalSolved:    Number
    easySolved:     Number
    mediumSolved:   Number
    hardSolved:     Number
    totalQuestions: Number
    easyTotal:      Number
    mediumTotal:    Number
    hardTotal:      Number
    acceptanceRate: Number
  }
  
  recentSubmissions: [
    {
      title:        String
      titleSlug:    String
      difficulty:   String
      status:       String
      language:     String
      timestamp:    Date
    }
  ]
  
  contests: [
    {
      title:        String
      ranking:      Number
      score:        Number
      date:         Date
    }
  ]
  
  streaks: {
    current:        Number
    longest:        Number
    lastSolveDate:  Date
  }
  
  manualEntries: [
    {
      _id:          ObjectId
      problemName:  String
      difficulty:   String
      notes:        String
      solutionCode: String
      solvedAt:     Date
    }
  ]
  
  lastSyncedAt:   Date
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { user: 1 }                 (unique)
```

### 3.14 API Collections

```
apiCollections {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id  (indexed)
  
  name:           String        (required, 1-100 chars)
  description:    String
  
  createdBy:      ObjectId      → users._id
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1 }
```

### 3.15 API Requests

```
apiRequests {
  _id:            ObjectId
  collection:     ObjectId      → apiCollections._id  (indexed)
  workspace:      ObjectId      → workspaces._id
  
  name:           String        (required)
  method:         String        — "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  url:            String
  
  headers: [
    { key: String, value: String, enabled: Boolean }
  ]
  
  queryParams: [
    { key: String, value: String, enabled: Boolean }
  ]
  
  body: {
    type:         String        — "none" | "json" | "form-data" | "raw"
    content:      String
  }
  
  auth: {
    type:         String        — "none" | "bearer" | "basic" | "api-key"
    token:        String
    username:     String
    password:     String
    key:          String
    value:        String
    addTo:        String        — "header" | "query"
  }
  
  order:          Number
  
  createdBy:      ObjectId      → users._id
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { collection: 1, order: 1 }
  - { workspace: 1 }
```

### 3.16 API Environments

```
apiEnvironments {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id  (indexed)
  
  name:           String        — e.g., "Development", "Production"
  
  variables: [
    {
      key:        String
      value:      String
      enabled:    Boolean       — default: true
    }
  ]
  
  isDefault:      Boolean       — default: false
  
  createdBy:      ObjectId      → users._id
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1 }
```

### 3.17 Request History

```
requestHistory {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id
  user:           ObjectId      → users._id
  
  method:         String
  url:            String
  
  request: {
    headers:      Object
    body:         String
  }
  
  response: {
    status:       Number
    statusText:   String
    headers:      Object
    body:         String
    size:         Number        — response size in bytes
    time:         Number        — response time in ms
  }
  
  createdAt:      Date          (TTL index: auto-delete after 30 days)
}

Indexes:
  - { workspace: 1, user: 1, createdAt: -1 }
  - { createdAt: 1 }            (TTL: expireAfterSeconds 2592000)
```

### 3.18 Pomodoro Sessions

```
pomodoroSessions {
  _id:            ObjectId
  user:           ObjectId      → users._id       (indexed)
  workspace:      ObjectId      → workspaces._id
  
  type:           String        — "work" | "shortBreak" | "longBreak"
  duration:       Number        — planned duration in seconds
  actualDuration: Number        — actual duration in seconds
  
  task:           ObjectId | null → tasks._id (optional link)
  
  status:         String        — "completed" | "cancelled"
  startedAt:      Date
  completedAt:    Date
  
  createdAt:      Date
}

Indexes:
  - { user: 1, startedAt: -1 }
  - { user: 1, status: 1, startedAt: -1 }
```

### 3.19 Daily Plans

```
dailyPlans {
  _id:            ObjectId
  user:           ObjectId      → users._id
  workspace:      ObjectId      → workspaces._id
  
  date:           Date          — the day this plan is for (date only, no time)
  
  items: [
    {
      _id:        ObjectId
      title:      String
      task:       ObjectId | null → tasks._id
      startTime:  String        — "09:00" (HH:mm format)
      endTime:    String        — "10:30"
      completed:  Boolean       — default: false
      order:      Number
    }
  ]
  
  notes:          String
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { user: 1, date: -1 }       (unique compound)
  - { workspace: 1, date: -1 }
```

### 3.20 Chat Channels

```
chatChannels {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id  (indexed)
  
  type:           String        — "channel" | "direct"
  name:           String        — channel name (null for DMs)
  description:    String
  
  members:        [ObjectId]    → users._id
  
  createdBy:      ObjectId      → users._id
  lastMessageAt:  Date
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { workspace: 1 }
  - { members: 1 }
  - { workspace: 1, type: 1 }
```

### 3.21 Chat Messages

```
chatMessages {
  _id:            ObjectId
  channel:        ObjectId      → chatChannels._id  (indexed)
  sender:         ObjectId      → users._id
  
  content:        String
  
  mentions:       [ObjectId]    → users._id
  
  attachments: [
    {
      name:       String
      url:        String
      type:       String
    }
  ]
  
  editedAt:       Date | null
  deletedAt:      Date | null
  
  createdAt:      Date
  updatedAt:      Date
}

Indexes:
  - { channel: 1, createdAt: -1 }
```

### 3.22 Notifications

```
notifications {
  _id:            ObjectId
  recipient:      ObjectId      → users._id       (indexed)
  workspace:      ObjectId      → workspaces._id
  
  type:           String        — "task_assigned" | "task_comment" |
                                   "mention" | "workspace_invite" |
                                   "project_update" | "chat_message"
  
  title:          String
  message:        String
  
  resource: {
    type:         String        — "task" | "document" | "project" | "workspace" | "message"
    id:           ObjectId
  }
  
  actor:          ObjectId      → users._id (who triggered it)
  
  read:           Boolean       — default: false
  readAt:         Date | null
  
  createdAt:      Date
}

Indexes:
  - { recipient: 1, read: 1, createdAt: -1 }
  - { recipient: 1, createdAt: -1 }
  - { createdAt: 1 }            (TTL: expireAfterSeconds 7776000 — 90 days)
```

### 3.23 Audit Logs

```
auditLogs {
  _id:            ObjectId
  workspace:      ObjectId      → workspaces._id  (indexed)
  user:           ObjectId      → users._id
  
  action:         String        — "created" | "updated" | "deleted" |
                                   "member_added" | "member_removed" |
                                   "role_changed" | "settings_changed"
  
  entity: {
    type:         String        — "workspace" | "project" | "task" | 
                                   "document" | "snippet" | "member"
    id:           ObjectId
    name:         String        — entity name at time of action
  }
  
  details:        Object        — action-specific metadata
  
  ipAddress:      String
  userAgent:      String
  
  createdAt:      Date
}

Indexes:
  - { workspace: 1, createdAt: -1 }
  - { workspace: 1, entity.type: 1, createdAt: -1 }
  - { createdAt: 1 }            (TTL: expireAfterSeconds 15552000 — 180 days)
```

---

## 4. Relationships Diagram

```
users ──────┐
            │
            ├──< workspaceMembers >──── workspaces
            │                              │
            │         ┌────────────────────┤
            │         │                    │
            │     projects            documents
            │         │                    │
            │       tasks           documentVersions
            │       │   │
            │  taskComments
            │  taskActivities
            │
            ├──── snippets ──── snippetFolders
            │
            ├──── githubConnections
            │
            ├──── leetcodeProfiles
            │
            ├──── apiCollections ──── apiRequests
            │     apiEnvironments
            │     requestHistory
            │
            ├──── pomodoroSessions
            ├──── dailyPlans
            │
            ├──── chatChannels ──── chatMessages
            │
            ├──── notifications
            │
            └──── auditLogs
```

---

## 5. Data Sizing Estimates (1,000 Users)

| Collection | Est. Documents | Avg Doc Size | Total Size |
|-----------|---------------|-------------|-----------|
| users | 1,000 | 2 KB | 2 MB |
| workspaces | 2,000 | 1 KB | 2 MB |
| workspaceMembers | 5,000 | 0.5 KB | 2.5 MB |
| projects | 8,000 | 2 KB | 16 MB |
| tasks | 50,000 | 3 KB | 150 MB |
| taskComments | 100,000 | 1 KB | 100 MB |
| taskActivities | 200,000 | 0.5 KB | 100 MB |
| documents | 20,000 | 5 KB | 100 MB |
| snippets | 30,000 | 3 KB | 90 MB |
| chatMessages | 500,000 | 0.5 KB | 250 MB |
| notifications | 200,000 | 0.5 KB | 100 MB |
| **Total** | | | **~1 GB** |

MongoDB Atlas M0 (free tier) supports up to 512 MB storage. At ~1,000 active users, an M10 tier (~$57/month, 10 GB) would be appropriate.
