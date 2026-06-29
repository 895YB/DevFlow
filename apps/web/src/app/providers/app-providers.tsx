import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme-provider';
import { SocketProvider } from './socket-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!CLERK_KEY) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SocketProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SocketProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SocketProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SocketProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
