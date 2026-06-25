# System Architecture

## DevFlow — Overall Architecture Design

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Browser  │  │ Mobile   │  │ VS Code  │  │ Chrome Ext.   │  │
│  │ (React)  │  │ (Future) │  │ (Future) │  │ (Future)      │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       └──────────────┴──────────────┴───────────────┘           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS / WSS
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                      CDN / EDGE (Vercel)                      │
│              Static assets, SPA serving, caching              │
└───────────────────────────────┬───────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        │                      │                         │
        ▼                      ▼                         ▼
┌──────────────┐  ┌─────────────────────┐  ┌────────────────────┐
│   Clerk      │  │   API Server        │  │   Socket.IO        │
│   (Auth)     │  │   (Express.js)      │  │   Server           │
│              │  │   on Render          │  │   (same process)   │
│  - OAuth     │  │                     │  │                    │
│  - Sessions  │  │  - REST API         │  │  - Presence        │
│  - Webhooks  │──│  - JWT Verify       │──│  - Notifications   │
│  - User Mgmt │  │  - Zod Validation   │  │  - Chat            │
│              │  │  - Rate Limiting    │  │  - Live Updates    │
└──────────────┘  │  - File Upload      │  └────────────────────┘
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
    │  MongoDB     │ │ Cloudinary  │ │ Redis        │
    │  Atlas       │ │             │ │ (Future)     │
    │              │ │  - Images   │ │              │
    │  - All data  │ │  - Files    │ │  - Cache     │
    │  - Indexes   │ │  - Avatars  │ │  - Sessions  │
    │  - Atlas     │ │             │ │  - Socket.IO │
    │    Search    │ │             │ │    adapter   │
    └──────────────┘ └─────────────┘ └──────────────┘
              │
              │
              ▼
    ┌──────────────────────┐
    │  External APIs       │
    │                      │
    │  - GitHub REST API   │
    │  - LeetCode API      │
    └──────────────────────┘
```

---

## 2. Architecture Principles

| Principle | Implementation |
|-----------|---------------|
| **Separation of Concerns** | Frontend (React SPA) is fully decoupled from Backend (Express API). Communicate only via REST + WebSocket. |
| **Modular Feature Architecture** | Each feature (projects, docs, snippets, etc.) is a self-contained module with its own routes, controllers, services, models, and validation. |
| **Shared Type Safety** | A shared `packages/shared` package contains TypeScript types, Zod schemas, and constants used by both frontend and backend. |
| **Stateless API** | No server-side sessions. JWT from Clerk is verified on each request. Enables horizontal scaling. |
| **Fail-Safe Defaults** | All endpoints require authentication by default. Public endpoints are explicitly marked. |
| **Progressive Enhancement** | Redis, real-time collaboration, AI features, and payment processing can be added without changing existing architecture. |
| **Portfolio-Grade Quality** | Every module demonstrates production-level patterns: validation, error handling, testing, logging, and security. |
| **Observable by Default** | Structured logging with request IDs, centralized error handling, and pluggable monitoring interfaces. |

---

## 3. Frontend Architecture

### 3.1 Application Structure

```
React SPA (Vite)
├── Entry Point (main.tsx)
│   ├── ClerkProvider (auth context)
│   ├── QueryClientProvider (React Query)
│   ├── ThemeProvider (dark/light mode)
│   ├── SocketProvider (Socket.IO)
│   └── RouterProvider (React Router)
│
├── Layouts
│   ├── LandingLayout (public marketing pages)
│   ├── AuthLayout (login/signup pages)
│   ├── DashboardLayout (sidebar + top nav + content)
│   └── OnboardingLayout (workspace setup)
│
├── Pages (route-level components)
│   ├── Landing Page (public, unauthenticated)
│   ├── Dashboard (widgets: tasks, projects, GitHub, LeetCode, docs, timer, calendar, notifications, analytics)
│   ├── Projects → ProjectBoard / ProjectList / ProjectCalendar
│   ├── Documents → DocumentEditor / DocumentTree
│   ├── Snippets → SnippetLibrary / SnippetEditor
│   ├── GitHub → RepoList / RepoDetail
│   ├── LeetCode → Profile / Analytics
│   ├── API Tester → RequestBuilder / Collections
│   ├── Productivity → Pomodoro / Planner / Stats
│   ├── Chat → Channels / DirectMessages
│   └── Settings → Profile / Workspace / Notifications
│
└── Feature Modules
    Each feature has:
    ├── components/ (UI components specific to the feature)
    ├── hooks/ (React Query hooks for data fetching)
    ├── stores/ (local state if needed)
    ├── types/ (feature-specific types)
    └── utils/ (feature-specific helpers)
