# UI Architecture

## DevFlow — Frontend Design System & Page Structure

---

## 1. Design System

### 1.1 Design Tokens

Built on shadcn/ui with Tailwind CSS. All design tokens defined via CSS variables for theme switching.

```
Colors (semantic):
  --background          Main background
  --foreground          Primary text
  --card                Card/panel backgrounds
  --card-foreground     Card text
  --primary             Brand/accent color (actions, links)
  --primary-foreground  Text on primary
  --secondary           Secondary actions
  --muted               Subtle backgrounds (hover, disabled)
  --muted-foreground    Secondary text
  --accent              Highlights
  --destructive         Errors, delete actions
  --border              Borders
  --ring                Focus rings
  --sidebar             Sidebar background
  --sidebar-foreground  Sidebar text

Brand Colors:
  Primary:     Blue (#3B82F6 / Tailwind blue-500)
  Secondary:   Violet (#8B5CF6)
  Accent:      Emerald (#10B981)

Typography:
  Font Family: Inter (sans-serif)
  Monospace:   JetBrains Mono (code blocks, snippets)
  Scale:       text-xs (12px) → text-sm (14px) → text-base (16px)
               → text-lg (18px) → text-xl (20px) → text-2xl (24px)
               → text-3xl (30px) → text-4xl (36px)

Spacing:
  Base unit: 4px (Tailwind default)
  Common:    4, 8, 12, 16, 20, 24, 32, 40, 48, 64

Border Radius:
  sm: 6px    (inputs, small elements)
  md: 8px    (cards, panels)
  lg: 12px   (modals, large cards)
  full: 9999px (avatars, badges)

Shadows:
  sm:   0 1px 2px rgba(0,0,0,0.05)
  md:   0 4px 6px rgba(0,0,0,0.07)
  lg:   0 10px 15px rgba(0,0,0,0.1)
```

### 1.2 Component Library

Using shadcn/ui components, extended as needed:

**Base Components (shadcn/ui):**
- Button, Input, Textarea, Select, Checkbox, Switch, Slider
- Dialog, Sheet, Popover, Dropdown Menu, Context Menu
- Tabs, Accordion, Collapsible
- Avatar, Badge, Tooltip
- Table, Card, Separator
- Toast, Alert, Skeleton
- Command (for command palette)
- Calendar, Date Picker

**Custom Components (built on top):**
- PageHeader — consistent page titles with breadcrumbs and actions
- EmptyState — illustrated empty states with call-to-action
- DataTable — sortable, filterable table with pagination
- KanbanBoard — drag-and-drop board
- MarkdownEditor — code-mirror based editor with toolbar
- MarkdownPreview — rendered markdown with syntax highlighting
- CodeBlock — syntax-highlighted code with copy button
- UserAvatar — avatar with online presence indicator
- SearchInput — debounced search with loading state
- FileUploader — drag-and-drop file upload with preview

---

## 2. Layout Architecture

### 2.0 Landing Page Layout (Public)

