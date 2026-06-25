import { SignUp } from '@clerk/clerk-react';
import { Zap } from 'lucide-react';

export function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <a href="/" className="mb-8 flex items-center gap-2" aria-label="DevFlow home">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tight">DevFlow</span>
      </a>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
