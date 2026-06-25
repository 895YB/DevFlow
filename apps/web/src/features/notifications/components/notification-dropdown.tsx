import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  useUnreadCount,
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '../hooks/use-notifications';
import type { Notification } from '@devflow/shared';
import { useNavigate } from 'react-router';

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const icons: Record<Notification['type'], string> = {
    task_assigned: '📋',
    task_comment: '💬',
    mention: '@',
    chat_message: '💬',
    project_update: '📁',
    system: '🔔',
  };
  return <span className="text-base" aria-hidden>{icons[type]}</span>;
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.read) onRead(notification._id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 border-b border-border p-3 transition-colors last:border-0',
        notification.read ? 'opacity-60' : 'bg-accent/30',
      )}
    >
      <button
        className="flex flex-1 items-start gap-3 text-left"
        onClick={handleClick}
        aria-label={`${notification.read ? '' : 'Unread: '}${notification.title}`}
      >
        <NotificationIcon type={notification.type} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{notification.title}</p>
          {notification.message && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRead(notification._id)}
            aria-label="Mark as read"
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => onDelete(notification._id)}
          aria-label="Delete notification"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: count = 0 } = useUnreadCount();
  const { data } = useNotifications({ unreadOnly: false });
  const notifications = data?.notifications ?? [];
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotification = useDeleteNotification();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}>
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span
              className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold text-destructive-foreground"
              aria-hidden
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <div className="flex items-center gap-1">
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => markAllRead.mutate()}
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n._id}
                notification={n}
                onRead={(id) => markRead.mutate(id)}
                onDelete={(id) => deleteNotification.mutate(id)}
              />
            ))
          )}
        </div>

        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => { setOpen(false); navigate('/notifications'); }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
