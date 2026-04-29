import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Globe, Zap, ShieldCheck, MousePointer2, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pro-gradient-bg">
      <div className="max-w-5xl w-full space-y-20 text-center py-12">
        <header className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 shadow-inner border-2 border-primary/5">
            <GraduationCap className="w-14 h-14" />
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter text-foreground font-headline">
              Shiksha<span className="text-primary">Setu</span>
            </h1>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Bridging the gap to academic mastery. Personalized AI learning that adapts to every student's unique potential.
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 pt-6">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Join Now <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold rounded-2xl border-2 hover:bg-white shadow-sm transition-all hover:scale-105 active:scale-95">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Card className="group hover:border-primary/40 transition-all duration-500 border-2 shadow-sm hover:shadow-2xl overflow-hidden bg-white/60 backdrop-blur-sm rounded-[2rem]">
            <CardHeader className="pb-4 p-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <CardTitle className="text-3xl font-black font-headline tracking-tight">
                Student Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                Unlock your true potential with adaptive lessons and instant AI support.
              </p>
              <div className="space-y-4">
                {[
                  "Personalized AI explanations",
                  "Real-time progress analytics",
                  "Adaptive assessment paths"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-lg font-bold text-foreground/80">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <MousePointer2 className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/learn" className="block pt-4">
                <Button variant="link" className="text-primary font-black text-lg p-0 h-auto group-hover:translate-x-1 transition-transform">
                  Enter Portal <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:border-accent/40 transition-all duration-500 border-2 shadow-sm hover:shadow-2xl overflow-hidden bg-white/60 backdrop-blur-sm rounded-[2rem]">
            <CardHeader className="pb-4 p-10">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <CardTitle className="text-3xl font-black font-headline tracking-tight">
                Teacher Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                Data-driven class intelligence to optimize every teaching moment.
              </p>
              <div className="space-y-4">
                {[
                  "Class misconception heatmaps",
                  "Automated student feedback",
                  "Curriculum gap identification"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-lg font-bold text-foreground/80">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <MousePointer2 className="w-3 h-3 text-accent" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/teacher" className="block pt-4">
                <Button variant="link" className="text-accent font-black text-lg p-0 h-auto group-hover:translate-x-1 transition-transform">
                  Access Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500 max-w-4xl mx-auto">
          {[
            { icon: Globe, label: 'Global Access' },
            { icon: Zap, label: 'Real-time AI' },
            { icon: GraduationCap, label: 'Academic Rigor' },
            { icon: BookOpen, label: 'Structured Paths' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/40 border border-transparent hover:border-border hover:bg-white transition-all shadow-sm">
              <item.icon className="w-8 h-8 text-primary/60" />
              <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
}