```

### 3.2 State Management Strategy

| State Type | Tool | Use Case |
|-----------|------|----------|
| Server state | React Query | All API data (projects, tasks, docs, etc.) |
| Auth state | Clerk hooks | User session, tokens, profile |
| UI state | React state / context | Modals, sidebars, theme, command palette |
| Real-time state | Socket.IO + React Query invalidation | Presence, notifications, chat |
| Form state | React Hook Form + Zod | All forms with validation |
| URL state | React Router | Current page, filters, search params |

### 3.3 Key Frontend Patterns

- **Optimistic Updates:** React Query mutations update the cache immediately, rollback on error.
- **Infinite Scrolling:** For activity feeds, chat messages, request history.
- **Lazy Loading:** Route-level code splitting with `React.lazy()` and `Suspense`.
- **Debounced Search:** All search inputs debounce API calls by 300ms.
- **Error Boundaries:** Feature-level error boundaries prevent full-page crashes.
- **Skeleton Loading:** Skeleton components shown during data fetching.

---

## 4. Backend Architecture

### 4.1 Layer Architecture

```
Request Flow:
                                                    
  HTTP Request                                      
       │                                            
       ▼                                            
  ┌──────────────────┐                              
  │   Middleware      │  helmet, cors, rate-limit,  
  │   Pipeline        │  json parser, clerk auth    
  └────────┬─────────┘                              
           │                                        
           ▼                                        
  ┌──────────────────┐                              
  │   Router         │  /api/v1/projects            
  │                  │  /api/v1/tasks               
  └────────┬─────────┘  /api/v1/documents ...       
           │                                        
           ▼                                        
  ┌──────────────────┐                              
  │   Validation     │  Zod schema validation       
  │   Middleware      │  request body, params, query 
  └────────┬─────────┘                              
           │                                        
           ▼                                        
  ┌──────────────────┐                              
  │   Controller     │  Parse request, call service, 
  │                  │  format response              
  └────────┬─────────┘                              
           │                                        
           ▼                                        
  ┌──────────────────┐                              
  │   Service        │  Business logic, orchestrate  
  │                  │  data access, enforce rules   
  └────────┬─────────┘                              
           │                                        
           ▼                                        
  ┌──────────────────┐                              
  │   Model          │  Mongoose schema/model,       
  │   (Data Access)  │  database operations           
  └──────────────────┘                              
```

### 4.2 Middleware Pipeline

```
Every request passes through (in order):

1. helmet()              → Security headers
2. cors()                → Origin validation
3. express.json()        → Body parsing (with size limit)
4. rateLimiter()         → Global rate limiting (100 req/min per IP)
5. requestLogger()       → Log method, path, status, duration
6. clerkAuth()           → Verify JWT, attach userId to req
7. [Route Handler]       → Route-specific middleware + controller
8. errorHandler()        → Global error handler (catches all thrown errors)
```

### 4.3 API Versioning

All API routes are prefixed with `/api/v1/`. This allows future breaking changes to be introduced under `/api/v2/` without disrupting existing clients.

### 4.4 Error Handling

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

Standard error codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMITED` (429)
- `INTERNAL_ERROR` (500)

### 4.5 Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 5. Real-Time Architecture (Socket.IO)

### 5.1 Connection Flow

```
1. Client connects with Clerk JWT as auth token
2. Server verifies JWT in Socket.IO middleware
3. User joins rooms:
   - user:{userId}          (personal notifications)
   - workspace:{workspaceId} (workspace updates)
4. Server emits events to relevant rooms
```

