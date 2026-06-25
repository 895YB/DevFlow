# Development Roadmap

## DevFlow — Phased Implementation Plan

---

## Overview

DevFlow is a **portfolio-grade project** demonstrating production-level engineering practices. V1 does not include payment/subscription functionality — the architecture supports adding it later without refactoring.

The project is divided into 8 phases, built incrementally. Each phase produces a working, testable increment. Features within each phase are ordered by dependency.

**Estimated total timeline:** 12–16 weeks (for a solo/small team, working consistently)

---

## Phase 0: Foundation (Week 1)

> Set up the monorepo, tooling, CI/CD, and base infrastructure.

| # | Task | Details |
|---|------|---------|
| 0.1 | Initialize monorepo | Turborepo + pnpm workspaces |
| 0.2 | Set up `packages/tsconfig` | Base, React, and Node TypeScript configs |
| 0.3 | Set up `packages/eslint-config` | ESLint + Prettier for both apps |
| 0.4 | Set up `packages/shared` | Package structure, build config |
| 0.5 | Initialize `apps/web` | Vite + React + TypeScript + Tailwind |
| 0.6 | Install and configure shadcn/ui | Set up component library, theme, globals.css |
| 0.7 | Initialize `apps/api` | Express + TypeScript + nodemon |
| 0.8 | Set up MongoDB connection | Mongoose connection with env config |
| 0.9 | Set up environment validation | Zod-based env validation for API |
| 0.10 | Docker Compose | MongoDB + API for local dev |
| 0.11 | GitHub Actions CI | Lint + type-check + test pipeline |
| 0.12 | API base middleware | helmet, cors, json parser, error handler, request logger |
| 0.13 | Structured logger | Logger utility with JSON output, request IDs, log levels, pluggable interface |
| 0.14 | API response utilities | AppError class, catchAsync, response formatter, pagination helper |
| 0.15 | Turbo pipeline config | Build, dev, lint, test tasks |
| 0.16 | Root scripts | `dev`, `build`, `lint`, `test` commands |

**Deliverable:** Running monorepo with both apps starting, API health check responding, structured logging working, CI passing.

---

## Phase 1: Landing Page, Authentication & Workspaces (Week 2–3)

> Public landing page, user authentication, workspace management, and user profiles.

| # | Task | Details |
|---|------|---------|
| 1.1 | Frontend: Landing page layout | Landing layout component with navbar and footer |
| 1.2 | Frontend: Hero section | Tagline, CTA buttons, animated product preview |
| 1.3 | Frontend: Features section | Feature cards with icons and descriptions |
| 1.4 | Frontend: Product showcase | Screenshots/mockups with alternating layout |
| 1.5 | Frontend: Testimonials, FAQ, Contact | Placeholder testimonials, accordion FAQ, contact form |
| 1.6 | Frontend: Landing page animations | Framer Motion entrance animations, smooth scroll |
| 1.7 | Set up Clerk | Create Clerk app, configure providers (email, Google, GitHub) |
| 1.8 | Frontend: ClerkProvider | Wrap app with ClerkProvider, configure appearance |
| 1.9 | Frontend: Auth pages | Sign In page (with forgot password link), Sign Up page using Clerk components |
| 1.10 | Frontend: Protected routes | Auth guard, redirect unauthenticated users |
| 1.11 | Backend: Clerk JWT middleware | Verify Clerk JWTs, extract userId |
| 1.12 | Backend: Clerk webhooks | User sync (user.created, user.updated, user.deleted) |
| 1.13 | Shared: User types & schemas | User interfaces (with expanded profile fields) and Zod schemas |
| 1.14 | Backend: User model & routes | Mongoose model, CRUD endpoints including profile (skills, links, portfolio) |
| 1.15 | Frontend: API client | Axios/fetch wrapper with Clerk token injection |
| 1.16 | Frontend: React Query setup | QueryClient, default options |
| 1.17 | Shared: Workspace types & schemas | Workspace and member interfaces |
| 1.18 | Backend: Workspace model & routes | Create, read, update, delete workspaces |
| 1.19 | Backend: Workspace members | Invite, roles, permissions, leave |
| 1.20 | Backend: Workspace access middleware | Check membership and role on workspace routes |
| 1.21 | Frontend: Onboarding flow | First-time workspace creation |
| 1.22 | Frontend: Dashboard layout | Sidebar, top bar, content area |
| 1.23 | Frontend: Workspace switcher | Switch between workspaces |
| 1.24 | Frontend: Theme provider | Dark/light mode/system toggle with persistence |
| 1.25 | Backend: Audit log model & service | Log major workspace actions |
| 1.26 | Backend: Rate limiting | Configure rate limiters per endpoint group |
| 1.27 | Frontend: User settings page | Profile edit (avatar, bio, skills, GitHub/LeetCode usernames, portfolio link), theme, notification preferences |

