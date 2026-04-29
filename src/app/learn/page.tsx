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
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const completionRate = Math.round(((progress?.completedLessons?.length || 0) / LESSONS.length) * 100);

  return (
    <div className="min-h-screen pb-24 md:pt-24 bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
              <LayoutGrid className="w-4 h-4" />
              Student Portal
            </div>
            <h1 className="text-5xl font-black font-headline text-foreground tracking-tight">Learning Journey</h1>
            <p className="text-xl text-muted-foreground font-medium">Your personalized path to academic excellence.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 shadow-sm flex items-center gap-6 min-w-[280px]">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>Progress</span>
                <span className="text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {LESSONS.map((lesson) => {
            const isCompleted = progress?.completedLessons?.includes(lesson.id);
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                <Card className="group border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="relative w-full md:w-80 h-64 md:h-auto overflow-hidden shrink-0">
                      <Image
                        src={lesson.image || 'https://picsum.photos/800/600'}
                        alt={lesson.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        data-ai-hint="lesson topic"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-md border-none font-black shadow-sm">
                          {lesson.subject}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-widest text-[10px]">
                              {lesson.difficulty}
                            </Badge>
                            <CardTitle className="text-3xl font-black font-headline group-hover:text-primary transition-colors">
                              {lesson.title}
                            </CardTitle>
                          </div>
                          {isCompleted && (
                            <div className="bg-green-50 p-2 rounded-xl border border-green-100">
                              <CheckCircle2 className="text-green-500 h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-lg leading-relaxed text-muted-foreground line-clamp-2 font-medium">
                          {lesson.description}
                        </CardDescription>
                      </div>
                      
                      <div className="pt-8 flex items-center justify-between border-t border-border mt-8">
                        <div className="flex items-center gap-8 text-sm font-bold text-muted-foreground/70">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            {lesson.duration}
                          </span>
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Adaptive Quiz
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm group-hover:translate-x-1 transition-transform">
                          Continue <ChevronRight className="w-5 h-5" />
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
