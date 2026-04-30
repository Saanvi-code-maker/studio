'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { SplashScreen } from '@/components/SplashScreen';
import { GraduationCap, BookOpen, LayoutDashboard, ArrowRight, Sparkles, GraduationCap as TeacherIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

/**
 * Entry point for ShikshaSetu.
 * Acts as a Portal Selection screen for authenticated users and a router for guests.
 */
export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { t } = useTranslation();
  const [showPortal, setShowPortal] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clean state for new sessions as requested
      if (!window.sessionStorage.getItem('session_initialized')) {
        localStorage.removeItem('current_lesson_state');
        window.sessionStorage.setItem('session_initialized', 'true');
      }
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (!isUserLoading && user && !isProfileLoading) {
      setShowPortal(true);
    }
  }, [user, isUserLoading, isProfileLoading, router]);

  if (isUserLoading || (user && isProfileLoading) || !showPortal) {
    return <SplashScreen message="Initializing Academic Portal" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 hero-gradient relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse" />

      <div className="max-w-5xl w-full space-y-12 relative z-10 animate-in fade-in zoom-in duration-1000">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full border-2 border-primary/10 shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t.learn.academicBridge}</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black font-headline tracking-tighter text-foreground leading-[0.85]">
            Shiksha<span className="text-primary">Setu</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            Welcome back, <span className="text-foreground font-bold">{profile?.displayName || 'Scholar'}</span>. Select your destination to begin.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card 
            onClick={() => router.push('/learn')}
            className="pro-card group p-10 cursor-pointer border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_50px_80px_-20px_rgba(59,130,246,0.3)] transition-all"
          >
            <div className="space-y-8">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <BookOpen className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black font-headline tracking-tighter">{t.nav.learn}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Continue your personalized learning journey with AI-powered conceptual bridges.
                </p>
              </div>
              <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Enter Journey</span>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Card>

          <Card 
            onClick={() => router.push('/teacher')}
            className="pro-card group p-10 cursor-pointer border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_50px_80px_-20px_rgba(14,165,233,0.3)] transition-all"
          >
            <div className="space-y-8">
              <div className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center text-accent group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                <LayoutDashboard className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black font-headline tracking-tighter">{t.nav.teacher}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Analyze classroom performance, identify gaps, and generate adaptive lesson plans.
                </p>
              </div>
              <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Open Intelligence</span>
                <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
