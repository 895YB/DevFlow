import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

export function ContactSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to streamline your workflow?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join developers who have already simplified their development process
          with DevFlow.
        </p>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email"
            className="h-11"
            aria-label="Email address"
          />
          <Button size="lg" className="shrink-0">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Free forever. No credit card required.
        </p>
      </div>
    </section>
  );
}
