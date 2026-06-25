# Folder Structure

## DevFlow — Monorepo Structure (Turborepo)

---

## 1. Root Structure

```
devflow/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   └── api/                    # Express.js backend
├── packages/
│   ├── shared/                 # Shared types, schemas, constants
│   ├── eslint-config/          # Shared ESLint configuration
│   └── tsconfig/               # Shared TypeScript configurations
├── docker/
│   ├── docker-compose.yml      # Local development compose
│   ├── Dockerfile.api          # API production Dockerfile
│   └── Dockerfile.web          # Web production Dockerfile
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, type-check, test on PR
│       └── deploy.yml          # Deploy on merge to main
├── turbo.json                  # Turborepo pipeline config
├── package.json                # Root package.json (workspaces)
├── pnpm-workspace.yaml         # pnpm workspace config
├── .gitignore
├── .env.example
└── README.md
```

---

## 2. Frontend — `apps/web/`

```
apps/web/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── routes/                     # Route definitions
│   │   │   ├── index.tsx               # Root route config
│   │   │   ├── auth.routes.tsx         # /sign-in, /sign-up
│   │   │   └── dashboard.routes.tsx    # All authenticated routes
│   │   ├── providers/                  # Context providers
│   │   │   ├── app-providers.tsx       # Composed provider wrapper
│   │   │   ├── theme-provider.tsx      # Dark/light mode
│   │   │   ├── socket-provider.tsx     # Socket.IO context
│   │   │   └── workspace-provider.tsx  # Active workspace context
│   │   └── app.tsx                     # Root App component
│   │
│   ├── components/                     # Shared UI components
│   │   ├── ui/                         # shadcn/ui components (generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── command.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   ├── layout/                     # Layout components
│   │   │   ├── landing-layout.tsx
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── top-bar.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── shared/                     # Reusable across features
│   │   │   ├── page-header.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── file-uploader.tsx
│   │   │   ├── user-avatar.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── markdown-editor.tsx
│   │   │   ├── markdown-preview.tsx
│   │   │   ├── code-block.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   └── loading-spinner.tsx
│   │   └── command-palette.tsx         # Global Cmd+K palette
│   │
│   ├── features/                       # Feature modules
│   │   ├── landing/
│   │   │   ├── components/
│   │   │   │   ├── landing-page.tsx
│   │   │   │   ├── hero-section.tsx
│   │   │   │   ├── features-section.tsx
│   │   │   │   ├── product-showcase.tsx
│   │   │   │   ├── testimonials-section.tsx
│   │   │   │   ├── faq-section.tsx
│   │   │   │   ├── contact-section.tsx
│   │   │   │   ├── landing-navbar.tsx
│   │   │   │   └── landing-footer.tsx
│   │   │   └── data/
│   │   │       ├── features-data.ts
│   │   │       ├── testimonials-data.ts
│   │   │       └── faq-data.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── dashboard-page.tsx
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   ├── todays-tasks.tsx
│   │   │   │   ├── recent-projects.tsx
│   │   │   │   ├── github-activity-widget.tsx
│   │   │   │   ├── leetcode-progress-widget.tsx
│   │   │   │   ├── recent-documents.tsx
│   │   │   │   ├── pomodoro-widget.tsx
│   │   │   │   ├── calendar-widget.tsx
│   │   │   │   ├── notifications-widget.tsx
│   │   │   │   ├── productivity-analytics.tsx
│   │   │   │   └── quick-actions.tsx
│   │   │   └── hooks/
│   │   │       └── use-dashboard-data.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── components/
│   │   │   │   ├── projects-page.tsx
│   │   │   │   ├── project-card.tsx
│   │   │   │   ├── create-project-dialog.tsx
│   │   │   │   ├── project-board/
│   │   │   │   │   ├── kanban-board.tsx
│   │   │   │   │   ├── kanban-column.tsx
│   │   │   │   │   └── kanban-card.tsx
│   │   │   │   ├── project-list/
│   │   │   │   │   └── list-view.tsx
│   │   │   │   ├── project-calendar/
│   │   │   │   │   └── calendar-view.tsx
│   │   │   │   └── project-settings/
│   │   │   │       ├── settings-page.tsx
│   │   │   │       ├── statuses-config.tsx
│   │   │   │       └── labels-config.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-projects.ts
│   │   │   │   ├── use-project.ts
│   │   │   │   └── use-project-mutations.ts
│   │   │   └── utils/
│   │   │       └── project-helpers.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── components/
│   │   │   │   ├── task-detail-sheet.tsx
│   │   │   │   ├── create-task-dialog.tsx
│   │   │   │   ├── task-form.tsx
│   │   │   │   ├── task-filters.tsx
│   │   │   │   ├── subtask-list.tsx
│   │   │   │   ├── task-comments.tsx
│   │   │   │   ├── task-activity.tsx
│   │   │   │   └── task-attachments.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-tasks.ts
│   │   │   │   ├── use-task.ts
│   │   │   │   └── use-task-mutations.ts
│   │   │   └── utils/
│   │   │       └── task-helpers.ts
│   │   │
│   │   ├── documents/
│   │   │   ├── components/
│   │   │   │   ├── documents-page.tsx
│   │   │   │   ├── document-tree.tsx
│   │   │   │   ├── document-editor.tsx
│   │   │   │   ├── document-preview.tsx
│   │   │   │   ├── version-history.tsx
│   │   │   │   └── create-document-dialog.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-documents.ts
│   │   │   │   ├── use-document.ts
│   │   │   │   └── use-document-mutations.ts
│   │   │   └── utils/
│   │   │       └── document-helpers.ts
│   │   │
│   │   ├── snippets/
│   │   │   ├── components/
│   │   │   │   ├── snippets-page.tsx
│   │   │   │   ├── snippet-card.tsx
│   │   │   │   ├── snippet-editor.tsx
│   │   │   │   ├── snippet-filters.tsx
│   │   │   │   ├── folder-tree.tsx
│   │   │   │   └── create-snippet-dialog.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-snippets.ts
│   │   │   │   └── use-snippet-mutations.ts
│   │   │   └── utils/
│   │   │       └── language-options.ts
│   │   │
│   │   ├── github/
│   │   │   ├── components/
│   │   │   │   ├── github-page.tsx
│   │   │   │   ├── repo-list.tsx
│   │   │   │   ├── repo-detail.tsx
│   │   │   │   ├── commit-list.tsx
│   │   │   │   ├── pull-request-list.tsx
│   │   │   │   ├── issue-list.tsx
│   │   │   │   └── connect-github.tsx
│   │   │   └── hooks/
│   │   │       ├── use-github-repos.ts
│   │   │       └── use-github-data.ts
│   │   │
│   │   ├── leetcode/
│   │   │   ├── components/
│   │   │   │   ├── leetcode-page.tsx
│   │   │   │   ├── stats-overview.tsx
│   │   │   │   ├── difficulty-chart.tsx
│   │   │   │   ├── submissions-list.tsx
│   │   │   │   ├── streak-tracker.tsx
│   │   │   │   ├── contest-history.tsx
│   │   │   │   └── connect-leetcode.tsx
│   │   │   └── hooks/
│   │   │       └── use-leetcode-data.ts
│   │   │
│   │   ├── api-tester/
│   │   │   ├── components/
│   │   │   │   ├── api-tester-page.tsx
│   │   │   │   ├── request-builder.tsx
│   │   │   │   ├── response-viewer.tsx
│   │   │   │   ├── collections-sidebar.tsx
│   │   │   │   ├── environment-manager.tsx
│   │   │   │   ├── request-history.tsx
│   │   │   │   ├── headers-editor.tsx
│   │   │   │   ├── params-editor.tsx
│   │   │   │   ├── body-editor.tsx
│   │   │   │   └── auth-config.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-api-collections.ts
│   │   │   │   ├── use-send-request.ts
│   │   │   │   └── use-environments.ts
│   │   │   └── utils/
│   │   │       └── variable-substitution.ts
│   │   │
│   │   ├── productivity/
│   │   │   ├── components/
│   │   │   │   ├── productivity-page.tsx
│   │   │   │   ├── pomodoro/
│   │   │   │   │   ├── pomodoro-timer.tsx
│   │   │   │   │   ├── timer-controls.tsx
│   │   │   │   │   └── session-history.tsx
│   │   │   │   ├── planner/
│   │   │   │   │   ├── daily-planner.tsx
│   │   │   │   │   ├── time-block.tsx
│   │   │   │   │   └── planner-calendar.tsx
│   │   │   │   └── stats/
│   │   │   │       ├── focus-stats-page.tsx
│   │   │   │       └── focus-chart.tsx
│   │   │   └── hooks/
│   │   │       ├── use-pomodoro.ts
│   │   │       ├── use-planner.ts
│   │   │       └── use-focus-stats.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   ├── chat-page.tsx
│   │   │   │   ├── channel-list.tsx
│   │   │   │   ├── message-list.tsx
│   │   │   │   ├── message-input.tsx
│   │   │   │   ├── message-bubble.tsx
│   │   │   │   └── create-channel-dialog.tsx
│   │   │   └── hooks/
│   │   │       ├── use-channels.ts
│   │   │       ├── use-messages.ts
│   │   │       └── use-chat-socket.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   ├── notifications-page.tsx
│   │   │   │   ├── notification-bell.tsx
│   │   │   │   ├── notification-item.tsx
│   │   │   │   └── notification-dropdown.tsx
│   │   │   └── hooks/
│   │   │       └── use-notifications.ts
│   │   │
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   ├── settings-page.tsx
│   │   │   │   ├── profile-settings.tsx
│   │   │   │   ├── workspace-settings.tsx
│   │   │   │   ├── notification-settings.tsx
│   │   │   │   ├── connections-settings.tsx
│   │   │   │   └── members-settings.tsx
│   │   │   └── hooks/
│   │   │       └── use-settings.ts
│   │   │
│   │   ├── workspace/
│   │   │   ├── components/
│   │   │   │   ├── workspace-switcher.tsx
│   │   │   │   ├── create-workspace-dialog.tsx
│   │   │   │   └── onboarding-page.tsx
│   │   │   └── hooks/
│   │   │       ├── use-workspaces.ts
│   │   │       └── use-workspace-members.ts
│   │   │
│   │   └── ai/                             # Reserved for future AI features
│   │       ├── components/                 # (empty in V1)
│   │       └── hooks/                      # (empty in V1)
│   │
│   ├── hooks/                          # Global hooks
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-media-query.ts
│   │   ├── use-click-outside.ts
│   │   └── use-keyboard-shortcut.ts
│   │
│   ├── lib/                            # Utilities and config
│   │   ├── api-client.ts               # Axios/fetch wrapper with auth
│   │   ├── socket.ts                   # Socket.IO client setup
│   │   ├── query-client.ts             # React Query config
│   │   ├── clerk.ts                    # Clerk config
│   │   ├── utils.ts                    # cn() and misc utilities
│   │   └── constants.ts               # App-wide constants
│   │
│   ├── styles/
│   │   └── globals.css                 # Tailwind directives + CSS vars
│   │
│   ├── types/                          # Frontend-only types
│   │   └── index.ts
│   │
│   ├── main.tsx                        # Entry point
│   └── vite-env.d.ts
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── components.json                     # shadcn/ui config
├── playwright.config.ts               # E2E test config
├── e2e/                               # Playwright tests
│   ├── auth.spec.ts
│   ├── projects.spec.ts
│   └── ...
├── package.json
└── .env.example
```