### 5.2 Event Categories

| Category | Events | Room |
|----------|--------|------|
| Presence | `user:online`, `user:offline`, `user:typing` | `workspace:{id}` |
| Tasks | `task:created`, `task:updated`, `task:deleted` | `workspace:{id}` |
| Notifications | `notification:new` | `user:{id}` |
| Chat | `message:new`, `message:edited`, `message:deleted` | `channel:{id}` |
| Documents | `document:updated` (future collab) | `document:{id}` |

### 5.3 Scaling Strategy

In V1, Socket.IO runs in the same process as Express. When scaling to multiple instances:
1. Add Redis adapter (`@socket.io/redis-adapter`)
2. Use sticky sessions or separate WebSocket server
3. No application code changes required

---

## 6. Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Clerk   │     │  API     │     │ MongoDB  │
│  (React) │     │          │     │ Server   │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                 │
     │  1. Sign in    │                │                 │
     │───────────────>│                │                 │
     │                │                │                 │
     │  2. JWT token  │                │                 │
     │<───────────────│                │                 │
     │                │                │                 │
     │  3. API call with Bearer token  │                 │
     │────────────────────────────────>│                 │
     │                │                │                 │
     │                │  4. Verify JWT │                 │
     │                │<───────────────│                 │
     │                │                │                 │
     │                │  5. Valid      │                 │
     │                │───────────────>│                 │
     │                │                │                 │
     │                │                │  6. Query DB    │
     │                │                │────────────────>│
     │                │                │                 │
     │                │                │  7. Data        │
     │                │                │<────────────────│
     │                │                │                 │
     │  8. Response   │                │                 │
     │<────────────────────────────────│                 │
     │                │                │                 │

User Sync (Clerk Webhook):
     │                │                │                 │
     │                │  user.created  │                 │
     │                │  user.updated  │                 │
     │                │───────────────>│                 │
     │                │                │  Upsert user   │
     │                │                │────────────────>│