```
┌──────────────────────────────────────────────────────────────┐
│  NAV: [◆ DevFlow]              [Features] [FAQ]  [Sign In]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                        HERO SECTION                          │
│                                                              │
│           Your All-in-One Developer Workspace                │
│                                                              │
│    Manage projects, write docs, save snippets,               │
│    track progress — all in one place.                        │
│                                                              │
│        [Get Started — Free]     [Learn More]                 │
│                                                              │
│         ┌──────────────────────────────────┐                 │
│         │                                  │                 │
│         │   Animated Product Preview /     │                 │
│         │   Hero Image / Dashboard         │                 │
│         │   Screenshot with glassmorphism  │                 │
│         │                                  │                 │
│         └──────────────────────────────────┘                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                     FEATURES SECTION                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 📋       │  │ 📄       │  │ 💻       │  │ 🐙       │    │
│  │ Project  │  │ Docs     │  │ Snippets │  │ GitHub   │    │
│  │ Mgmt     │  │          │  │          │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 📊       │  │ 🔌       │  │ ⏱️        │  │ 💬       │    │
│  │ LeetCode │  │ API Test │  │ Focus    │  │ Chat     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                   PRODUCT SHOWCASE                           │
│                                                              │
│  Screenshots / mockups of key features with                  │
│  alternating left-right layout and descriptions              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    TESTIMONIALS                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ "DevFlow     │  │ "Perfect for │  │ "The best    │      │
│  │  changed my  │  │  our startup │  │  developer   │      │
│  │  workflow."  │  │  team."      │  │  tool."      │      │
│  │  — Dev A     │  │  — Dev B     │  │  — Dev C     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  (Placeholder content for V1)                                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                        FAQ                                   │
│                                                              │
│  ▸ What is DevFlow?                                          │
│  ▸ Is it free?                                               │
│  ▸ What integrations are supported?                          │
│  ▸ Can I use it with my team?                                │
│  ▸ Is my data secure?                                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                      CONTACT                                 │
│                                                              │
│  Have questions? Reach out to us.                            │
│  [Email input]  [Message textarea]  [Send]                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  ◆ DevFlow    [GitHub] [Twitter] [LinkedIn]                  │
│  Features | Docs | Contact | Privacy | Terms                 │
│  © 2026 DevFlow. All rights reserved.                        │
└──────────────────────────────────────────────────────────────┘

Design notes:
- Gradient backgrounds with subtle grid/dot patterns
- Glassmorphism cards for feature highlights
- Smooth scroll between sections
- Framer Motion entrance animations (staggered fade-up)
- Fully responsive: stacks to single column on mobile
- Dark/light mode support
- Inspired by: Linear.app, Vercel.com, Notion.so, Stripe.com
```

### 2.1 Auth Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│            ┌───────────────────────┐                │
│            │                       │                │
│            │     DevFlow Logo      │                │
│            │                       │                │
│            │   ┌───────────────┐   │                │
│            │   │  Sign In Form │   │                │
│            │   │               │   │                │
│            │   │  Email        │   │                │
│            │   │  Password     │   │                │
│            │   │               │   │                │
│            │   │  [Sign In]    │   │                │
│            │   │               │   │                │
│            │   │  ── or ──     │   │                │
│            │   │               │   │                │
│            │   │  [Google]     │   │                │
│            │   │  [GitHub]     │   │                │
│            │   └───────────────┘   │                │
│            │                       │                │
│            └───────────────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘

Centered card on gradient/subtle pattern background.
Clerk's <SignIn /> and <SignUp /> components, styled to match.
```

### 2.2 Dashboard Layout

```
┌──────┬──────────────────────────────────────────────┐
│      │  Top Bar                                ≡  🔔│
│  S   │  ┌─ Breadcrumbs ─────────────  [Search] ──┐ │
│  I   │  └────────────────────────────────────────-┘ │
│  D   ├──────────────────────────────────────────────┤
│  E   │                                              │
│  B   │                                              │
│  A   │              Main Content Area               │
│  R   │                                              │
│      │              (Route outlet)                  │
│  N   │                                              │
│  A   │                                              │
│  V   │                                              │
│      │                                              │
│  ··  │                                              │
│  👤  │                                              │
└──────┴──────────────────────────────────────────────┘
```

### 2.3 Sidebar Navigation

```
┌──────────────────────┐
│  ◆ DevFlow           │  ← Logo + workspace name
│  Workspace ▾         │  ← Workspace switcher dropdown
├──────────────────────┤
│                      │
│  🏠 Dashboard        │  ← Overview / home
│  📋 Projects         │  ← Project management
│  📄 Documents        │  ← Documentation
│  💻 Snippets         │  ← Code snippets
│  🐙 GitHub           │  ← GitHub integration
│  📊 LeetCode         │  ← LeetCode tracker
│  🔌 API Tester       │  ← API testing
│  ⏱️  Productivity     │  ← Pomodoro & planner
│  💬 Chat             │  ← Team chat
│                      │
├──────────────────────┤
│                      │
│  Recent              │  ← Recently visited items
│   └ Project Alpha    │
│   └ API Design Doc   │
│   └ React Hooks...   │
│                      │
├──────────────────────┤
│  ⚙️  Settings         │
│  👤 John Doe         │  ← User menu
│  ● Online            │  ← Presence indicator
└──────────────────────┘

