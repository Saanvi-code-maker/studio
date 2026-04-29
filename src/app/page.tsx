
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { SplashScreen } from '@/components/SplashScreen';

/**
 * Entry point for ShikshaSetu.
 * Acts as an intelligent router that displays the Splash Screen during initialization
 * and directs users to either the Learning Portal or the Login screen.
 */
export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Logged in users go to their learning journey
        router.push('/learn');
      } else {
        // Unauthenticated users go directly to Login as per "Splash next Login" instruction
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  // Always show Splash Screen while determining the correct destination
  return <SplashScreen message="Initializing Secure Academic Environment" />;
}
