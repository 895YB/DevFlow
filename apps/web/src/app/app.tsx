import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProviders } from './providers/app-providers';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { WorkspaceProvider } from './providers/workspace-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

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
const SettingsPage = lazy(() =>
  import('@/features/settings/components/settings-page').then((m) => ({ default: m.SettingsPage })),
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

// ── Lazy wrapper with error boundary + suspense ───────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
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
                <Route path="/settings" element={<Page><SettingsPage /></Page>} />
                <Route path="/settings/*" element={<Page><SettingsPage /></Page>} />
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
