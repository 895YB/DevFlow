import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProviders } from './providers/app-providers';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { WorkspaceProvider } from './providers/workspace-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SettingsPage } from '@/features/settings/components/settings-page';

// Eagerly-loaded (part of the auth critical path)
import { LandingPage } from '@/features/landing/components/landing-page';
import { SignInPage } from '@/features/auth/components/sign-in-page';
import { SignUpPage } from '@/features/auth/components/sign-up-page';

// Lazily-loaded feature pages
const DashboardPage = lazy(() =>
  import('@/features/dashboard/components/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const ProjectsPage = lazy(() =>
  import('@/features/projects/components/projects-page').then((m) => ({ default: m.ProjectsPage })),
);
const ProjectDetailPage = lazy(() =>
  import('@/features/projects/components/project-detail-page').then((m) => ({ default: m.ProjectDetailPage })),
);
const DocumentsPage = lazy(() =>
  import('@/features/documents/components/documents-page').then((m) => ({ default: m.DocumentsPage })),
);
const SnippetsPage = lazy(() =>
  import('@/features/snippets/components/snippets-page').then((m) => ({ default: m.SnippetsPage })),
);
const GitHubPage = lazy(() =>
  import('@/features/github/components/github-page').then((m) => ({ default: m.GitHubPage })),
);
const LeetCodePage = lazy(() =>
  import('@/features/leetcode/components/leetcode-page').then((m) => ({ default: m.LeetCodePage })),
);
const ApiTesterPage = lazy(() =>
  import('@/features/api-tester/components/api-tester-page').then((m) => ({ default: m.ApiTesterPage })),
);
const ProductivityPage = lazy(() =>
  import('@/features/productivity/components/productivity-page').then((m) => ({ default: m.ProductivityPage })),
);
const ChatPage = lazy(() =>
  import('@/features/chat/components/chat-page').then((m) => ({ default: m.ChatPage })),
);
const NotificationsPage = lazy(() =>
  import('@/features/notifications/components/notifications-page').then((m) => ({ default: m.NotificationsPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/components/analytics-page').then((m) => ({ default: m.AnalyticsPage })),
);
const AiPage = lazy(() =>
  import('@/features/ai/components/ai-page').then((m) => ({ default: m.AiPage })),
);

// Settings sections (lazy)
const ProfileSettings = lazy(() =>
  import('@/features/settings/components/sections/profile-settings').then((m) => ({ default: m.ProfileSettings })),
);
const AccountSettings = lazy(() =>
  import('@/features/settings/components/sections/account-settings').then((m) => ({ default: m.AccountSettings })),
);
const WorkspaceSettings = lazy(() =>
  import('@/features/settings/components/sections/workspace-settings').then((m) => ({ default: m.WorkspaceSettings })),
);
const AppearanceSettings = lazy(() =>
  import('@/features/settings/components/sections/appearance-settings').then((m) => ({ default: m.AppearanceSettings })),
);
const NotificationSettings = lazy(() =>
  import('@/features/settings/components/sections/notification-settings').then((m) => ({ default: m.NotificationSettings })),
);
const ShortcutsSettings = lazy(() =>
  import('@/features/settings/components/sections/shortcuts-settings').then((m) => ({ default: m.ShortcutsSettings })),
);
const ExportSettings = lazy(() =>
  import('@/features/settings/components/sections/export-settings').then((m) => ({ default: m.ExportSettings })),
);

// ── Page-level loading fallback ───────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 lg:p-6" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 py-2" aria-busy="true" aria-label="Loading section">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

// ── Lazy wrapper with error boundary + suspense ───────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SectionSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />

            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <WorkspaceProvider>
                    <DashboardLayout />
                  </WorkspaceProvider>
                }
              >
                <Route path="/dashboard" element={<Page><DashboardPage /></Page>} />
                <Route path="/projects" element={<Page><ProjectsPage /></Page>} />
                <Route path="/projects/:projectId" element={<Page><ProjectDetailPage /></Page>} />
                <Route path="/documents" element={<Page><DocumentsPage /></Page>} />
                <Route path="/snippets" element={<Page><SnippetsPage /></Page>} />
                <Route path="/github" element={<Page><GitHubPage /></Page>} />
                <Route path="/leetcode" element={<Page><LeetCodePage /></Page>} />
                <Route path="/api-tester" element={<Page><ApiTesterPage /></Page>} />
                <Route path="/productivity" element={<Page><ProductivityPage /></Page>} />
                <Route path="/chat" element={<Page><ChatPage /></Page>} />
                <Route path="/notifications" element={<Page><NotificationsPage /></Page>} />
                <Route path="/analytics" element={<Page><AnalyticsPage /></Page>} />
                <Route path="/ai" element={<Page><AiPage /></Page>} />

                {/* Settings — nested routes rendered via <Outlet> in SettingsPage */}
                <Route path="/settings" element={<SettingsPage />}>
                  <Route index element={<Navigate to="profile" replace />} />
                  <Route path="profile" element={<Section><ProfileSettings /></Section>} />
                  <Route path="account" element={<Section><AccountSettings /></Section>} />
                  <Route path="workspace" element={<Section><WorkspaceSettings /></Section>} />
                  <Route path="appearance" element={<Section><AppearanceSettings /></Section>} />
                  <Route path="notifications" element={<Section><NotificationSettings /></Section>} />
                  <Route path="shortcuts" element={<Section><ShortcutsSettings /></Section>} />
                  <Route path="export" element={<Section><ExportSettings /></Section>} />
                  <Route path="ai" element={<Section><AiPage /></Section>} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
