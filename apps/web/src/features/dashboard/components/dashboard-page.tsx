import { useUser } from '@clerk/clerk-react';

export function DashboardPage() {
  const { user } = useUser();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back, {user?.firstName ?? 'Developer'}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Here&apos;s what&apos;s happening in your workspace.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tasks', value: '0' },
          { label: 'Projects', value: '0' },
          { label: 'Focus', value: '0h' },
          { label: 'Streak', value: '0d' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-6"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">
          Dashboard widgets will be built in Phase 8.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a workspace to get started.
        </p>
      </div>
    </div>
  );
}
