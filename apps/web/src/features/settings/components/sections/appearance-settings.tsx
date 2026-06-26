import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/app/providers/theme-provider';

const THEMES = [
  { value: 'light' as const, icon: Sun, label: 'Light', description: 'Always use light mode' },
  { value: 'dark' as const, icon: Moon, label: 'Dark', description: 'Always use dark mode' },
  { value: 'system' as const, icon: Monitor, label: 'System', description: 'Follow OS preference' },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how DevFlow looks on your device.
        </p>
      </div>

      <section aria-labelledby="theme-heading">
        <h3 id="theme-heading" className="text-sm font-semibold">Theme</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your preference is stored locally and persists across sessions.
        </p>

        <div
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
          role="radiogroup"
          aria-labelledby="theme-heading"
        >
          {THEMES.map((t) => {
            const Icon = t.icon;
            const selected = theme === t.value;
            return (
              <button
                key={t.value}
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(t.value)}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={cn('text-sm font-semibold', selected && 'text-primary')}>
                    {t.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
