import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Globe, Zap, ShieldCheck, ArrowRight, CheckCircle2, LayoutGrid } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center hero-gradient">
      <div className="max-w-6xl w-full px-6 py-20 md:py-32 space-y-24">
        {/* Hero Section */}
        <header className="text-center space-y-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-black uppercase tracking-widest text-[10px] mb-4">
            <Zap className="w-4 h-4" />
            Empowering the next generation
          </div>
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground font-headline leading-[0.9]">
              Shiksha<span className="text-primary">Setu</span>
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed font-medium">
              Bridging the gap between instruction and mastery. Personalized AI learning that adapts to every student's potential.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-16 px-12 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                Get Started <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-16 px-12 text-xl font-bold rounded-2xl border-2 hover:bg-white/50 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Feature Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Student Portal Card */}
          <Card className="pro-card group overflow-hidden border-2">
            <CardHeader className="p-10 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <CardTitle className="text-4xl font-black font-headline tracking-tighter">
                Student Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Unlock your true academic potential with adaptive lessons and instant AI support.
              </p>
              <div className="space-y-4">
                {[
                  "Personalized AI explanations",
                  "Adaptive assessment paths",
                  "Real-time mastery tracking"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-lg font-bold text-foreground/80">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/learn" className="block pt-4">
                <Button className="w-full h-14 rounded-xl text-lg font-bold bg-primary/5 text-primary hover:bg-primary/10 border-none">
                  Enter Portal <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Teacher Dashboard Card */}
          <Card className="pro-card group overflow-hidden border-2">
            <CardHeader className="p-10 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <CardTitle className="text-4xl font-black font-headline tracking-tighter">
                Educator Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Data-driven class intelligence to optimize every teaching moment and close gaps.
              </p>
              <div className="space-y-4">
                {[
                  "Class misconception heatmaps",
                  "Automated feedback insights",
                  "Systemic gap identification"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-lg font-bold text-foreground/80">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/teacher" className="block pt-4">
                <Button className="w-full h-14 rounded-xl text-lg font-bold bg-accent/5 text-accent hover:bg-accent/10 border-none">
                  Access Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Global Footer */}
        <footer className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Globe, label: 'Global Access' },
            { icon: Zap, label: 'Real-time AI' },
            { icon: GraduationCap, label: 'Academic Rigor' },
            { icon: LayoutGrid, label: 'Intuitive Design' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/50 border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary">
              <item.icon className="w-8 h-8 opacity-60" />
              <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
}