---

## 3. Backend — `apps/api/`

```
apps/api/
├── src/
│   ├── config/                         # Configuration
│   │   ├── env.ts                      # Environment variable validation (Zod)
│   │   ├── database.ts                 # MongoDB connection
│   │   ├── cloudinary.ts               # Cloudinary setup
│   │   └── socket.ts                   # Socket.IO setup
│   │
│   ├── middleware/                      # Express middleware
│   │   ├── auth.ts                     # Clerk JWT verification
│   │   ├── rate-limiter.ts             # Rate limiting config
│   │   ├── validate.ts                 # Zod validation middleware
│   │   ├── error-handler.ts            # Global error handler
│   │   ├── request-logger.ts           # Request logging
│   │   └── workspace-access.ts         # Workspace membership check
│   │
│   ├── modules/                        # Feature modules
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.validation.ts
│   │   │
│   │   ├── workspaces/
│   │   │   ├── workspace.model.ts
│   │   │   ├── workspace-member.model.ts
│   │   │   ├── workspace.service.ts
│   │   │   ├── workspace.controller.ts
│   │   │   ├── workspace.routes.ts
│   │   │   └── workspace.validation.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── project.model.ts
│   │   │   ├── project.service.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── project.routes.ts
│   │   │   └── project.validation.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── task.model.ts
│   │   │   ├── task-comment.model.ts
│   │   │   ├── task-activity.model.ts
│   │   │   ├── task.service.ts
│   │   │   ├── task.controller.ts
│   │   │   ├── task.routes.ts
│   │   │   └── task.validation.ts
│   │   │
│   │   ├── documents/
│   │   │   ├── document.model.ts
│   │   │   ├── document-version.model.ts
│   │   │   ├── document.service.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── document.routes.ts
│   │   │   └── document.validation.ts
│   │   │
│   │   ├── snippets/
│   │   │   ├── snippet.model.ts
│   │   │   ├── snippet-folder.model.ts
│   │   │   ├── snippet.service.ts
│   │   │   ├── snippet.controller.ts
│   │   │   ├── snippet.routes.ts
│   │   │   └── snippet.validation.ts
│   │   │
│   │   ├── github/
│   │   │   ├── github-connection.model.ts
│   │   │   ├── github.service.ts
│   │   │   ├── github.controller.ts
│   │   │   ├── github.routes.ts
│   │   │   └── github.validation.ts
│   │   │
│   │   ├── leetcode/
│   │   │   ├── leetcode-profile.model.ts
│   │   │   ├── leetcode.service.ts
│   │   │   ├── leetcode.controller.ts
│   │   │   ├── leetcode.routes.ts
│   │   │   └── leetcode.validation.ts
│   │   │
│   │   ├── api-tester/
│   │   │   ├── api-collection.model.ts
│   │   │   ├── api-request.model.ts
│   │   │   ├── api-environment.model.ts
│   │   │   ├── request-history.model.ts
│   │   │   ├── api-tester.service.ts
│   │   │   ├── api-tester.controller.ts
│   │   │   ├── api-tester.routes.ts
│   │   │   └── api-tester.validation.ts
│   │   │
│   │   ├── productivity/
│   │   │   ├── pomodoro-session.model.ts
│   │   │   ├── daily-plan.model.ts
│   │   │   ├── productivity.service.ts
│   │   │   ├── productivity.controller.ts
│   │   │   ├── productivity.routes.ts
│   │   │   └── productivity.validation.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── chat-channel.model.ts
│   │   │   ├── chat-message.model.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.routes.ts
│   │   │   └── chat.validation.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notification.model.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── notification.validation.ts
│   │   │
│   │   ├── upload/
│   │   │   ├── upload.service.ts
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.routes.ts
│   │   │   └── upload.validation.ts
│   │   │
│   │   ├── search/
│   │   │   ├── search.service.ts
│   │   │   ├── search.controller.ts
│   │   │   └── search.routes.ts
│   │   │
│   │   ├── audit-log/
│   │   │   ├── audit-log.model.ts
│   │   │   └── audit-log.service.ts
│   │   │
│   │   ├── ai/                             # Reserved for future AI features
│   │   │   ├── ai.service.ts              # (stub in V1)
│   │   │   ├── ai.controller.ts           # (returns 501 Not Implemented)
│   │   │   ├── ai.routes.ts               # (routes defined, not functional)
│   │   │   └── ai.validation.ts           # (empty schemas)
│   │   │
│   │   └── webhooks/
│   │       ├── clerk.controller.ts
│   │       └── webhooks.routes.ts
│   │
│   ├── socket/                         # Socket.IO event handlers
│   │   ├── index.ts                    # Socket setup & auth middleware
│   │   ├── presence.handler.ts
│   │   ├── notification.handler.ts
│   │   └── chat.handler.ts
│   │
│   ├── utils/                          # Shared utilities
│   │   ├── app-error.ts                # Custom error class
│   │   ├── catch-async.ts              # Async error wrapper
│   │   ├── api-response.ts             # Response formatter
│   │   ├── pagination.ts               # Pagination helper
│   │   ├── encryption.ts              # Token encryption utils
│   │   └── logger.ts                  # Structured JSON logger (abstracted interface)
│   │
│   ├── routes/                         # Route aggregation
│   │   └── index.ts                    # Mount all module routes
│   │
│   ├── app.ts                          # Express app setup
│   └── server.ts                       # HTTP server + Socket.IO startup
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── projects.test.ts
│   │   └── tasks.test.ts
│   └── setup.ts                        # Test database setup
│
├── tsconfig.json
├── nodemon.json
├── package.json
└── .env.example
```

