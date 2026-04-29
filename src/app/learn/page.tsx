'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle2, ChevronRight, Clock, Loader2, Sparkles, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useUser } from '@/firebase';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const LESSONS = [
  {
    id: 'biology-1',
    title: 'Cell Biology Essentials',
    subject: 'Biology',
    duration: '15 min',
    image: PlaceHolderImages.find(img => img.id === 'biology-lesson')?.imageUrl,
    description: 'Master the fundamental building blocks of complex life and their intricate functions.',
    difficulty: 'Introductory'
  },
  {
    id: 'math-1',
    title: 'Advanced Geometry',
    subject: 'Mathematics',
    duration: '20 min',
    image: PlaceHolderImages.find(img => img.id === 'math-lesson')?.imageUrl,
    description: 'Explore spatial relationships, logical proofs, and geometric properties.',
    difficulty: 'Intermediate'
  },
  {
    id: 'history-1',
    title: 'Foundations of Civilization',
    subject: 'History',
    duration: '10 min',
    image: PlaceHolderImages.find(img => img.id === 'history-lesson')?.imageUrl,
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const completionRate = Math.round(((progress?.completedLessons?.length || 0) / LESSONS.length) * 100);

  return (
    <div className="min-h-screen pb-24 md:pt-24 bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-700">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[11px]">
              <LayoutGrid className="w-4 h-4" />
              Learning Journey
            </div>
            <h1 className="text-6xl font-black font-headline text-foreground tracking-tighter leading-none">
              Student Portal
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-xl">
              Elevate your understanding with AI-guided personalized education.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-[2.5rem] border-2 shadow-sm flex items-center gap-8 min-w-[320px] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Sparkles className="w-20 h-20 text-primary" />
             </div>
            <div className="flex-1 space-y-3 relative z-10">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                <span>Current Mastery</span>
                <span className="text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3 rounded-full" />
            </div>
            <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary relative z-10">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10">
          {LESSONS.map((lesson) => {
            const isCompleted = progress?.completedLessons?.includes(lesson.id);
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                <Card className="pro-card group overflow-hidden border-2 rounded-[2.5rem]">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="relative w-full md:w-96 h-72 md:h-auto overflow-hidden shrink-0">
                      <Image
                        src={lesson.image || 'https://picsum.photos/seed/learn/800/600'}
                        alt={lesson.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        data-ai-hint="educational topic"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-white/95 text-primary hover:bg-white backdrop-blur-xl border-none font-black px-4 py-1.5 shadow-xl rounded-full text-[10px] uppercase tracking-widest">
                          {lesson.subject}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 p-10 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-black uppercase tracking-widest text-[10px] px-3 py-1">
                              {lesson.difficulty}
                            </Badge>
                            <CardTitle className="text-4xl font-black font-headline group-hover:text-primary transition-colors tracking-tight">
                              {lesson.title}
                            </CardTitle>
                          </div>
                          {isCompleted && (
                            <div className="bg-green-50 p-3 rounded-2xl border-2 border-green-100 shadow-sm animate-in zoom-in-90">
                              <CheckCircle2 className="text-green-500 h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-xl leading-relaxed text-muted-foreground line-clamp-2 font-medium">
                          {lesson.description}
                        </CardDescription>
                      </div>
                      
                      <div className="pt-10 flex items-center justify-between border-t border-border mt-10">
                        <div className="flex items-center gap-10 text-sm font-black text-muted-foreground/60 uppercase tracking-widest">
                          <span className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary/60" />
                            {lesson.duration}
                          </span>
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary/60" />
                            AI Adaptive
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform bg-primary/5 px-6 py-3 rounded-full">
                          Continue Learning <ChevronRight className="w-5 h-5" />
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