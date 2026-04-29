'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { summarizeCommonMisconceptions } from '@/ai/flows/summarize-common-misconceptions';
import { Users, AlertTriangle, Lightbulb, TrendingUp, Loader2, Sparkles, RefreshCw, BarChart3 } from 'lucide-react';

export default function TeacherPage() {
  const [activeTopic, setActiveTopic] = useState('Cell Biology');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const db = useFirestore();

  // Real-time student responses for the dashboard
  const responsesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'users');
  }, [db]);

  const { data: students, isLoading: isStudentsLoading } = useCollection(responsesQuery);

  const fetchInsights = async (topic: string) => {
    setLoading(true);
    try {
      // Gather real student responses for this topic if they exist
      const relevantResponses = students
        ?.flatMap(s => s.responses || [])
        .filter(r => r.lessonId.includes(topic.toLowerCase().split(' ')[0]))
        .map(r => r.answer) || [];

      // Use mocks if no real data yet to keep dashboard useful
      const inputResponses = relevantResponses.length > 0 ? relevantResponses : [
        "The mitochondria is just a decoration in the cell.",
        "Ribosomes make energy for the cell.",
        "Cells are only found in humans, not plants."
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
    if (students) fetchInsights(activeTopic);
  }, [activeTopic, students?.length]);

  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Teacher Insights
            </h1>
            <p className="text-lg text-muted-foreground">Actionable intelligence to bridge learning gaps.</p>
          </div>
          <Button 
            className="shadow-lg h-12 px-6 font-bold" 
            onClick={() => fetchInsights(activeTopic)} 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2 h-5 w-5" />}
            Regenerate Insights
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-primary">{students?.length || 0}</div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                <TrendingUp className="w-3 h-3" />
                <span>Synchronized with Firestore</span>
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
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest">AI Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-blue-500">{students?.reduce((acc, s) => acc + (s.responses?.length || 0), 0)}</div>
              <p className="text-xs font-medium text-muted-foreground mt-2">Individual bridges built</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="Cell Biology" className="w-full" onValueChange={setActiveTopic}>
          <div className="bg-white p-1 rounded-xl shadow-sm border mb-8 max-w-fit">
             <TabsList className="bg-transparent">
               <TabsTrigger value="Cell Biology" className="data-[state=active]:bg-primary data-[state=active]:text-white h-10 px-6 font-bold">Cell Biology</TabsTrigger>
               <TabsTrigger value="Geometry" className="data-[state=active]:bg-primary data-[state=active]:text-white h-10 px-6 font-bold">Geometry</TabsTrigger>
               <TabsTrigger value="History" className="data-[state=active]:bg-primary data-[state=active]:text-white h-10 px-6 font-bold">History</TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value={activeTopic} className="space-y-8 mt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6 bg-white rounded-3xl border-2 border-dashed">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-foreground">AI Intelligence Lab</p>
                  <p className="text-muted-foreground">Synthesizing common misunderstandings from student data...</p>
                </div>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                  <Card className="overflow-hidden border-2 shadow-lg">
                    <div className="bg-orange-50 px-6 py-4 border-b-2 border-orange-100 flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-orange-700 font-black">
                        <AlertTriangle className="w-6 h-6" />
                        Key Misconceptions Identified
                      </CardTitle>
                      <BarChart3 className="w-5 h-5 text-orange-300" />
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {insights.commonMisconceptions.map((m: string, i: number) => (
                          <div key={i} className="group flex items-start gap-4 p-5 bg-orange-50/30 rounded-2xl border-2 border-transparent hover:border-orange-200 transition-all">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm">
                              {i+1}
                            </div>
                            <p className="text-foreground leading-relaxed font-medium">{m}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 shadow-lg">
                    <CardHeader className="border-b-2 border-muted/30">
                      <CardTitle className="flex items-center gap-2 text-primary font-black">
                        <TrendingUp className="w-6 h-6" />
                        Pattern Synthesis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-lg leading-relaxed text-foreground/80 font-medium">
                        {insights.summaryExplanation}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <Card className="border-2 border-accent/40 bg-accent/5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-24 h-24 text-accent" />
                    </div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-2 text-accent-foreground font-black uppercase tracking-widest text-sm">
                        <Lightbulb className="w-5 h-5 text-accent" />
                        AI Teaching Strategy
                      </CardTitle>
                      <CardDescription className="font-bold text-accent-foreground/70">
                        Personalized interventions for your next lesson
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative">
                      {insights.suggestedTeachingPoints.map((point: string, i: number) => (
                        <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border-2 border-accent/20 hover:scale-[1.02] transition-transform">
                          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold leading-relaxed text-foreground/90">{point}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed">
                <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-xl font-bold text-muted-foreground">Select a module to reveal class intelligence.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