Width: 256px (collapsible to 64px icon-only mode)
Keyboard shortcut: Ctrl/Cmd + B to toggle
```

---

## 3. Page Specifications

### 3.1 Dashboard (Home)

```
┌────────────────────────────────────────────────────────────┐
│  Welcome back, John 👋            [+ New Task] [+ New Doc] │
│                                   [+ Snippet] [Start Timer]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───── Stats Row ──────────────────────────────────────┐  │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │ │ Tasks    │ │ Projects │ │ Focus    │ │ Streak   │ │  │
│  │ │ 8 today  │ │ 5 active │ │ 4.5 hrs  │ │ 12 days  │ │  │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ Today's Tasks ─────────────┐ ┌─ Pomodoro Timer ─────┐ │
│  │ ☐ Implement auth   🔴 HIGH │ │    25:00              │ │
│  │ ☐ Write API docs   🟡 MED  │ │    ●●●●○              │ │
│  │ ☐ Fix sidebar bug  🟢 LOW  │ │   [Start]             │ │
│  │ ☐ Review PR #42    🟡 MED  │ │                       │ │
│  │ 3 overdue tasks ⚠️          │ │   Session 1 of 4      │ │
│  └─────────────────────────────┘ └───────────────────────┘ │
│                                                            │
│  ┌─ Recent Projects ───────────┐ ┌─ Calendar ───────────┐ │
│  │ 📋 Project Alpha    2h ago  │ │   June 2026          │ │
│  │ 📋 DevFlow API      5h ago  │ │   ┌──┬──┬──┬──┬──┐  │ │
│  │ 📋 Portfolio Site    1d ago  │ │   │23│24│25│26│27│  │ │
│  │ 📋 React Hooks      2d ago  │ │   │  │  │▪▪│▪ │  │  │ │
│  │ 📋 ML Pipeline      3d ago  │ │   └──┴──┴──┴──┴──┘  │ │
│  └─────────────────────────────┘ └───────────────────────┘ │
│                                                            │
│  ┌─ GitHub Activity ───────────┐ ┌─ LeetCode Progress ──┐ │
│  │ ✓ Merged PR #38    1h ago   │ │ Solved: 247 total    │ │
│  │ ↑ Pushed 3 commits 2h ago   │ │ 🟢 Easy:    120      │ │
│  │ ⊕ Opened PR #42    5h ago   │ │ 🟡 Medium:   95      │ │
│  │ ✓ Merged PR #37    1d ago   │ │ 🔴 Hard:     32      │ │
│  │ [View all on GitHub →]      │ │ 🔥 Streak:  12 days  │ │
│  └─────────────────────────────┘ └───────────────────────┘ │
│                                                            │
│  ┌─ Recent Documents ──────────┐ ┌─ Notifications ──────┐ │
│  │ 📄 API Design Guide  2h ago │ │ 🔔 Jane assigned you │ │
│  │ 📄 Auth Flow Docs    5h ago │ │    to "Fix sidebar"  │ │
│  │ 📄 DB Schema Notes   1d ago │ │ 💬 Bob commented on  │ │
│  │ 📄 Sprint Planning   2d ago │ │    "Auth Flow"       │ │
│  │ 📄 Meeting Notes     3d ago │ │ 📋 New task created  │ │
│  └─────────────────────────────┘ └───────────────────────┘ │
│                                                            │
│  ┌─ Productivity Analytics ────────────────────────────┐   │
│  │  Focus Time This Week                               │   │
│  │  ██████████░░ 18.5 / 25 hrs    Mon-Fri sparkline    │   │
│  │  Sessions: 24 completed    Avg: 28 min/session      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘

