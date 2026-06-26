import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 items-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm">{description}</span>
      <div className="flex items-center gap-1" aria-label={`Shortcut: ${keys.join(' + ')}`}>
        {keys.map((k, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
            <Kbd>{k}</Kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

const SHORTCUT_GROUPS = [
  {
    heading: 'Global',
    shortcuts: [
      { keys: ['⌘/Ctrl', 'K'], description: 'Open command palette' },
      { keys: ['⌘/Ctrl', 'Shift', 'P'], description: 'Open command palette (alt)' },
      { keys: ['⌘/Ctrl', 'N'], description: 'New item (context-sensitive)' },
      { keys: ['Escape'], description: 'Close dialog / palette' },
    ],
  },
  {
    heading: 'Navigation',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
      { keys: ['G', 'O'], description: 'Go to Documents' },
      { keys: ['G', 'S'], description: 'Go to Snippets' },
      { keys: ['G', 'A'], description: 'Go to Analytics' },
      { keys: ['G', 'T'], description: 'Go to API Tester' },
      { keys: ['G', 'F'], description: 'Go to Productivity (Focus)' },
      { keys: ['G', 'N'], description: 'Go to Notifications' },
    ],
  },
  {
    heading: 'Tasks',
    shortcuts: [
      { keys: ['⌘/Ctrl', 'Enter'], description: 'Save task / confirm dialog' },
      { keys: ['⌘/Ctrl', 'Backspace'], description: 'Delete selected item' },
    ],
  },
  {
    heading: 'Editor',
    shortcuts: [
      { keys: ['⌘/Ctrl', 'B'], description: 'Bold' },
      { keys: ['⌘/Ctrl', 'I'], description: 'Italic' },
      { keys: ['⌘/Ctrl', 'Z'], description: 'Undo' },
      { keys: ['⌘/Ctrl', 'Shift', 'Z'], description: 'Redo' },
    ],
  },
  {
    heading: 'Pomodoro',
    shortcuts: [
      { keys: ['Space'], description: 'Start / pause timer' },
      { keys: ['R'], description: 'Reset current session' },
    ],
  },
] as const;

export function ShortcutsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All keyboard shortcuts available in DevFlow.
        </p>
      </div>

      {SHORTCUT_GROUPS.map((group, gi) => (
        <section key={group.heading} aria-labelledby={`shortcut-group-${gi}`}>
          <h3
            id={`shortcut-group-${gi}`}
            className="mb-1 text-sm font-semibold"
          >
            {group.heading}
          </h3>
          <div className="divide-y divide-border rounded-lg border border-border px-4">
            {group.shortcuts.map((s, i) => (
              <ShortcutRow key={i} keys={[...s.keys]} description={s.description} />
            ))}
          </div>
          {gi < SHORTCUT_GROUPS.length - 1 && <Separator className="mt-6" />}
        </section>
      ))}

      <p className="text-xs text-muted-foreground">
        <Badge variant="outline" className="mr-1">⌘/Ctrl</Badge>
        On Mac use ⌘ (Command). On Windows/Linux use Ctrl.
      </p>
    </div>
  );
}
