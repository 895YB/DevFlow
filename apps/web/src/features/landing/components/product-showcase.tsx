import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const showcases = [
  {
    title: 'Kanban boards that keep you organized',
    description:
      'Drag and drop tasks across customizable columns. Set priorities, assign team members, and track progress at a glance.',
    highlights: [
      'Drag-and-drop task management',
      'Custom status columns and labels',
      'Filter by priority, assignee, and due date',
    ],
  },
  {
    title: 'Write docs your team will actually read',
    description:
      'A Markdown editor with nested pages, version history, and full-text search. Everything you need for technical documentation.',
    highlights: [
      'Nested page hierarchy',
      'Version history with restore',
      'Full-text search across all docs',
    ],
  },
  {
    title: 'Track your coding journey',
    description:
      'Connect your GitHub and LeetCode accounts to see your activity, track problem-solving streaks, and visualize your progress.',
    highlights: [
      'GitHub repos, PRs, and commit history',
      'LeetCode streaks and difficulty analytics',
      'Unified developer profile',
    ],
  },
];

export function ProductShowcase() {
  return (
    <section className="border-y border-border/40 bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-24">
        {showcases.map((item, index) => (
          <motion.div
            key={item.title}
            className={`flex flex-col items-center gap-12 lg:flex-row ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
              <ul className="space-y-2 pt-2">
                {item.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1">
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-lg">
                <div className="flex items-center gap-1.5 pb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="h-48 rounded-lg bg-muted/50 sm:h-56" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
