
'use client';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
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
  const { progress } = useStore();

  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">My Learning Path</h1>
          <p className="text-muted-foreground">Continue where you left off or start a new lesson.</p>
        </header>

        {progress && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Your Overall Progress</h3>
                  <p className="text-sm text-muted-foreground">{progress.completedLessons.length} of {LESSONS.length} modules completed</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {Math.round((progress.completedLessons.length / LESSONS.length) * 100)}%
                </div>
              </div>
              <Progress value={(progress.completedLessons.length / LESSONS.length) * 100} className="h-2" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6">
          {LESSONS.map((lesson) => {
            const isCompleted = progress?.completedLessons.includes(lesson.id);
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                <Card className="group hover:border-primary/40 transition-all overflow-hidden cursor-pointer">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 h-32 sm:h-auto overflow-hidden">
                      <Image
                        src={lesson.image || 'https://picsum.photos/400/300'}
                        alt={lesson.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        data-ai-hint="lesson illustration"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                              {lesson.subject}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] py-0">
                              {lesson.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors font-headline">
                            {lesson.title}
                          </CardTitle>
                        </div>
                        {isCompleted && <CheckCircle2 className="text-primary h-6 w-6" />}
                      </div>
                      <CardDescription className="line-clamp-2 mb-4">
                        {lesson.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Interactive Quiz
                        </span>
                        <span className="ml-auto flex items-center gap-1 font-semibold text-primary">
                          Start <ChevronRight className="w-4 h-4" />
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
