import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Globe, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-3xl w-full space-y-12 text-center">
        <header className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
            <GraduationCap className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground font-headline">
            ShikshaSetu
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Your bridge to personalized, AI-powered learning that adapts to you, even when you're offline.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary" />
                Student Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Access your lessons, take quizzes, and get personalized explanations for any topic.
              </p>
              <Link href="/learn" className="block w-full">
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  Start Learning
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="text-accent" />
                Teacher View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Track student progress, see common misconceptions, and pinpoint where to focus your teaching.
              </p>
              <Link href="/teacher" className="block w-full">
                <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" size="lg">
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center justify-center gap-1">
            <Globe className="w-4 h-4" />
            <span>Multilingual</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Offline Sync</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <GraduationCap className="w-4 h-4" />
            <span>AI Powered</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>Structured</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
