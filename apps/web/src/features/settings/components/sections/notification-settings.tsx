import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '../../hooks/use-profile';
import type { NotificationPreferences } from '@devflow/shared';

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  );
}

const NOTIFICATION_GROUPS = [
  {
    heading: 'Delivery',
    items: [
      { key: 'email' as const, label: 'Email Notifications', description: 'Receive important updates via email.' },
      { key: 'browser' as const, label: 'Browser Notifications', description: 'Desktop push notifications in your browser.' },
      { key: 'inApp' as const, label: 'In-App Notifications', description: 'Bell icon notifications within DevFlow.' },
    ],
  },
  {
    heading: 'Activity',
    items: [
      { key: 'taskAssigned' as const, label: 'Task Assignments', description: 'Notified when a task is assigned to you.' },
      { key: 'taskComment' as const, label: 'Task Comments', description: 'Notified when someone comments on your task.' },
      { key: 'mentions' as const, label: 'Mentions', description: 'Notified when someone @mentions you.' },
      { key: 'teamActivity' as const, label: 'Team Activity', description: 'Member joins, role changes, and workspace events.' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { key: 'projectUpdates' as const, label: 'Project Updates', description: 'Project created, renamed, or deleted.' },
      { key: 'documentUpdates' as const, label: 'Document Updates', description: 'Documents shared or published in your workspace.' },
      { key: 'chatMessages' as const, label: 'Chat Messages', description: 'New messages in channels you belong to.' },
    ],
  },
  {
    heading: 'Integrations',
    items: [
      { key: 'githubNotifications' as const, label: 'GitHub Notifications', description: 'Pull request reviews, issues, and repo activity.' },
      { key: 'leetcodeNotifications' as const, label: 'LeetCode Notifications', description: 'Contest reminders and problem recommendations.' },
    ],
  },
] as const;

export function NotificationSettings() {
  const { data: profile, isLoading, updatePreferences } = useProfile();
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

  const [initialized, setInitialized] = useState(false);
  if (profile && !initialized) {
    setPrefs({ ...profile.preferences.notifications });
    setInitialized(true);
  }

  const toggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPrefs((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await updatePreferences.mutateAsync({ notifications: prefs as Record<string, boolean> });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !prefs) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Notification Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which events you want to be notified about.
        </p>
      </div>

      {NOTIFICATION_GROUPS.map((group, gi) => (
        <section key={group.heading} aria-labelledby={`notif-group-${gi}`}>
          <h3 id={`notif-group-${gi}`} className="text-sm font-semibold">{group.heading}</h3>
          <div className="divide-y divide-border">
            {group.items.map(({ key, label, description }) => (
              <ToggleRow
                key={key}
                id={`notif-${key}`}
                label={label}
                description={description}
                checked={!!prefs[key]}
                onChange={(v) => toggle(key, v)}
              />
            ))}
          </div>
          {gi < NOTIFICATION_GROUPS.length - 1 && <Separator className="mt-4" />}
        </section>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
