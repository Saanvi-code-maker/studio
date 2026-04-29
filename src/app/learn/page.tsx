'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle2, ChevronRight, Clock, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useUser } from '@/firebase';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const LESSONS = [
  {
    id: 'biology-1',
    title: 'The Living Cell',
    subject: 'Biology',
    duration: '15 min',
    image: PlaceHolderImages.find(img => img.id === 'biology-lesson')?.imageUrl,
    description: 'Explore the building blocks of life and how cells function.',
    difficulty: 'Introductory'
  },
  {
    id: 'math-1',
    title: 'Geometry Foundations',
    subject: 'Mathematics',
    duration: '20 min',
    image: PlaceHolderImages.find(img => img.id === 'math-lesson')?.imageUrl,
    description: 'Understanding angles, triangles, and basic geometric shapes.',
    difficulty: 'Intermediate'
  },
  {
    id: 'history-1',
    title: 'Ancient Civilizations',
    subject: 'History',
    duration: '10 min',
    image: PlaceHolderImages.find(img => img.id === 'history-lesson')?.imageUrl,
    description: 'A journey through time to see how the first cities were built.',
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

  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-black font-headline tracking-tight">Learning Journey</h1>
          <p className="text-xl text-muted-foreground">Continue where you left off or explore something new.</p>
        </header>

        {progress && (
          <Card className="bg-primary/5 border-2 border-primary/10 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="font-black text-2xl font-headline text-primary">Your Progress</h3>
                  <p className="text-muted-foreground font-medium">
                    {progress.completedLessons?.length || 0} of {LESSONS.length} modules completed
                  </p>
                </div>
                <div className="h-20 w-20 rounded-2xl bg-white border-2 border-primary/20 flex flex-col items-center justify-center text-primary shadow-sm">
                  <span className="text-2xl font-black">
                    {Math.round(((progress.completedLessons?.length || 0) / LESSONS.length) * 100)}%
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Total</span>
                </div>
              </div>
              <Progress value={((progress.completedLessons?.length || 0) / LESSONS.length) * 100} className="h-3 rounded-full" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 pt-4">
          {LESSONS.map((lesson) => {
            const isCompleted = progress?.completedLessons?.includes(lesson.id);
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                <Card className="group hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer border-2 shadow-md hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-64 h-48 sm:h-auto overflow-hidden">
                      <Image
                        src={lesson.image || 'https://picsum.photos/600/400'}
                        alt={lesson.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        data-ai-hint="lesson concept"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                      <div className="absolute bottom-4 left-4 sm:hidden">
                        <Badge className="bg-primary text-white font-bold">{lesson.subject}</Badge>
                      </div>
                    </div>
                    <div className="flex-1 p-8">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="hidden sm:inline-flex bg-accent/20 text-accent-foreground border-accent/20 font-bold">
                              {lesson.subject}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] py-0.5 px-2 font-bold uppercase tracking-widest">
                              {lesson.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl font-black font-headline group-hover:text-primary transition-colors">
                            {lesson.title}
                          </CardTitle>
                        </div>
                        {isCompleted && (
                          <div className="bg-primary/10 p-2 rounded-full">
                            <CheckCircle2 className="text-primary h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <CardDescription className="text-lg leading-relaxed mb-6 line-clamp-2">
                        {lesson.description}
                      </CardDescription>
                      <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Interactive Quiz
                        </span>
                        <span className="ml-auto flex items-center gap-1 font-black text-primary group-hover:gap-2 transition-all">
                          Dive In <ChevronRight className="w-5 h-5" />
                        </span>
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
