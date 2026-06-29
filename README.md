# DevFlow

[![CI](https://github.com/895YB/DevFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/895YB/DevFlow/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack developer workspace built as a portfolio project demonstrating production-level engineering practices. DevFlow consolidates the tools developers use daily — task management, documentation, code snippets, GitHub integration, LeetCode tracking, API testing, productivity, and AI assistance — into a single, cohesive platform.

**[Live Demo →](https://devflow-web.vercel.app)** &nbsp;|&nbsp; **[API Health](https://devflow-api.onrender.com/api/health)**

> The backend runs on Render's free tier and may take 30–60 seconds to cold-start on first visit.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Customizable widgets: task stats, GitHub activity, LeetCode streak, recent docs |
| **Projects** | Kanban, list, and calendar views with labels, statuses, subtasks, and comments |
| **Documents** | Hierarchical document tree with rich-text editing and version history |
| **Snippets** | Code snippet library with folder organisation and syntax highlighting |
| **GitHub** | Repository browser, pull requests, issues, and commit history |
| **LeetCode** | Submission history, rating graph, streak tracker, and contest calendar |
| **API Tester** | Postman-style collections, environments, request history, and workspace proxy |
| **Productivity** | Pomodoro timer, daily planner, and focus session statistics |
| **Analytics** | Workspace-wide productivity metrics and activity trends |
| **Chat** | Real-time channel messaging via Socket.IO |
| **Notifications** | In-app and browser push notifications with granular preferences |
| **AI Features** | Streaming chat, document summarization, code explanation, task suggestions, and semantic search — powered by Claude Opus |
| **Settings** | Profile, account security, workspace management, and data export |

---

## Tech Stack

```
Frontend              Backend               Infrastructure
──────────────────    ──────────────────    ──────────────────────
React 19              Express 5             Vercel (frontend)
React Router 7        Node.js 22            Render (backend)
Tailwind CSS 3        MongoDB + Mongoose     MongoDB Atlas
shadcn/ui             Socket.IO 4           Cloudinary (uploads)
TanStack Query 5      Zod validation        Clerk (auth)
Vite 6                Helmet + CORS         Anthropic Claude Opus
TypeScript 5.9        @anthropic-ai/sdk
                      Turborepo + pnpm
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│              React + Vite SPA (Vercel CDN)               │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS / WSS
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌─────────┐  ┌─────────┐  ┌──────────┐
     │  Clerk  │  │REST API │  │Socket.IO │
     │  (Auth) │  │(Render) │  │(same svc)│
     └─────────┘  └────┬────┘  └──────────┘
                        │
           ┌────────────┼─────────────┐
           ▼            ▼             ▼
     ┌──────────┐ ┌──────────┐ ┌──────────────┐
     │ MongoDB  │ │Cloudinary│ │  Anthropic   │
     │  Atlas   │ │(uploads) │ │  Claude API  │
     └──────────┘ └──────────┘ └──────────────┘
```

**Monorepo layout:**

```
devflow/
├── apps/
│   ├── api/          Express REST API + Socket.IO server
│   └── web/          React SPA
├── packages/
│   └── shared/       Zod schemas, TypeScript types, constants
├── docs/             Architecture documentation (7 docs)
├── turbo.json        Turborepo pipeline
└── render.yaml       Render deployment config
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22.13.0
- **pnpm** ≥ 9.0.0 (`npm install -g pnpm`)
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Clerk** — [clerk.com](https://clerk.com) (free tier)
- **Cloudinary** — [cloudinary.com](https://cloudinary.com) (free tier, optional — uploads disabled without it)
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com) (optional — AI features disabled without it)

### 1. Clone and install

```bash
git clone https://github.com/895YB/DevFlow.git
cd DevFlow
pnpm install
```

### 2. Configure environment variables

**Backend** (`apps/api/.env`):

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `CLERK_SECRET_KEY` | ✅ | Clerk backend secret (`sk_...`) |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook signing secret (`whsec_...`) |
| `ANTHROPIC_API_KEY` | ⚪ | Claude API key — AI features disabled without it |
| `CLOUDINARY_CLOUD_NAME` | ⚪ | File uploads disabled without it |
| `CLOUDINARY_API_KEY` | ⚪ | |
| `CLOUDINARY_API_SECRET` | ⚪ | |
| `CORS_ORIGIN` | ⚪ | Frontend URL (default: `http://localhost:5173`) |

**Frontend** (`apps/web/.env.local`):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key (`pk_...`) |
| `VITE_API_URL` | ⚪ | Backend base URL (default: `/api/v1`) |
| `VITE_SOCKET_URL` | ⚪ | Socket.IO URL (default: API base) |

### 3. Run in development

```bash
pnpm dev
```

Starts both `apps/api` (port 5000) and `apps/web` (port 5173) in parallel via Turborepo.

Open [http://localhost:5173](http://localhost:5173).

---

## Scripts

Run from the **repository root**:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API + Web in watch mode |
| `pnpm build` | Production build for all packages |
| `pnpm lint` | ESLint across all packages |
| `pnpm type-check` | TypeScript check across all packages |
| `pnpm test` | Run unit + integration tests (Vitest) |

---

## API Overview

Base URL: `https://devflow-api.onrender.com/api/v1`

All protected routes require a Clerk session token: `Authorization: Bearer <token>`

| Prefix | Resource |
|--------|----------|
| `GET /health` | Health check — no auth required |
| `/v1/users` | User profile, preferences, avatar |
| `/v1/workspaces` | Workspaces, members, roles |
| `/v1/projects` | Projects, statuses, labels |
| `/v1/tasks` | Tasks, subtasks, comments, attachments |
| `/v1/documents` | Documents, version history |
| `/v1/snippets` | Code snippets, folders |
| `/v1/integrations/github` | GitHub repos, PRs, issues, commits |
| `/v1/integrations/leetcode` | LeetCode stats, submissions, streaks |
| `/v1/integrations/api-tester` | Collections, environments, request history |
| `/v1/productivity` | Pomodoro sessions, daily planner |
| `/v1/notifications` | Notification feed, preferences |
| `/v1/chat` | Chat channels, messages |
| `/v1/search` | Workspace-wide full-text search |
| `/v1/dashboard` | Aggregated dashboard widget data |
| `/v1/analytics` | Activity metrics and trends |
| `/v1/export` | Data export (JSON / CSV) |
| `/v1/ai` | Chat (SSE streaming), summarize, explain-code, suggest-tasks, semantic-search |

Full reference: [`docs/04-API-DESIGN.md`](docs/04-API-DESIGN.md)

---

## Deployment

### Backend — Render

1. Create a **Web Service** on [render.com](https://render.com) and connect this repository
2. Render auto-detects `render.yaml` — build and start commands are pre-configured
3. Add environment variables in the Render dashboard
4. Deploy → API available at `https://devflow-api.onrender.com`

### Frontend — Vercel

1. Import this repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `apps/web`, **Framework** → `Vite`
3. Add environment variables (`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_URL`, `VITE_SOCKET_URL`)
4. Deploy

### Clerk Webhook

After deploying the backend, register a webhook in your Clerk dashboard:

- **URL:** `https://devflow-api.onrender.com/api/webhooks/clerk`
- **Events:** `user.created`, `user.updated`, `user.deleted`
- Copy the signing secret to `CLERK_WEBHOOK_SECRET`

---

## Testing

```bash
pnpm test
```

| Suite | Tests | Coverage |
|-------|-------|----------|
| Shared schema validation | 63 | Zod schemas for users, workspaces, tasks |
| API utilities | 24 | `AppError` factory, pagination helpers |
| Export service | 9 | `parseTypes` logic |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [`docs/01-SRS.md`](docs/01-SRS.md) | Software Requirements Specification |
| [`docs/02-SYSTEM-ARCHITECTURE.md`](docs/02-SYSTEM-ARCHITECTURE.md) | System architecture overview |
| [`docs/03-DATABASE-DESIGN.md`](docs/03-DATABASE-DESIGN.md) | MongoDB schema design |
| [`docs/04-API-DESIGN.md`](docs/04-API-DESIGN.md) | REST API endpoint reference |
| [`docs/05-UI-ARCHITECTURE.md`](docs/05-UI-ARCHITECTURE.md) | Frontend component structure |
| [`docs/06-FOLDER-STRUCTURE.md`](docs/06-FOLDER-STRUCTURE.md) | Repository directory layout |
| [`docs/07-DEVELOPMENT-ROADMAP.md`](docs/07-DEVELOPMENT-ROADMAP.md) | Phased implementation plan |

---

## License

MIT
