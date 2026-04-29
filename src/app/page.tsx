'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { SplashScreen } from '@/components/SplashScreen';

/**
 * Entry point for ShikshaSetu.
 * Acts as an intelligent router that displays the Splash Screen during initialization.
 * Implements "Clean State" logic to purge all local caches and session data on app start.
 */
export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Real-world "Clean State" Reset: Purge all local storage and session caches on entry.
    // This ensures no stale UI data or previous answers are reused in a new session.
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('ShikshaSetu: Session state purged for clean initialization.');
      } catch (e) {
        console.warn('Failed to clear local storage', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Logged in users go to their fresh learning journey
        router.push('/learn');
      } else {
        // Unauthenticated users go directly to Login
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  // Always show Splash Screen while determining the correct destination with a fresh state
  return <SplashScreen message="Initializing Fresh Academic Session" />;
}