**Deliverable:** Public landing page live at `/`. Users can sign up/in, create workspaces, invite members, switch workspaces, edit full profile, toggle theme. Forgot password handled by Clerk.

---

## Phase 2: Project Management (Week 4–6)

> Full project management with Kanban, list, calendar views and task management.

| # | Task | Details |
|---|------|---------|
| 2.1 | Shared: Project & task types | All interfaces and validation schemas |
| 2.2 | Backend: Project model & CRUD | Create, list, update, delete projects |
| 2.3 | Backend: Project statuses & labels | Custom status columns and labels |
| 2.4 | Backend: Task model & CRUD | Full task CRUD with filtering and sorting |
| 2.5 | Backend: Subtasks | Add, update, delete, reorder subtasks |
| 2.6 | Backend: Task comments | CRUD with mentions |
| 2.7 | Backend: Task activity tracking | Auto-log changes to tasks |
| 2.8 | Backend: Task reordering | Drag-and-drop position updates |
| 2.9 | Backend: File upload (Cloudinary) | Image and file upload endpoint |
| 2.10 | Backend: Task attachments | Upload, list, delete attachments |
| 2.11 | Frontend: Projects list page | Grid of project cards, create dialog |
| 2.12 | Frontend: Kanban board | Columns, cards, drag-and-drop |
| 2.13 | Frontend: List view | Table with sorting and filtering |
| 2.14 | Frontend: Calendar view | Tasks on a calendar by due date |
| 2.15 | Frontend: Task detail sheet | Full task detail as a slide-over panel |
| 2.16 | Frontend: Task creation | Create task dialog/form |
| 2.17 | Frontend: Subtasks UI | Inline subtask list with checkboxes |
| 2.18 | Frontend: Task comments UI | Comment thread with mentions |
| 2.19 | Frontend: Task activity log | Timeline of changes |
| 2.20 | Frontend: Task filters | Filter bar for status, priority, assignee, labels |
| 2.21 | Frontend: File upload UI | Drag-and-drop uploader component |
| 2.22 | Frontend: Project settings | Manage statuses, labels |
| 2.23 | Frontend: Bulk task actions | Multi-select and bulk update/delete |
| 2.24 | Free tier limits | Enforce 5 projects per workspace limit |

**Deliverable:** Full project management with three views, task CRUD, subtasks, comments, activity history, file attachments, and filters.

---

## Phase 3: Documentation (Week 7–8)

> Markdown-based documentation system with nested pages and version history.

