
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Globe, Zap, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, LayoutGrid } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useUser } from '@/firebase';
import { SplashScreen } from '@/components/SplashScreen';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/learn');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <SplashScreen message="Preparing Learning Environment" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center hero-gradient">
      <Navigation />
      <div className="max-w-6xl w-full px-6 py-32 md:py-48 space-y-32">
        {/* Hero Section */}
        <header className="text-center space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary/10 rounded-full text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
            <Sparkles className="w-4 h-4" />
            Empowering Human Potential
          </div>
          <div className="space-y-8">
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-foreground font-headline leading-[0.8] mb-4">
              Shiksha<span className="text-primary">Setu</span>
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed font-medium max-w-3xl mx-auto">
              Bridging the gap between instruction and mastery. Personalized AI learning that adapts to every student.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-20 px-16 text-2xl font-black rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-500 bg-primary">
                Get Started <ArrowRight className="ml-3 w-7 h-7" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-20 px-16 text-2xl font-black rounded-[2rem] border-4 hover:bg-white/50 transition-all duration-500">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Feature Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <Card className="pro-card group">
            <CardHeader className="p-12 pb-6">
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:rotate-6 transition-transform duration-700">
                <BookOpen className="w-10 h-10" />
              </div>
              <CardTitle className="text-5xl font-black font-headline tracking-tighter">
                Student <br/> Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0 space-y-10">
              <p className="text-2xl text-muted-foreground font-medium leading-relaxed">
                Unlock your academic potential with immersive lessons and instant AI support.
              </p>
              <div className="space-y-6">
                {[
                  "Personalized AI explanations",
                  "Adaptive assessment paths",
                  "Real-time mastery tracking"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 text-xl font-bold text-foreground/80">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/learn" className="block pt-6">
                <Button className="w-full h-16 rounded-2xl text-xl font-black bg-primary/5 text-primary hover:bg-primary/10 border-none">
                  Enter Portal <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="pro-card group">
            <CardHeader className="p-12 pb-6">
              <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:rotate-6 transition-transform duration-700">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <CardTitle className="text-5xl font-black font-headline tracking-tighter">
                Educator <br/> Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0 space-y-10">
              <p className="text-2xl text-muted-foreground font-medium leading-relaxed">
                Data-driven intelligence to optimize every teaching moment and close gaps.
              </p>
              <div className="space-y-6">
                {[
                  "Class misconception heatmaps",
                  "Automated feedback insights",
                  "Systemic gap identification"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 text-xl font-bold text-foreground/80">
                    <CheckCircle2 className="w-7 h-7 text-accent" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/teacher" className="block pt-6">
                <Button className="w-full h-16 rounded-2xl text-xl font-black bg-accent/5 text-accent hover:bg-accent/10 border-none">
                  Access Dashboard <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="pt-32 pb-20 border-t-2 border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
            {[
              { icon: Globe, label: 'Global Access' },
              { icon: Zap, label: 'Real-time AI' },
              { icon: GraduationCap, label: 'Academic Rigor' },
              { icon: LayoutGrid, label: 'Intuitive Design' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-4 text-muted-foreground hover:text-primary transition-all group">
                <div className="p-6 rounded-[2rem] bg-white border-2 border-transparent group-hover:border-primary/20 shadow-sm transition-all">
                  <item.icon className="w-10 h-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-32">
             <span className="font-headline font-black text-3xl tracking-tighter text-muted-foreground/30 uppercase">
               Bridging Knowledge
             </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
