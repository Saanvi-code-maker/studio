'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { summarizeCommonMisconceptions } from '@/ai/flows/summarize-common-misconceptions';
import { AlertTriangle, Lightbulb, TrendingUp, Loader2, Sparkles, RefreshCw, BarChart3, ShieldAlert } from 'lucide-react';

export default function TeacherPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [activeTopic, setActiveTopic] = useState('Cell Biology');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const db = useFirestore();

  // Check if user is a teacher via DBAC
  const teacherDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'teachers', user.uid);
  }, [db, user]);

  const { data: teacherDoc, isLoading: isTeacherCheckLoading } = useDoc(teacherDocRef);

  // Real-time student responses for the dashboard - teachers only
  const responsesQuery = useMemoFirebase(() => {
    if (!db || !user || !teacherDoc) return null;
    return collection(db, 'studentResponses');
  }, [db, user, teacherDoc]);

  const { data: responses, isLoading: isResponsesLoading } = useCollection(responsesQuery);

  const fetchInsights = async (topic: string) => {
    if (!user || !teacherDoc) return;
    setLoading(true);
    try {
      // Filter responses for the specific topic
      const relevantResponses = responses
        ?.filter(r => r.lessonId?.includes(topic.toLowerCase().split(' ')[0]))
        .map(r => r.answer || r.responseValue) || [];

      // Use mocks if no real data yet to keep dashboard useful for initial view
      const inputResponses = relevantResponses.length > 5 ? relevantResponses : [
        "The mitochondria is just a decoration in the cell.",
        "Ribosomes make energy for the cell.",
        "Cells are only found in humans, not plants.",
        "The nucleus is the powerhouse of the cell.",
        "Cells are made of tiny blocks of plastic."
      ];

      const result = await summarizeCommonMisconceptions({
        topic,
        studentResponses: inputResponses
      });
      setInsights(result);
    } catch (error) {
      console.error("Failed to fetch teacher insights", error);
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!teacherDoc && !isTeacherCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Navigation />
        <Card className="max-w-md w-full border-2 border-destructive/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-4">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-black">Access Restricted</CardTitle>
            <CardDescription className="text-lg">
              This dashboard is only available for verified educators.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button variant="outline" onClick={() => router.push('/learn')}>
              Return to Student View
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">
              Teacher Insights
            </h1>
            <p className="text-lg text-muted-foreground">Actionable intelligence to bridge learning gaps.</p>
          </div>
          <Button 
            className="shadow-lg h-12 px-6 font-bold bg-primary hover:bg-primary/90" 
            onClick={() => fetchInsights(activeTopic)} 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2 h-5 w-5" />}
            Regenerate Insights
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Active Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-primary">{responses?.length || 0}</div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                <TrendingUp className="w-3 h-3" />
                <span>Student Responses</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-accent shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Global Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-accent">72%</div>
              <p className="text-xs font-medium text-muted-foreground mt-2">Class average completion</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-400 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Topic Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-orange-500">3</div>
              <p className="text-xs font-medium text-orange-500/80 mt-2">High misconception rate</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-400 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest">AI Bridges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-blue-500">24</div>
              <p className="text-xs font-medium text-muted-foreground mt-2">Individual explanations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="Cell Biology" className="w-full" onValueChange={setActiveTopic}>
          <div className="bg-card p-1 rounded-xl shadow-sm border-2 mb-8 max-w-fit">
             <TabsList className="bg-transparent h-auto p-0">
               <TabsTrigger value="Cell Biology" className="data-[state=active]:bg-primary data-[state=active]:text-white h-11 px-8 font-bold transition-all rounded-lg">Cell Biology</TabsTrigger>
               <TabsTrigger value="Geometry" className="data-[state=active]:bg-primary data-[state=active]:text-white h-11 px-8 font-bold transition-all rounded-lg">Geometry</TabsTrigger>
               <TabsTrigger value="History" className="data-[state=active]:bg-primary data-[state=active]:text-white h-11 px-8 font-bold transition-all rounded-lg">History</TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value={activeTopic} className="space-y-8 mt-0 outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-card rounded-3xl border-2 border-dashed border-primary/20 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <Loader2 className="w-20 h-20 text-primary animate-spin" />
                  <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-accent animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-black text-foreground font-headline">AI Analysis Engine</p>
                  <p className="text-muted-foreground max-w-sm">Synthesizing common misunderstandings from real-time student data...</p>
                </div>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="lg:col-span-3 space-y-8">
                  <Card className="overflow-hidden border-2 shadow-xl">
                    <div className="bg-orange-50 px-6 py-5 border-b-2 border-orange-100 flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-orange-700 font-black font-headline">
                        <AlertTriangle className="w-7 h-7" />
                        Key Misconceptions
                      </CardTitle>
                      <BarChart3 className="w-6 h-6 text-orange-300" />
                    </div>
                    <CardContent className="p-8">
                      <div className="space-y-5">
                        {insights.commonMisconceptions.map((m: string, i: number) => (
                          <div key={i} className="group flex items-start gap-5 p-6 bg-orange-50/20 rounded-2xl border-2 border-transparent hover:border-orange-200 transition-all cursor-default">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-lg">
                              {i+1}
                            </div>
                            <p className="text-foreground text-lg leading-relaxed font-medium">{m}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 shadow-xl">
                    <CardHeader className="border-b-2 border-muted/30 p-6">
                      <CardTitle className="flex items-center gap-2 text-primary font-black font-headline">
                        <TrendingUp className="w-7 h-7" />
                        Pattern Synthesis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-xl leading-relaxed text-foreground/80 font-medium italic">
                        "{insights.summaryExplanation}"
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <Card className="border-2 border-accent/40 bg-accent/5 shadow-2xl relative overflow-hidden h-full">
                    <div className="absolute -top-10 -right-10 p-4 opacity-10">
                      <Sparkles className="w-48 h-48 text-accent" />
                    </div>
                    <CardHeader className="relative p-8">
                      <CardTitle className="flex items-center gap-2 text-accent-foreground font-black uppercase tracking-widest text-sm mb-2">
                        <Lightbulb className="w-6 h-6 text-accent" />
                        Teaching Strategy
                      </CardTitle>
                      <CardDescription className="text-lg font-bold text-accent-foreground/80 leading-snug">
                        AI-generated interventions for your next lesson
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative p-8 pt-0">
                      {insights.suggestedTeachingPoints.map((point: string, i: number) => (
                        <div key={i} className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm border-2 border-accent/20 hover:scale-[1.03] transition-transform duration-300">
                          <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <p className="text-base font-bold leading-relaxed text-foreground/90">{point}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-32 bg-card rounded-3xl border-2 border-dashed border-muted/50">
                <BarChart3 className="w-20 h-20 mx-auto text-muted-foreground/20 mb-6" />
                <p className="text-2xl font-black text-muted-foreground font-headline">Select a module to reveal class intelligence.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
