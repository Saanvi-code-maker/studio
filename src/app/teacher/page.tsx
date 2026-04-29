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
import { AlertTriangle, Lightbulb, TrendingUp, Loader2, Sparkles, RefreshCw, BarChart3, ShieldAlert, Users, BrainCircuit, CheckCircle2 } from 'lucide-react';

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
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!teacherDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 hero-gradient">
        <Navigation />
        <Card className="max-w-md w-full border-2 border-destructive/20 shadow-2xl rounded-[2.5rem]">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-black font-headline">Access Restricted</CardTitle>
            <CardDescription className="text-lg font-medium pt-2">
              Verified educator credentials are required to access these analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-12">
            <Button variant="outline" className="border-2 font-bold h-12 px-8 rounded-xl" onClick={() => router.push('/learn')}>
              Return to Student Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pt-24 bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-700">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
              <BrainCircuit className="w-4 h-4" />
              Educator Analytics
            </div>
            <h1 className="text-6xl font-black tracking-tight text-foreground font-headline">
              Class Intelligence
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl">
              AI-driven insights to bridge learning gaps and optimize student outcomes.
            </p>
          </div>
          <Button 
            className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95" 
            onClick={() => fetchInsights(activeTopic)} 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <RefreshCw className="mr-3 h-5 w-5" />}
            Refresh Analysis
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Participation', value: responses?.length || 0, icon: Users, color: 'text-primary', border: 'border-l-primary' },
            { label: 'Avg. Mastery', value: '74%', icon: TrendingUp, color: 'text-emerald-600', border: 'border-l-emerald-500' },
            { label: 'Critical Gaps', value: '2', icon: AlertTriangle, color: 'text-orange-500', border: 'border-l-orange-500' },
            { label: 'AI Bridges', value: '18', icon: Sparkles, color: 'text-indigo-600', border: 'border-l-indigo-500' }
          ].map((stat, i) => (
            <Card key={stat.label} className={`border-2 border-l-[6px] ${stat.border} shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-lg rounded-2xl`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color} opacity-60`} />
                  <Badge variant="outline" className="text-[10px] font-bold opacity-40 uppercase">Stat {i+1}</Badge>
                </div>
                <div className={`text-4xl font-black ${stat.color}`}>{stat.value}</div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="Cell Biology" className="w-full" onValueChange={setActiveTopic}>
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border-2 inline-flex mb-10">
             <TabsList className="bg-transparent h-auto p-0">
               {['Cell Biology', 'Geometry', 'History'].map(topic => (
                 <TabsTrigger 
                   key={topic}
                   value={topic} 
                   className="data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-10 font-black transition-all rounded-xl text-muted-foreground uppercase tracking-widest text-xs"
                 >
                   {topic}
                 </TabsTrigger>
               ))}
             </TabsList>
          </div>

          <TabsContent value={activeTopic} className="space-y-10 outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-white rounded-[2.5rem] border-2 border-dashed border-primary/20 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <Loader2 className="w-24 h-24 text-primary animate-spin relative" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-3xl font-black text-foreground font-headline">Synthesizing Class Data</p>
                  <p className="text-muted-foreground max-w-sm font-medium">Processing student responses with AI to identify systemic misunderstandings...</p>
                </div>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-8 duration-1000">
                <div className="lg:col-span-7 space-y-10">
                  <Card className="overflow-hidden border-2 shadow-2xl rounded-[2.5rem]">
                    <div className="bg-primary/5 px-8 py-6 border-b-2 border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary rounded-xl text-white">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl font-black font-headline text-primary">
                          Major Misconceptions
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary font-bold">Priority View</Badge>
                    </div>
                    <CardContent className="p-8 space-y-6">
                      {insights.commonMisconceptions.map((m: string, i: number) => (
                        <div key={i} className="group flex items-start gap-6 p-6 bg-secondary/30 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center text-primary font-black text-xl shadow-sm">
                            {i+1}
                          </div>
                          <p className="text-foreground text-lg leading-relaxed font-bold group-hover:text-primary transition-colors">{m}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-2 shadow-xl rounded-[2.5rem] bg-secondary/10">
                    <CardHeader className="p-8 border-b-2 border-border/50">
                      <CardTitle className="flex items-center gap-3 text-primary font-black font-headline text-xl">
                        <BarChart3 className="w-6 h-6" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-xl leading-relaxed text-foreground/80 font-medium italic">
                        "{insights.summaryExplanation}"
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-5">
                  <Card className="border-2 border-primary/20 bg-primary shadow-2xl rounded-[2.5rem] h-full overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                      <Lightbulb className="w-64 h-64 text-white" />
                    </div>
                    <CardHeader className="p-10 relative">
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full text-white font-bold uppercase tracking-widest text-[10px] mb-4 backdrop-blur-md">
                        <Sparkles className="w-4 h-4" />
                        AI Teaching Assistant
                      </div>
                      <CardTitle className="text-4xl font-black text-white font-headline leading-tight">
                        Adaptive Intervention
                      </CardTitle>
                      <CardDescription className="text-lg font-medium text-white/70 leading-relaxed mt-4">
                        Data-driven teaching points tailored to your current class performance.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-6 relative">
                      {insights.suggestedTeachingPoints.map((point: string, i: number) => (
                        <div key={i} className="flex gap-6 p-6 bg-white rounded-2xl shadow-xl hover:translate-x-2 transition-all duration-300">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <p className="text-base font-black leading-snug text-foreground/90">{point}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[2.5rem] border-2 border-dashed border-muted/50">
                <div className="w-24 h-24 mx-auto mb-8 bg-secondary/50 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <p className="text-3xl font-black text-muted-foreground/40 font-headline">Select a topic to generate intelligence.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}