Dashboard layout:
- Responsive CSS Grid: 2 columns on desktop, 1 on mobile
- Each widget is a card component with consistent header/content pattern
- Widgets fetch data independently via React Query (parallel loading)
- Skeleton loading for each widget while data loads
- Quick Actions row at the top for fast access
```

### 3.2 Projects — Kanban View

```
┌──────────────────────────────────────────────────────┐
│  Project: Alpha  ⭐                                   │
│  [Kanban] [List] [Calendar]    [Filter ▾] [+ Task]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ Todo (3) ──┐  ┌─ In Progress ┐  ┌─ Done (5) ─┐ │
│  │             │  │   (2)         │  │             │ │
│  │ ┌─────────┐ │  │ ┌─────────┐  │  │ ┌─────────┐ │ │
│  │ │ Task 1  │ │  │ │ Task 4  │  │  │ │ Task 6  │ │ │
│  │ │ 🔴 HIGH │ │  │ │ 🟡 MED  │  │  │ │ ✅       │ │ │
│  │ │ @john   │ │  │ │ @jane   │  │  │ │ @john   │ │ │
│  │ │ Jun 26  │ │  │ │ Jun 25  │  │  │ │ Jun 24  │ │ │
│  │ └─────────┘ │  │ └─────────┘  │  │ └─────────┘ │ │
│  │             │  │              │  │             │ │
│  │ ┌─────────┐ │  │ ┌─────────┐  │  │ ┌─────────┐ │ │
│  │ │ Task 2  │ │  │ │ Task 5  │  │  │ │ Task 7  │ │ │
│  │ └─────────┘ │  │ └─────────┘  │  │ └─────────┘ │ │
│  │             │  │              │  │             │ │
│  │ [+ Add]     │  │ [+ Add]      │  │             │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘

Task cards show: title, priority badge, assignee avatar, due date, label dots.
Drag and drop between columns using @dnd-kit or react-beautiful-dnd.
```

### 3.3 Task Detail (Sheet/Modal)

```
┌───────────────────────────────────────────────┐
│  Task: Implement Auth Flow              [✕]   │
├───────────────────────────────────────────────┤
│                                               │
│  Status:    [In Progress ▾]                   │
│  Priority:  [🔴 High ▾]                       │
│  Assignees: [👤 John] [👤 Jane] [+ Add]       │
│  Labels:    [Frontend] [Auth] [+ Add]         │
│  Due Date:  [📅 Jun 26, 2026]                 │
│  Project:   Alpha                             │
│                                               │
│  ── Description ──────────────────────────    │
│  │ Markdown editor with toolbar           │   │
│  │                                        │   │
│  │ Implement the authentication flow      │   │
│  │ using Clerk. Include:                  │   │
│  │ - Sign in page                         │   │
│  │ - Sign up page                         │   │
│  │ - OAuth buttons                        │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ── Subtasks (2/4) ──────────────────────     │
│  ☑ Set up Clerk provider                      │
│  ☑ Create sign in page                        │
│  ☐ Create sign up page                        │
│  ☐ Add protected routes                       │
│  [+ Add subtask]                              │
│                                               │
│  ── Attachments ─────────────────────────     │
│  📎 wireframe.png (245 KB)   [🗑]              │
│  [+ Upload]                                   │
│                                               │
│  ── Activity ────────────────────────────     │
│  [Comments] [History]                         │
│                                               │
│  💬 Jane: "Looks good, needs tests" — 2h ago  │
│  📝 Status changed: Todo → In Progress — 3h   │
│                                               │
│  ┌─ Add comment ──────────────────────────┐   │
│  │ Type a comment... @mention             │   │
│  │                              [Send]    │   │
│  └────────────────────────────────────────┘   │
│                                               │
└───────────────────────────────────────────────┘
```

### 3.4 Document Editor

```
┌────────────────────┬─────────────────────────────────┐
│  Document Tree     │  📄 API Design Guide             │
│                    │                                  │
│  📁 Getting Started│  B  I  U  H1 H2 H3  🔗  📷  </>  │
│    📄 Overview     │  ─────────────────────────────── │
│    📄 Installation │                                  │
│  📁 Architecture   │  # API Design Guide              │
│    📄 API Design ← │                                  │
│    📄 Database     │  This document outlines the      │
│  📁 Guides         │  REST API conventions for the    │
│    📄 Auth Guide   │  DevFlow platform.               │
│                    │                                  │
│  [+ New Page]      │  ## Endpoints                    │
│                    │                                  │
│                    │  All endpoints follow REST       │
│                    │  conventions with versioned      │
│                    │  paths...                        │
│                    │                                  │
│                    │  ```javascript                   │
│                    │  const response = await fetch(   │
│                    │    '/api/v1/projects'             │
│                    │  );                              │
│                    │  ```                             │
│                    │                                  │
│                    │  Last edited 2 hours ago by John │
│                    │  [Version History]               │
└────────────────────┴─────────────────────────────────┘

