import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { apiClient } from '@/lib/api-client';

export function useUserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncedRef.current) return;

    syncedRef.current = true;
    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
    if (!email) return;

    apiClient
      .post('/users/me/sync', {
        email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        avatar: user.imageUrl ?? undefined,
      })
      .catch(() => {
        syncedRef.current = false;
      });
  }, [isLoaded, isSignedIn, user]);
}
