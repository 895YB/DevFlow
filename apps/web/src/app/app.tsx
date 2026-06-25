import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProviders } from './providers/app-providers';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { WorkspaceProvider } from './providers/workspace-provider';
import { LandingPage } from '@/features/landing/components/landing-page';
import { SignInPage } from '@/features/auth/components/sign-in-page';
import { SignUpPage } from '@/features/auth/components/sign-up-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/features/dashboard/components/dashboard-page';
import { ProjectsPage } from '@/features/projects/components/projects-page';
import { ProjectDetailPage } from '@/features/projects/components/project-detail-page';
import { DocumentsPage } from '@/features/documents/components/documents-page';
import { SnippetsPage } from '@/features/snippets/components/snippets-page';
import { GitHubPage } from '@/features/github/components/github-page';
import { LeetCodePage } from '@/features/leetcode/components/leetcode-page';
import { ApiTesterPage } from '@/features/api-tester/components/api-tester-page';
import { ProductivityPage } from '@/features/productivity/components/productivity-page';
import { ChatPage } from '@/features/chat/components/chat-page';
import { NotificationsPage } from '@/features/notifications/components/notifications-page';
import { SettingsPage } from '@/features/settings/components/settings-page';


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
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/snippets" element={<SnippetsPage />} />
              <Route path="/github" element={<GitHubPage />} />
              <Route path="/leetcode" element={<LeetCodePage />} />
              <Route path="/api-tester" element={<ApiTesterPage />} />
              <Route path="/productivity" element={<ProductivityPage />} />
              <Route path="/chat" element={<ChatPage />} />

              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />

              <Route path="/notifications" element={<NotificationsPage />} />
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