---

## 4. Shared Package — `packages/shared/`

```
packages/shared/
├── src/
│   ├── types/                          # TypeScript interfaces
│   │   ├── user.types.ts
│   │   ├── workspace.types.ts
│   │   ├── project.types.ts
│   │   ├── task.types.ts
│   │   ├── document.types.ts
│   │   ├── snippet.types.ts
│   │   ├── github.types.ts
│   │   ├── leetcode.types.ts
│   │   ├── api-tester.types.ts
│   │   ├── productivity.types.ts
│   │   ├── chat.types.ts
│   │   ├── notification.types.ts
│   │   ├── api-response.types.ts
│   │   ├── ai.types.ts                 # Reserved for future AI features
│   │   └── index.ts
│   │
│   ├── schemas/                        # Zod validation schemas
│   │   ├── user.schema.ts
│   │   ├── workspace.schema.ts
│   │   ├── project.schema.ts
│   │   ├── task.schema.ts
│   │   ├── document.schema.ts
│   │   ├── snippet.schema.ts
│   │   └── index.ts
│   │
│   ├── constants/                      # Shared constants
│   │   ├── roles.ts                    # Role enums
│   │   ├── priorities.ts               # Priority enums
│   │   ├── limits.ts                   # Free tier limits
│   │   └── index.ts
│   │
│   └── index.ts                        # Package entry
│
├── tsconfig.json
└── package.json
```

