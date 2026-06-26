# DevFlow

A full-stack developer workspace built as a portfolio project demonstrating production-level engineering practices. DevFlow consolidates the tools developers use daily — task management, documentation, code snippets, GitHub integration, LeetCode tracking, API testing, and productivity — into a single, cohesive platform.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Customizable widgets: task stats, GitHub activity, LeetCode streak, recent docs |
| **Projects** | Kanban, list, and calendar views with labels, statuses, subtasks, and comments |
| **Documents** | Hierarchical document tree with rich-text editing and versioning |
| **Snippets** | Code snippet library with folder organisation and syntax highlighting |
| **GitHub** | Repository browser, pull requests, issues, commit history, and activity feed |
| **LeetCode** | Submission history, rating graph, streak tracker, and contest calendar |
| **API Tester** | Collections, environments, request history, and workspace proxy |
| **Productivity** | Pomodoro timer, daily planner, and focus session statistics |
| **Analytics** | Workspace-wide productivity metrics and activity trends |
| **Chat** | Real-time channel messaging via Socket.IO |
| **Notifications** | In-app, email, and browser push with granular preferences |
| **Settings** | Profile, account security, workspace management, and data export |

---

## Tech Stack

```
Frontend          Backend           Infrastructure
────────────────  ────────────────  ─────────────────────
React 19          Express 5         Vercel (frontend)
React Router 7    Node 22+          Render (backend)
Tailwind CSS 3    MongoDB + Mongoose MongoDB Atlas
shadcn/ui         Socket.IO 4       Cloudinary (uploads)
TanStack Query    Zod validation    Clerk (auth)
Vite 6            Helmet + CORS
TypeScript 5.9    pnpm workspaces
                  Turborepo
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              React + Vite SPA (Vercel CDN)              │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / WSS
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌─────────┐  ┌─────────┐  ┌──────────┐
         │  Clerk  │  │REST API │  │Socket.IO │
         │  (Auth) │  │(Render) │  │(same svc)│
         └─────────┘  └────┬────┘  └──────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ MongoDB  │ │Cloudinary│ │  GitHub  │
        │  Atlas   │ │(uploads) │ │ LeetCode │
        └──────────┘ └──────────┘ └──────────┘
```

**Monorepo layout:**

```
devflow/
├── apps/
│   ├── api/          Express REST API + Socket.IO server
│   └── web/          React SPA
├── packages/
│   └── shared/       Zod schemas, TypeScript types, constants
├── docs/             Architecture documentation
├── turbo.json        Turborepo pipeline
└── render.yaml       Render deployment config
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22.13.0
- **pnpm** ≥ 9.0.0 (`npm install -g pnpm`)
- **MongoDB** (local or Atlas connection string)
- **Clerk** account (free tier) — [clerk.com](https://clerk.com)
- **Cloudinary** account (free tier) — [cloudinary.com](https://cloudinary.com)

### 1. Clone and install

```bash
git clone https://github.com/895YB/DevFlow.git
cd DevFlow
pnpm install
```

### 2. Configure environment variables

**Backend** — copy `apps/api/.env.example` to `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_SECRET_KEY` | Clerk backend secret (`sk_...`) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret (`whsec_...`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CORS_ORIGIN` | Frontend URL (e.g. `http://localhost:5173`) |

**Frontend** — copy `apps/web/.env.example` to `apps/web/.env`:

```bash
cp apps/web/.env.example apps/web/.env
```

| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_...`) |
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api/v1`) |
| `VITE_SOCKET_URL` | Socket.IO server URL (defaults to API base) |

### 3. Run in development

```bash
pnpm dev
```

This starts both `apps/api` (port 5000) and `apps/web` (port 5173) in parallel via Turborepo.

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

Run from the **repository root**:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API + Web in watch mode |
| `pnpm build` | Production build for all packages |
| `pnpm lint` | ESLint across all packages |
| `pnpm type-check` | TypeScript check across all packages |
| `pnpm test` | Run unit tests (vitest) |

---

## API Overview

Base URL: `https://<your-api>.onrender.com/api/v1`

All protected routes require a Clerk session token in the `Authorization: Bearer <token>` header.

| Prefix | Resource |
|--------|----------|
| `GET /health` | Health check (no auth) |
| `/v1/users` | User profile, preferences, avatar |
| `/v1/workspaces` | Workspaces, members, roles |
| `/v1/projects` | Projects, statuses, labels |
| `/v1/tasks` | Tasks, subtasks, comments, attachments |
| `/v1/documents` | Documents, versions |
| `/v1/snippets` | Code snippets, folders |
| `/v1/integrations/github` | GitHub repos, PRs, issues |
| `/v1/integrations/leetcode` | LeetCode stats, submissions |
| `/v1/integrations/api-tester` | API collections, environments |
| `/v1/productivity` | Pomodoro sessions, planner |
| `/v1/notifications` | Notification feed, preferences |
| `/v1/chat` | Chat channels, messages |
| `/v1/search` | Workspace-wide search |
| `/v1/dashboard` | Dashboard widget data |
| `/v1/analytics` | Analytics metrics |
| `/v1/export` | Data export (JSON / CSV) |
| `/v1/ai` | AI features (stub, returns 501) |
| `/webhooks` | Clerk webhook receiver |

Full API design: [`docs/04-API-DESIGN.md`](docs/04-API-DESIGN.md)

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect the GitHub repository
3. Render auto-detects `render.yaml` — no manual config needed
4. Add the required environment variables in the Render dashboard (all variables marked `sync: false` in `render.yaml`)
5. Deploy — the API will be available at `https://devflow-api.onrender.com`

### Frontend — Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `apps/web`
3. Set **Framework Preset** to `Vite`
4. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` → `https://devflow-api.onrender.com/api/v1`
   - `VITE_SOCKET_URL` → `https://devflow-api.onrender.com`
5. Deploy

### Clerk Webhook Setup

After deploying the backend, register a webhook in your Clerk dashboard:

- **URL:** `https://devflow-api.onrender.com/api/webhooks/clerk`
- **Events:** `user.created`, `user.updated`, `user.deleted`
- Copy the signing secret to `CLERK_WEBHOOK_SECRET`

---

## Testing

```bash
pnpm test                # run all tests once
pnpm --filter @devflow/shared test:watch   # watch mode for schema tests
pnpm --filter @devflow/api test:watch      # watch mode for API tests
```

Test coverage:
- **Shared schemas** — 63 tests covering Zod validation for users, workspaces, and tasks
- **API utilities** — 24 tests covering `AppError` factory methods, pagination helpers
- **Export service** — 9 tests covering `parseTypes` logic

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/01-SRS.md`](docs/01-SRS.md) | Software Requirements Specification |
| [`docs/02-SYSTEM-ARCHITECTURE.md`](docs/02-SYSTEM-ARCHITECTURE.md) | High-level architecture |
| [`docs/03-DATABASE-DESIGN.md`](docs/03-DATABASE-DESIGN.md) | MongoDB schema design |
| [`docs/04-API-DESIGN.md`](docs/04-API-DESIGN.md) | REST API endpoint reference |
| [`docs/05-UI-ARCHITECTURE.md`](docs/05-UI-ARCHITECTURE.md) | Frontend component structure |
| [`docs/06-FOLDER-STRUCTURE.md`](docs/06-FOLDER-STRUCTURE.md) | Repository directory layout |
| [`docs/07-DEVELOPMENT-ROADMAP.md`](docs/07-DEVELOPMENT-ROADMAP.md) | Phased implementation plan |

---

## License

MIT