```

---

## 7. File Upload Flow

```
1. Client selects file
2. Client validates file (type, size) locally
3. Client sends file to API: POST /api/v1/upload
4. API validates file server-side
5. API uploads to Cloudinary via SDK
6. Cloudinary returns URL + metadata
7. API stores URL reference in MongoDB document
8. API returns URL to client
```

**Constraints:**
- Max file size: 10MB (images), 25MB (documents)
- Allowed image types: jpg, jpeg, png, gif, webp, svg
- Allowed doc types: pdf, doc, docx, txt, md
- Cloudinary folder structure: `devflow/{workspaceId}/{feature}/`

---

## 8. External Integrations

### 8.1 GitHub Integration

```
Auth: GitHub OAuth (via Clerk's connected accounts or separate OAuth flow)
API: GitHub REST API v3
Rate Limit: 5,000 requests/hour (authenticated)

Endpoints Used:
  GET /user/repos               → List user repositories
  GET /repos/{owner}/{repo}     → Repository details
  GET /repos/.../commits        → Recent commits
  GET /repos/.../pulls          → Pull requests
  GET /repos/.../issues         → Issues

Data Caching: Cache GitHub data in MongoDB with TTL.
Refresh on user request or every 15 minutes.
```

### 8.2 LeetCode Integration

```
Source: LeetCode GraphQL API (unofficial)
Endpoint: https://leetcode.com/graphql

Queries:
  - User profile (username, ranking, avatar)
  - Problem stats (solved count by difficulty)
  - Recent submissions
  - Contest history

Caching: Cache in MongoDB, refresh every 30 minutes or on-demand.
Error Handling: Graceful fallback if LeetCode API is unavailable.
```

---

## 9. Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                  GitHub Repository               │
│                  (Monorepo)                       │
└────────────────────┬────────────────────────────┘
                     │
                     │ Push to main
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐   ┌──────────────────┐
│  GitHub Actions  │   │  GitHub Actions   │
│  (Frontend CI)   │   │  (Backend CI)     │
│                  │   │                   │
│  - Lint          │   │  - Lint           │
│  - Type check    │   │  - Type check     │
│  - Unit tests    │   │  - Unit tests     │
│  - Build         │   │  - Integration    │
│                  │   │    tests          │
└────────┬────────┘   └────────┬──────────┘
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│  Vercel          │   │  Render           │
│                  │   │                   │
│  - SPA hosting   │   │  - API server     │
│  - CDN           │   │  - Socket.IO      │
│  - SSL           │   │  - Auto-deploy    │
│  - Preview URLs  │   │  - Health checks  │
└─────────────────┘   └──────────────────┘
```

### 9.1 Environment Strategy

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Development | localhost:5173 | localhost:5000 | Local MongoDB or Atlas dev cluster |
| Staging | staging.devflow.app (Vercel preview) | staging-api.devflow.app (Render) | Atlas staging cluster |
| Production | devflow.app (Vercel) | api.devflow.app (Render) | Atlas production cluster |

---

## 10. Logging & Monitoring Architecture

### 10.1 Structured Logging

```
Every log entry is a JSON object:

{
  "level": "info",                    — error | warn | info | debug
  "message": "GET /api/v1/projects",
  "requestId": "req_abc123",          — unique per request (X-Request-Id header)
  "userId": "user_xyz",               — from Clerk JWT (if authenticated)
  "method": "GET",
  "path": "/api/v1/projects",
  "statusCode": 200,
  "duration": 45,                     — ms
  "timestamp": "2026-06-25T10:00:00Z",
  "env": "production"
}
```

### 10.2 Logger Interface

The logger is abstracted behind a `Logger` interface so external services can be plugged in without touching application code:

```
Logger Interface:
  - error(message, meta?)   → Errors and exceptions
  - warn(message, meta?)    → Warnings (rate limits hit, deprecated usage)
  - info(message, meta?)    → Request logs, business events
  - debug(message, meta?)   → Detailed debugging (disabled in production)

V1 Implementation: Console-based structured JSON logger
Future:            Swap to Winston/Pino with transports for Sentry, Datadog, LogDNA
```

### 10.3 Error Tracking

```
All errors flow through a centralized error handler:

1. Route handler throws / calls next(error)
2. Global error handler middleware catches it
3. Logs full error with stack trace, request context, user ID
4. Returns structured JSON error response to client
5. Uncaught exceptions and unhandled rejections are caught at process level

Future: Sentry integration via the Logger interface (no code changes needed)
```

### 10.4 Monitoring Endpoints

| Concern | V1 Tool | Future |
|---------|---------|--------|
| API request logging | Structured JSON console logs | Pino + Datadog/LogDNA |
| Error tracking | Console + structured error responses | Sentry |
| Uptime | Render health checks on `/api/health` | UptimeRobot / Checkly |
| Performance (frontend) | Vercel Analytics | Vercel Speed Insights |
| Database | MongoDB Atlas built-in monitoring | Atlas alerts |
| Application metrics | Health check endpoint | Prometheus / Grafana |

---

## 11. AI Module Architecture (Reserved — Not Implemented in V1)

```
The AI module is reserved in both frontend and backend as empty placeholders:

Backend:  apps/api/src/modules/ai/
          ├── ai.service.ts          — Service interface (empty)
          ├── ai.controller.ts       — Controller stub
          ├── ai.routes.ts           — Route definitions (empty)
          └── ai.validation.ts       — Input schemas (empty)

Frontend: apps/web/src/features/ai/
          ├── components/            — UI components (empty)
          └── hooks/                 — API hooks (empty)

Shared:   packages/shared/src/types/ai.types.ts — Type definitions

Planned capabilities (future):
  - AI Code Review      → POST /api/v1/ai/code-review
  - AI Doc Generator    → POST /api/v1/ai/generate-docs
  - AI Bug Detection    → POST /api/v1/ai/detect-bugs
  - AI Task Suggestions → POST /api/v1/ai/suggest-tasks
  - AI Chat Assistant   → POST /api/v1/ai/chat

Integration approach: Claude API (Anthropic) via server-side calls.
No AI API keys or costs in V1.
```
