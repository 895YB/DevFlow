import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-32 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Your all-in-one developer workspace
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Build, Track, and Ship{' '}
          <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            Faster
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Manage projects, write documentation, save code snippets, track
          LeetCode progress, test APIs, and collaborate with your team — all in
          one place.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="lg" asChild>
            <a href="/sign-up">
              Get Started — Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#features">Learn More</a>
          </Button>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="rounded-xl border border-border/60 bg-card/50 p-2 shadow-2xl shadow-primary/5 backdrop-blur-sm">
            <div className="rounded-lg bg-muted/50 p-4 sm:p-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="ml-2 font-mono text-xs">DevFlow Dashboard</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Tasks', value: '24' },
                  { label: 'Projects', value: '8' },
                  { label: 'Focus', value: '6.5h' },
                  { label: 'Streak', value: '15d' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border/40 bg-background/60 p-3 text-center"
                  >
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  'Implement auth flow — High',
                  'Write API docs — Medium',
                  'Fix sidebar layout — Low',
                ].map((task) => (
                  <div
                    key={task}
                    className="truncate rounded-md border border-border/40 bg-background/60 px-3 py-2 text-sm"
                  >
                    {task}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
