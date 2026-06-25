import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { useWorkspaceSocket } from '@/features/realtime/hooks/use-workspace-socket';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useWorkspaceSocket();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