---

## 5. Configuration Files — `packages/eslint-config/` & `packages/tsconfig/`

```
packages/eslint-config/
├── base.js                             # Base rules
├── react.js                            # React-specific rules
├── node.js                             # Node-specific rules
└── package.json

packages/tsconfig/
├── base.json                           # Base TS config
├── react.json                          # React TS config (extends base)
├── node.json                           # Node TS config (extends base)
└── package.json
```

---

## 6. Key File Purposes

| File | Purpose |
|------|---------|
| `turbo.json` | Defines build/lint/test pipelines and caching |
| `pnpm-workspace.yaml` | Declares monorepo workspace packages |
| `apps/web/src/lib/api-client.ts` | Configured fetch/axios instance with Clerk token injection |
| `apps/api/src/middleware/auth.ts` | Verifies Clerk JWT on every authenticated request |
| `apps/api/src/middleware/workspace-access.ts` | Checks user membership and role for workspace-scoped routes |
| `apps/api/src/utils/app-error.ts` | Custom error class with status code and error code |
| `apps/api/src/utils/catch-async.ts` | Wraps async route handlers to forward errors to error-handler |
| `apps/api/src/utils/logger.ts` | Structured JSON logger with pluggable transports (console in V1, Sentry/Datadog ready) |
| `apps/web/src/features/landing/` | Public landing page — hero, features, testimonials, FAQ, contact, footer |
| `packages/shared/src/schemas/` | Zod schemas used by both API (validation) and frontend (form validation) |