| # | Task | Details |
|---|------|---------|
| 3.1 | Shared: Document types & schemas | Document and version interfaces |
| 3.2 | Backend: Document model & CRUD | Create, read, update, delete with soft delete |
| 3.3 | Backend: Nested page hierarchy | Parent-child relationships, tree queries |
| 3.4 | Backend: Document versioning | Save version snapshots, list, restore |
| 3.5 | Backend: Full-text search | MongoDB text index search |
| 3.6 | Backend: Document reordering | Move and reorder in tree |
| 3.7 | Frontend: Document tree sidebar | Collapsible, nested, drag-to-reorder |
| 3.8 | Frontend: Markdown editor | CodeMirror-based editor with toolbar |
| 3.9 | Frontend: Markdown preview | Rendered markdown with syntax highlighting |
| 3.10 | Frontend: Version history UI | Version list, diff view, restore button |
| 3.11 | Frontend: Document search | Search bar with results |
| 3.12 | Frontend: Create/delete documents | Dialogs and confirmations |
| 3.13 | Frontend: Document breadcrumbs | Show document path in hierarchy |

**Deliverable:** Documentation system with nested pages, markdown editing, search, and version history.

---

## Phase 4: Code Snippets (Week 8–9)

> Personal and team code snippet library with organization.

| # | Task | Details |
|---|------|---------|
| 4.1 | Shared: Snippet types & schemas | Snippet and folder interfaces |
| 4.2 | Backend: Snippet model & CRUD | Full snippet management |
| 4.3 | Backend: Snippet folders | Folder CRUD and hierarchy |
| 4.4 | Backend: Snippet search | Search by title, tag, language, content |
| 4.5 | Backend: Favorites | Toggle favorite per user |
| 4.6 | Frontend: Snippet library page | Grid/list of snippets with sidebar filters |
| 4.7 | Frontend: Snippet editor | Code editor with language selection |
| 4.8 | Frontend: Syntax highlighting | Configure highlight.js or Prism for 20+ languages |
| 4.9 | Frontend: Folder tree | Snippet organization sidebar |
| 4.10 | Frontend: Tags and filters | Filter by language, tag, folder, favorites |
| 4.11 | Frontend: One-click copy | Copy to clipboard with toast confirmation |
| 4.12 | Free tier limits | Enforce 100 snippets limit |

**Deliverable:** Snippet library with folders, tags, search, syntax highlighting, and copy functionality.

---

## Phase 5: Integrations — GitHub & LeetCode (Week 9–11)

> External service integrations for developer profiles.

| # | Task | Details |
|---|------|---------|
| 5.1 | Backend: GitHub OAuth flow | Connect GitHub, store encrypted token |
| 5.2 | Backend: GitHub API service | Fetch repos, commits, PRs, issues |
| 5.3 | Backend: GitHub data caching | Cache responses in MongoDB with TTL |
| 5.4 | Backend: GitHub endpoints | All GitHub integration routes |
| 5.5 | Frontend: GitHub connect flow | OAuth redirect and callback |
| 5.6 | Frontend: Repository list | Paginated repo list with filters |
| 5.7 | Frontend: Repository detail | Commits, PRs, issues tabs |
| 5.8 | Frontend: Link repo to project | Associate GitHub repo with DevFlow project |
| 5.9 | Backend: LeetCode service | Fetch profile via GraphQL API |
| 5.10 | Backend: LeetCode data caching | Cache with TTL, manual refresh |
| 5.11 | Backend: LeetCode endpoints | Profile, stats, submissions, contests |
| 5.12 | Backend: Manual entries | Add/delete manual problem entries |
| 5.13 | Frontend: LeetCode connect | Username input and verification |
| 5.14 | Frontend: LeetCode dashboard | Stats overview, difficulty charts |
| 5.15 | Frontend: Submissions list | Recent submissions table |
| 5.16 | Frontend: Streak tracker | Current and longest streak display |
| 5.17 | Frontend: Contest history | Contest participation table |
| 5.18 | Frontend: Progress analytics | Charts showing progress over time |

**Deliverable:** GitHub repos/PRs/issues visible in DevFlow. LeetCode profile with analytics and streak tracking.

---

## Phase 6: API Tester & Productivity (Week 11–13)

> Postman-like API tester and productivity tools.

