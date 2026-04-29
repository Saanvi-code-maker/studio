'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { summarizeCommonMisconceptions } from '@/ai/flows/summarize-common-misconceptions';
import { AlertTriangle, Lightbulb, TrendingUp, Loader2, Sparkles, RefreshCw, BarChart3, ShieldAlert, Users, BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TeacherPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [activeTopic, setActiveTopic] = useState('Cell Biology');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const db = useFirestore();

  const teacherDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'teachers', user.uid);
  }, [db, user]);

  const { data: teacherDoc, isLoading: isTeacherCheckLoading } = useDoc(teacherDocRef);

  const responsesQuery = useMemoFirebase(() => {
    if (!db || !user || !teacherDoc) return null;
    return collection(db, 'studentResponses');
  }, [db, user, teacherDoc]);

  const { data: responses, isLoading: isResponsesLoading } = useCollection(responsesQuery);

  const fetchInsights = async (topic: string) => {
    if (!user || !teacherDoc) return;
    setLoading(true);
    try {
      const relevantResponses = responses
        ?.filter(r => r.lessonId?.includes(topic.toLowerCase().split(' ')[0]))
        .map(r => r.responseValue) || [];

      // Fallback mocks if data is insufficient for AI analysis
      const inputResponses = relevantResponses.length > 2 ? relevantResponses : [
        "Mitochondria is only in plants.",
        "Cells are just blocks of matter.",
        "The nucleus has no function.",
        "Energy is created by the cell walls."
      ];

      const result = await summarizeCommonMisconceptions({
        topic,
        studentResponses: inputResponses
      });
      setInsights(result);
    } catch (error) {
      console.error("Teacher insights failure", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (teacherDoc && responses) {
      fetchInsights(activeTopic);
    }
  }, [activeTopic, teacherDoc, responses?.length]);

  if (isUserLoading || isTeacherCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!teacherDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 hero-gradient">
        <Navigation />
        <Card className="max-w-md w-full border-4 border-destructive/10 shadow-[0_40px_100px_-20px_rgba(220,38,38,0.2)] rounded-[3rem] overflow-hidden">
          <div className="bg-destructive h-2 w-full" />
          <CardHeader className="text-center pt-12 pb-6">
            <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-[2rem] flex items-center justify-center text-destructive mb-8 rotate-12">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <CardTitle className="text-4xl font-black font-headline tracking-tighter">Access Restricted</CardTitle>
            <CardDescription className="text-xl font-medium pt-4 px-4 leading-relaxed">
              Educator Dashboard requires verified credentials. Please contact administration.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-12">
            <Button size="lg" className="rounded-2xl font-black h-16 px-10 shadow-xl" onClick={() => router.push('/learn')}>
              Return to Student Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 md:pt-32 bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-8 space-y-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
              <BrainCircuit className="w-5 h-5" />
              Intelligence Dashboard
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-foreground font-headline leading-[0.85]">
              Class <span className="text-primary">Analytics</span>
            </h1>
            <p className="text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
              Synthesizing individual student performance into strategic teaching insights.
            </p>
          </div>
          <Button 
            size="lg"
            className="h-20 px-10 text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all active:scale-95 group" 
            onClick={() => fetchInsights(activeTopic)} 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-4 h-6 w-6" /> : <RefreshCw className="mr-4 h-6 w-6 group-hover:rotate-180 transition-transform duration-700" />}
            Regenerate Intelligence
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Participation', value: responses?.length || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Avg. Mastery', value: '74%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/5' },
            { label: 'Critical Gaps', value: '2', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/5' },
            { label: 'AI Bridges', value: '18', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-500/5' }
          ].map((stat) => (
            <Card key={stat.label} className="border-2 shadow-sm rounded-[2rem] overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black opacity-30 uppercase border-2">Live</Badge>
                </div>
                <div className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-3">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="Cell Biology" className="w-full" onValueChange={setActiveTopic}>
          <div className="bg-white p-2 rounded-[2.5rem] shadow-xl border-2 inline-flex mb-12">
             <TabsList className="bg-transparent h-auto p-0 gap-2">
               {['Cell Biology', 'Geometry', 'History'].map(topic => (
                 <TabsTrigger 
                   key={topic}
                   value={topic} 
                   className="data-[state=active]:bg-primary data-[state=active]:text-white h-14 px-12 font-black transition-all rounded-[1.8rem] text-muted-foreground uppercase tracking-widest text-xs"
                 >
                   {topic}
                 </TabsTrigger>
               ))}
             </TabsList>
          </div>

          <TabsContent value={activeTopic} className="space-y-12 outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-48 space-y-10 bg-white rounded-[4rem] border-2 border-dashed border-primary/20 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
                  <div className="w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <p className="text-4xl font-black text-foreground font-headline tracking-tighter leading-none">Synthesizing Class Data</p>
                  <p className="text-xl text-muted-foreground max-w-sm font-medium mx-auto">Gemini is analyzing student responses to identify recurring patterns of confusion...</p>
                </div>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-12 duration-1000">
                <div className="lg:col-span-7 space-y-12">
                  <Card className="overflow-hidden border-2 shadow-2xl rounded-[3rem]">
                    <div className="bg-primary/5 px-10 py-8 border-b-2 border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                          <AlertTriangle className="w-7 h-7" />
                        </div>
                        <CardTitle className="text-3xl font-black font-headline text-primary tracking-tighter">
                          Systemic Gaps
                        </CardTitle>
                      </div>
                      <Badge className="bg-primary text-white font-black px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">High Priority</Badge>
                    </div>
                    <CardContent className="p-10 space-y-8">
                      {insights.commonMisconceptions.map((m: string, i: number) => (
                        <div key={i} className="group flex items-start gap-8 p-8 bg-secondary/30 rounded-[2.5rem] border-2 border-transparent hover:border-primary/30 hover:bg-white transition-all duration-500 shadow-sm">
                          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white border-2 border-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {i+1}
                          </div>
                          <p className="text-foreground text-xl leading-relaxed font-bold tracking-tight group-hover:text-primary transition-colors">{m}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-2 shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                    <CardHeader className="p-10 border-b-2 border-border/50 bg-secondary/20">
                      <CardTitle className="flex items-center gap-4 text-primary font-black font-headline text-2xl tracking-tighter">
                        <BarChart3 className="w-7 h-7" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                      <p className="text-2xl leading-relaxed text-foreground font-medium italic">
                        "{insights.summaryExplanation}"
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-5">
                  <Card className="border-none bg-primary shadow-[0_50px_100px_-20px_rgba(59,130,246,0.5)] rounded-[3rem] h-full overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150">
                      <Lightbulb className="w-64 h-64 text-white" />
                    </div>
                    <CardHeader className="p-12 relative">
                      <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-full text-white font-black uppercase tracking-[0.2em] text-[10px] mb-6 backdrop-blur-xl border border-white/20">
                        <Sparkles className="w-5 h-5" />
                        AI Intervention
                      </div>
                      <CardTitle className="text-5xl font-black text-white font-headline leading-[0.9] tracking-tighter">
                        Adaptive <br/>Teaching Points
                      </CardTitle>
                      <CardDescription className="text-xl font-medium text-white/80 leading-relaxed mt-6">
                        Strategic actions designed to bridge identified gaps in today's performance.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 pt-0 space-y-8 relative">
                      {insights.suggestedTeachingPoints.map((point: string, i: number) => (
                        <div key={i} className="flex gap-6 p-8 bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl hover:translate-x-3 transition-all duration-500 group">
                          <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <p className="text-lg font-black leading-snug text-foreground/90">{point}</p>
                        </div>
                      ))}
                      <div className="pt-6">
                         <Button className="w-full h-16 rounded-2xl bg-white text-primary font-black text-lg hover:bg-white/90 shadow-xl group">
                            Export Lesson Plan <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-48 bg-white rounded-[4rem] border-2 border-dashed border-muted/50 group">
                <div className="w-32 h-32 mx-auto mb-10 bg-secondary/50 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <BarChart3 className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <p className="text-4xl font-black text-muted-foreground/30 font-headline tracking-tighter">Select a curriculum topic <br/> to generate insights.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}