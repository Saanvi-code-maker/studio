import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Globe, Zap, ShieldCheck, MousePointer2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-secondary/30">
      <div className="max-w-4xl w-full space-y-16 text-center">
        <header className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm">
            <GraduationCap className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tight text-foreground font-headline">
              Shiksha<span className="text-primary">Setu</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A professional bridge to mastery. Personalized AI-powered learning that adapts to every student's unique pace and needs.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-2 hover:bg-secondary">
                Log In
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Card className="group hover:border-primary/40 transition-all duration-300 border-2 shadow-sm hover:shadow-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                Student Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Unlock your potential with interactive lessons, instant AI feedback, and a curriculum that grows with you.
              </p>
              <ul className="text-sm text-left space-y-2 font-medium">
                <li className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-primary" /> Personalized AI explanations</li>
                <li className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-primary" /> Real-time progress tracking</li>
                <li className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-primary" /> Multi-modal learning (Voice/Text)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:border-accent/40 transition-all duration-300 border-2 shadow-sm hover:shadow-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                Educator Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Empower your teaching with deep data analytics. Identify class-wide gaps and individual misconceptions instantly.
              </p>
              <ul className="text-sm text-left space-y-2 font-medium">
                <li className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-accent" /> AI-driven class analytics</li>
                <li className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-accent" /> Misconception identification</li>
                <li className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-accent" /> Targeted intervention tools</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <footer className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/40 border border-transparent hover:border-border hover:bg-white transition-all">
            <Globe className="w-6 h-6 text-primary/60" />
            <span className="font-bold">Multilingual</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/40 border border-transparent hover:border-border hover:bg-white transition-all">
            <Zap className="w-6 h-6 text-primary/60" />
            <span className="font-bold">Lightning Fast</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/40 border border-transparent hover:border-border hover:bg-white transition-all">
            <GraduationCap className="w-6 h-6 text-primary/60" />
            <span className="font-bold">AI Native</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/40 border border-transparent hover:border-border hover:bg-white transition-all">
            <BookOpen className="w-6 h-6 text-primary/60" />
            <span className="font-bold">Structured</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