| # | Task | Details |
|---|------|---------|
| 6.1 | Backend: API proxy endpoint | Server-side HTTP proxy to avoid CORS |
| 6.2 | Backend: Collections & requests CRUD | Save and organize API requests |
| 6.3 | Backend: Environments CRUD | Environment variables management |
| 6.4 | Backend: Request history | Auto-save with TTL cleanup |
| 6.5 | Frontend: Request builder | Method selector, URL input, tabs for params/headers/body/auth |
| 6.6 | Frontend: Response viewer | Syntax-highlighted response, status, timing |
| 6.7 | Frontend: Collections sidebar | Organized request tree |
| 6.8 | Frontend: Environment manager | Variable management with active env selector |
| 6.9 | Frontend: Variable substitution | Replace {{variables}} in requests |
| 6.10 | Frontend: Request history | History list with replay |
| 6.11 | Frontend: Auth helpers | Bearer, Basic, API key configuration |
| 6.12 | Backend: Pomodoro endpoints | Session CRUD, statistics |
| 6.13 | Backend: Daily planner endpoints | Plan CRUD, item toggle |
| 6.14 | Frontend: Pomodoro timer | Timer circle, controls, sound |
| 6.15 | Frontend: Session history | Past sessions list |
| 6.16 | Frontend: Daily planner | Time-blocked task list |
| 6.17 | Frontend: Focus statistics | Charts for daily/weekly/monthly focus time |
| 6.18 | Frontend: Browser notifications | Notification permission and timer alerts |

**Deliverable:** Functional API tester with collections, environments, and history. Pomodoro timer and daily planner with statistics.

---

## Phase 7: Real-Time & Collaboration (Week 13–15)

> Socket.IO integration, chat, notifications, and real-time presence.

| # | Task | Details |
|---|------|---------|
| 7.1 | Backend: Socket.IO setup | Server setup with Clerk JWT auth |
| 7.2 | Backend: Presence system | Track online/offline status per workspace |
| 7.3 | Backend: Notification model & service | Create and deliver notifications |
| 7.4 | Backend: Real-time event emission | Emit events on task/doc/project changes |
| 7.5 | Backend: Chat model & CRUD | Channels, DMs, messages |
| 7.6 | Backend: Chat socket handlers | Real-time message delivery |
| 7.7 | Frontend: Socket.IO provider | Connect, authenticate, manage rooms |
| 7.8 | Frontend: Online presence | Green dots on user avatars |
| 7.9 | Frontend: Notification system | Bell icon, dropdown, unread count, mark as read |
| 7.10 | Frontend: Notification page | Full notification history with filters (type, read status) |
| 7.11 | Frontend: Browser notifications | Request permission, show browser push notifications for key events |
| 7.12 | Frontend: Real-time updates | Invalidate React Query cache on socket events |
| 7.13 | Frontend: Chat channel list | Workspace channels and DMs |
| 7.14 | Frontend: Chat message view | Message list with infinite scroll |
| 7.15 | Frontend: Chat message input | Text input with mentions |
| 7.16 | Frontend: Notification settings | Per-type toggles for in-app and browser notifications |
| 7.17 | Activity feed | Workspace-wide activity stream |

**Deliverable:** Real-time notifications, online presence, workspace chat, and live updates across the app.

---

## Phase 8: Polish & Launch (Week 15–16)

> Command palette, search, performance optimization, testing, and deployment.

