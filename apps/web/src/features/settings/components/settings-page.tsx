import { NavLink, Outlet } from 'react-router';
import {
  User,
  Shield,
  Building2,
  Palette,
  Bell,
  Keyboard,
  Download,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/settings/profile', icon: User, label: 'Profile' },
  { to: '/settings/account', icon: Shield, label: 'Account' },
  { to: '/settings/workspace', icon: Building2, label: 'Workspace' },
  { to: '/settings/appearance', icon: Palette, label: 'Appearance' },
  { to: '/settings/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings/shortcuts', icon: Keyboard, label: 'Shortcuts' },
  { to: '/settings/export', icon: Download, label: 'Export Data' },
  { to: '/settings/ai', icon: Cpu, label: 'AI Features' },
] as const;

export function SettingsPage() {
  return (
    <div className="flex min-h-full gap-0">
      {/* Sidebar */}
      <aside
        className="hidden w-56 shrink-0 border-r border-border md:block"
        aria-label="Settings navigation"
      >
        <div className="sticky top-0 p-4">
          <h1 className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Settings
          </h1>
          <nav className="mt-2 space-y-0.5" aria-label="Settings sections">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="block w-full md:hidden">
        <div className="overflow-x-auto border-b border-border px-4 py-2">
          <nav className="flex gap-1" aria-label="Settings sections">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main
        className="min-w-0 flex-1 p-6 md:p-8"
        aria-label="Settings content"
      >
        <div className="mx-auto max-w-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
