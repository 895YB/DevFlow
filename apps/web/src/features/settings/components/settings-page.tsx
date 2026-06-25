import { useUser } from '@clerk/clerk-react';
import { useTheme } from '@/app/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your profile and preferences.
      </p>

      <Separator className="my-6" />

      <section>
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ''} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="displayName"
              defaultValue={user?.fullName ?? ''}
              placeholder="Your display name"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Input id="bio" placeholder="A short bio about yourself" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="portfolioUrl" className="text-sm font-medium">
              Portfolio URL
            </label>
            <Input
              id="portfolioUrl"
              placeholder="https://yourportfolio.com"
              type="url"
            />
          </div>
        </div>

        <Button className="mt-4" size="sm">
          Save Profile
        </Button>
      </section>

      <Separator className="my-6" />

      <section>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your preferred theme.
        </p>
        <div className="mt-4 flex gap-2">
          {themes.map((t) => (
            <Button
              key={t.value}
              variant="outline"
              size="sm"
              onClick={() => setTheme(t.value)}
              className={cn(
                theme === t.value && 'border-primary bg-primary/5 text-primary',
              )}
            >
              <t.icon className="mr-2 h-4 w-4" />
              {t.label}
            </Button>
          ))}
        </div>
      </section>

      <Separator className="my-6" />

      <section>
        <h2 className="text-lg font-semibold">Connected Accounts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your GitHub and LeetCode accounts.
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">GitHub</p>
              <p className="text-sm text-muted-foreground">Not connected</p>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">LeetCode</p>
              <p className="text-sm text-muted-foreground">Not connected</p>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