| # | Task | Details |
|---|------|---------|
| 8.1 | Backend: Global search endpoint | Search across projects, tasks, documents, snippets, API collections |
| 8.2 | Frontend: Command palette | Cmd+K with global search, quick actions, recent items, keyboard navigation |
| 8.3 | Frontend: Global search bar | Top-bar search input feeding the same search backend |
| 8.4 | Backend: Dashboard endpoint | Aggregated dashboard data (today's tasks, recent projects, stats) |
| 8.5 | Frontend: Dashboard page | Full widget grid: today's tasks, recent projects, GitHub activity, LeetCode progress, recent docs, pomodoro widget, calendar, notifications, productivity analytics, quick actions |
| 8.6 | Backend: AI module stubs | Empty module with routes returning 501 Not Implemented |
| 8.7 | Frontend: Error boundaries | Feature-level error boundaries |
| 8.8 | Frontend: Empty states | Illustrated empty states for all features |
| 8.9 | Frontend: Loading skeletons | Skeleton screens for all data-loading states |
| 8.10 | Frontend: Responsive design pass | Test and fix all breakpoints |
| 8.11 | Frontend: Animations | Framer Motion page transitions, micro-interactions |
| 8.12 | Frontend: Accessibility audit | Full WCAG 2.1 AA pass — keyboard nav, focus management, ARIA attributes, color contrast, screen reader testing |
| 8.13 | Performance: Lazy loading | Route-level code splitting |
| 8.14 | Performance: Image optimization | Cloudinary transforms, lazy load images |
| 8.15 | Performance: API optimization | Select fields, lean queries, pagination |
| 8.16 | Security: Audit | Review all endpoints, inputs, permissions |
| 8.17 | Testing: Unit tests | Key services and utilities |
| 8.18 | Testing: Integration tests | API endpoint tests |
| 8.19 | Testing: E2E tests | Critical user flows with Playwright |
| 8.20 | Documentation: API docs | API endpoint documentation |
| 8.21 | Deployment: Vercel setup | Frontend deployment config |
| 8.22 | Deployment: Render setup | Backend deployment config |
| 8.23 | Deployment: MongoDB Atlas | Production cluster setup |
| 8.24 | Deployment: Environment config | Production env variables |
| 8.25 | Deployment: Domain & SSL | Custom domain setup |
| 8.26 | Monitoring: Health checks & logging | Verify structured logging, health endpoint, error handling |
| 8.27 | Launch checklist | Final review, smoke test, go live |

**Deliverable:** Production-ready, portfolio-grade application deployed and accessible with full dashboard, global search, accessibility compliance, and structured logging.

---

## Summary Timeline

```
Week  1      : Phase 0 — Foundation
Week  2–3    : Phase 1 — Authentication & Workspaces
Week  4–6    : Phase 2 — Project Management
Week  7–8    : Phase 3 — Documentation
Week  8–9    : Phase 4 — Code Snippets
Week  9–11   : Phase 5 — GitHub & LeetCode Integrations
Week  11–13  : Phase 6 — API Tester & Productivity
Week  13–15  : Phase 7 — Real-Time & Collaboration
Week  15–16  : Phase 8 — Polish & Launch
```

---

## Future Phases (Post-V1)

| Phase | Feature | Notes |
|-------|---------|-------|
| F1 | AI Module | AI code review, doc generation, bug detection, task suggestions, chat assistant (using Claude API) |
| F2 | Payment & Subscriptions | Stripe integration, freemium plan enforcement, billing portal |
| F3 | Email Notifications | Transactional email delivery (Resend/SendGrid) for task assignments, mentions, digests |
| F4 | VS Code Extension | View tasks, snippets, and docs from VS Code |
| F5 | Chrome Extension | Quick capture snippets, save links, mini timer |
| F6 | Mobile App | React Native app for on-the-go access |
| F7 | Public REST API | Third-party integrations |
| F8 | Plugin System | Community extensions |
| F9 | Real-time Collaboration | Collaborative document editing (CRDT/OT) |
| F10 | Advanced Analytics | Team velocity, burndown charts, custom reports |

---

## Definition of Done (per feature)

- [ ] Backend endpoints implemented with Zod validation and structured error responses
- [ ] Frontend UI complete and functional
- [ ] Shared types and schemas in sync
- [ ] Error handling covers edge cases
- [ ] Responsive on all breakpoints (mobile, tablet, desktop, wide)
- [ ] Dark and light mode verified
- [ ] Loading and empty states implemented
- [ ] Keyboard navigation works for all interactive elements
- [ ] ARIA attributes on custom components
- [ ] Structured logging in place for new endpoints
- [ ] Manual testing passed
- [ ] Code reviewed and merged