Left panel: collapsible document tree with drag-to-reorder.
Right panel: markdown editor (split or WYSIWYG mode).
```

### 3.5 API Tester

```
┌──────────────────┬───────────────────────────────────┐
│  Collections     │  Request                          │
│                  │                                   │
│  📁 Auth API     │  [GET ▾] [https://api.example...] │
│    GET /login    │                             [Send] │
│    POST /signup  │                                   │
│  📁 Users API ←  │  [Params] [Headers] [Body] [Auth] │
│    GET /users    │  ┌─────────────────────────────┐  │
│    POST /users   │  │ Content-Type: application/  │  │
│    GET /users/:id│  │ Authorization: Bearer {{    │  │
│                  │  │                             │  │
│  [+ Collection]  │  └─────────────────────────────┘  │
│                  │                                   │
│  ── History ──   │  Response          200 OK  245ms  │
│  GET /users 200  │  ┌─────────────────────────────┐  │
│  POST /login 200 │  │ {                           │  │
│  GET /users 401  │  │   "success": true,          │  │
│                  │  │   "data": {                  │  │
│  ── Environment  │  │     "users": [...]           │  │
│  [Development ▾] │  │   }                          │  │
│  BASE_URL=...    │  │ }                            │  │
│  API_KEY=...     │  └─────────────────────────────┘  │
└──────────────────┴───────────────────────────────────┘
```

### 3.6 Command Palette

```
┌─────────────────────────────────────────────┐
│  🔍 Type a command or search...              │
├─────────────────────────────────────────────┤
│                                             │
│  Recent                                     │
│  ├ 📋 Project Alpha                         │
│  ├ 📄 API Design Guide                      │
│  └ 💻 React useState Hook                   │
│                                             │
│  Actions                                    │
│  ├ + Create new task                        │
│  ├ + Create new document                    │
│  ├ + Create new snippet                     │
│  ├ 🌙 Toggle dark mode                      │
│  └ ⚙️  Open settings                        │
│                                             │
│  Navigation                                 │
│  ├ → Go to Projects                         │
│  ├ → Go to Documents                        │
│  └ → Go to Snippets                         │
│                                             │
└─────────────────────────────────────────────┘

Opens with Ctrl/Cmd + K.
Fuzzy search across all content types.
Keyboard navigation with arrow keys.
Uses shadcn/ui Command component (built on cmdk).
```

---

## 4. Page Routing

```
/                           → Landing page (public, unauthenticated)
/sign-in                    → Clerk Sign In
/sign-up                    → Clerk Sign Up
/onboarding                 → Workspace creation (first-time users)

/dashboard                  → Home dashboard
/projects                   → Projects list
/projects/:projectId        → Project board (default: kanban)
/projects/:projectId/list   → Project list view
/projects/:projectId/calendar → Project calendar view
/projects/:projectId/settings → Project settings

/documents                  → Document tree root
/documents/:documentId      → Document editor

/snippets                   → Snippet library
/snippets/:snippetId        → Snippet detail/editor

/github                     → GitHub overview
/github/:owner/:repo        → Repository detail

/leetcode                   → LeetCode dashboard

/api-tester                 → API testing interface

/productivity               → Productivity hub
/productivity/pomodoro      → Pomodoro timer
/productivity/planner       → Daily planner
/productivity/stats         → Focus statistics

/chat                       → Chat channels list
/chat/:channelId            → Chat channel

/notifications              → All notifications

/settings                   → User settings
/settings/profile           → Profile settings
/settings/workspace         → Workspace settings (if admin/owner)
/settings/notifications     → Notification preferences
/settings/connections       → Connected accounts
/settings/members           → Member management (if admin/owner)

All workspace-scoped routes are prefixed internally with the active workspace context
(stored in URL params, context, or localStorage).
Actual URL pattern: /w/:workspaceSlug/projects/:projectId
```

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Mobile | < 640px | Sidebar hidden (hamburger menu), single column, stacked layouts |
| Tablet | 640–1024px | Sidebar collapsed (icons only), two-column where applicable |
| Desktop | 1024–1440px | Full sidebar, standard layouts |
| Wide | > 1440px | Full sidebar, max-width content containers |

---

## 6. Animation Strategy (Framer Motion)

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transitions | Fade + slight slide up | 200ms |
| Modal/Sheet open | Scale from 0.95 + fade | 200ms |
| Sidebar toggle | Width transition | 200ms |
| Task card drag | Scale 1.02 + shadow | During drag |
| Toast notifications | Slide in from right | 300ms |
| Dropdown menus | Scale from 0.95 + fade | 150ms |
| Skeleton → content | Fade crossover | 300ms |
| List item enter | Staggered fade + slide | 50ms stagger |
| Button press | Scale 0.98 | 100ms |

Respect `prefers-reduced-motion` — disable animations when set.

---

## 7. Accessibility (WCAG 2.1 AA Compliance)

### 7.1 Keyboard Navigation
- All interactive elements reachable via Tab key in logical order
- Visible focus indicators (ring style) on all focusable elements in both themes
- Arrow key navigation within menus, lists, tabs, and command palette
- Escape key closes modals, dropdowns, sheets, and command palette
- Enter/Space activates buttons, links, and toggles
- Custom keyboard shortcuts documented and non-conflicting with OS/browser defaults

### 7.2 Focus Management
- Focus moves to modal/dialog content when opened, returns to trigger when closed
- Focus trap inside modals, sheets, and the command palette (Tab cycles within)
- On page navigation, focus moves to the main content area
- Dynamic content additions (toast, notification dropdown) do not steal focus

### 7.3 ARIA Attributes
- `aria-label` on all icon-only buttons (e.g., close, delete, toggle sidebar)
- `aria-expanded` on collapsible elements (accordion, sidebar, dropdowns)
- `aria-selected` on tabs, selected list items, and active navigation
- `aria-live="polite"` on toast notifications and status messages
- `aria-live="assertive"` on error messages
- `role="dialog"` with `aria-modal="true"` on modals and sheets
- `role="search"` on search inputs
- `aria-describedby` linking form inputs to their error messages
- `aria-current="page"` on active sidebar navigation item

### 7.4 Color & Contrast
- All text meets WCAG AA contrast ratios (4.5:1 normal, 3:1 large) in both light and dark themes
- No information conveyed by color alone — icons, text labels, or patterns accompany color
- Priority indicators use both color and text labels (e.g., red dot + "High")
- Status badges use both color and icon/text

### 7.5 Screen Reader Support
- All images have descriptive `alt` text (decorative images use `alt=""`)
- Form inputs have associated `<label>` elements (not just placeholder text)
- Tables have `<caption>` and appropriate header scope
- Dynamic content updates announced via `aria-live` regions
- Loading states communicated via `aria-busy="true"` and screen reader text

### 7.6 Motion & Preferences
- All animations respect `prefers-reduced-motion: reduce` — replaced with instant transitions
- No auto-playing animations that cannot be paused
- Smooth scroll can be disabled via user preference

### 7.7 Semantic HTML
- `<nav>` for navigation regions (sidebar, top bar, breadcrumbs)
- `<main>` for primary content area (one per page)
- `<aside>` for supplementary content (sidebars, panels)
- `<article>` for self-contained content (task cards, notification items)
- `<section>` with headings for page regions
- Heading hierarchy maintained (h1 → h2 → h3, no skipped levels)
- Skip-to-content link as first focusable element on every page
