'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Card, CardDescription, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Beaker, 
  Calculator, 
  Landmark, 
  Trophy 
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useUser } from '@/firebase';
import { SplashScreen } from '@/components/SplashScreen';

const LESSONS = [
  {
    id: 'biology-1',
    title: 'Cell Biology Essentials',
    subject: 'Biology',
    duration: '15 min',
    icon: Beaker,
    description: 'Master the fundamental building blocks of life and their intricate functions.',
    difficulty: 'Introductory'
  },
  {
    id: 'math-1',
    title: 'Advanced Geometry',
    subject: 'Mathematics',
    duration: '20 min',
    icon: Calculator,
    description: 'Explore spatial relationships, logical proofs, and geometric properties.',
    difficulty: 'Intermediate'
  },
  {
    id: 'history-1',
    title: 'Foundations of Civilization',
    subject: 'History',
    duration: '10 min',
    icon: Landmark,
    description: 'Trace the development of early societies and the dawn of governance.',
    difficulty: 'Beginner'
  }
];

export default function LearnPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { progress, isLoading: isProgressLoading } = useStore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isProgressLoading) {
    return <SplashScreen message="Syncing Academic Progress" />;
  }

  if (!user) return null;

  const completedCount = progress?.completedLessons?.length || 0;
  const totalLessons = LESSONS.length;
  const completionRate = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="min-h-screen pb-24 md:pt-24 hero-gradient">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-1000 slide-in-from-bottom-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
              <Sparkles className="w-4 h-4" />
              Your Academic Bridge
            </div>
            <h1 className="text-6xl md:text-7xl font-black font-headline text-foreground tracking-tighter leading-none">
              Learning <span className="text-primary">Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-xl">
              Personalized AI paths designed to help you master complex topics through intuitive explanations.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[3rem] border-2 shadow-2xl flex items-center gap-8 min-w-[340px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
               <Trophy className="w-32 h-32 text-primary" />
             </div>
            <div className="flex-1 space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Class Mastery</span>
                  <div className="text-4xl font-black text-primary leading-none">{completionRate}%</div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Lessons</div>
                   <div className="text-xl font-bold">{completedCount}/{totalLessons}</div>
                </div>
              </div>
              <Progress value={completionRate} className="h-3 rounded-full bg-primary/10" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12">
          {LESSONS.map((lesson, idx) => {
            const isCompleted = progress?.completedLessons?.includes(lesson.id);
            const Icon = lesson.icon;
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`} className="block">
                <Card className="pro-card group overflow-hidden">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="w-full md:w-48 h-48 md:h-auto bg-primary/5 flex items-center justify-center shrink-0 border-r border-border/50 relative">
                       <div className="absolute top-6 left-6 text-primary/10 text-6xl font-black">{idx + 1}</div>
                       <Icon className="w-16 h-16 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative z-10" />
                    </div>
                    <div className="flex-1 p-10 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 shadow-none rounded-full text-[9px] uppercase tracking-widest">
                                {lesson.subject}
                              </Badge>
                              <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground border-none font-black uppercase tracking-widest text-[9px] px-4 py-1.5">
                                {lesson.difficulty}
                              </Badge>
                            </div>
                            <CardTitle className="text-4xl font-black font-headline group-hover:text-primary transition-colors tracking-tighter">
                              {lesson.title}
                            </CardTitle>
                          </div>
                          {isCompleted && (
                            <div className="bg-green-500 p-3 rounded-2xl shadow-xl shadow-green-500/20 animate-in zoom-in-90 rotate-12">
                              <CheckCircle2 className="text-white h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-xl leading-relaxed text-muted-foreground/80 line-clamp-2 font-medium">
                          {lesson.description}
                        </CardDescription>
                      </div>
                      
                      <div className="pt-8 flex items-center justify-between border-t border-border/50 mt-10">
                        <div className="flex items-center gap-10 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            {lesson.duration}
                          </span>
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            AI Adaptive Path
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.1em] text-[11px] group-hover:translate-x-3 transition-transform duration-500">
                          {isCompleted ? 'Review Lesson' : 'Begin Module'} <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
