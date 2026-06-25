import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '../hooks/use-notifications';
import type { Notification } from '@devflow/shared';

function NotificationTypeLabel({ type }: { type: Notification['type'] }) {
  const labels: Record<Notification['type'], string> = {
    task_assigned: 'Task assigned',
    task_comment: 'Comment',
    mention: 'Mention',
    chat_message: 'Chat',
    project_update: 'Project',
    system: 'System',
  };
  const colors: Record<Notification['type'], string> = {
    task_assigned: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    task_comment: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    mention: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    chat_message: 'bg-green-500/10 text-green-600 dark:text-green-400',
    project_update: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    system: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', colors[type])}>
      {labels[type]}
    </span>
  );
}

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading } = useNotifications({ unreadOnly });
  const notifications = data?.notifications ?? [];
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotification = useDeleteNotification();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Filter notifications">
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={unreadOnly === (tab === 'unread')}
            onClick={() => setUnreadOnly(tab === 'unread')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
              unreadOnly === (tab === 'unread')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Bell className="h-12 w-12 opacity-30" />
          <p className="text-sm">{unreadOnly ? 'No unread notifications' : 'No notifications yet'}</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={cn(
                'group flex items-start gap-4 p-4 transition-colors',
                !n.read && 'bg-accent/20',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <NotificationTypeLabel type={n.type} />
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                  )}
                </div>
                <p className="mt-1 text-sm font-medium">{n.title}</p>
                {n.message && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => markRead.mutate(n._id)}
                    aria-label="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteNotification.mutate(n._id)}
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
