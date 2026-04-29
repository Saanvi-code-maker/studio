'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { summarizeCommonMisconceptions } from '@/ai/flows/summarize-common-misconceptions';
import { SplashScreen } from '@/components/SplashScreen';
import { useTranslation } from '@/hooks/use-translation';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  BarChart3, 
  ShieldAlert, 
  Users, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function TeacherPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { t } = useTranslation();
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

  const analysesQuery = useMemoFirebase(() => {
    if (!db || !user || !teacherDoc) return null;
    return collection(db, 'aiAnalyses');
  }, [db, user, teacherDoc]);

  const { data: responses, isLoading: isResponsesLoading } = useCollection(responsesQuery);
  const { data: analyses, isLoading: isAnalysesLoading } = useCollection(analysesQuery);

  const stats = useMemo(() => {
    if (!responses || !analyses) return { mastery: 0, total: 0, chartData: [] };
    
    const correct = responses.filter(r => r.isCorrect).length;
    const total = responses.length;
    const mastery = total > 0 ? Math.round((correct / total) * 100) : 0;

    const typeCounts = analyses.reduce((acc: any, curr: any) => {
      const type = curr.analysisResultType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const chartData = [
      { name: 'Confused', value: typeCounts['confused'] || 0, color: '#f43f5e' },
      { name: 'Partial', value: typeCounts['partial_understanding'] || 0, color: '#eab308' },
      { name: 'Guessing', value: typeCounts['guessing'] || 0, color: '#3b82f6' },
      { name: 'Correct', value: (total - analyses.length) || 0, color: '#10b981' }
    ].filter(d => d.value > 0);

    return { mastery, total, chartData };
  }, [responses, analyses]);

  const atRiskStudents = useMemo(() => {
    if (!responses) return [];
    
    const studentStats = responses.reduce((acc: any, curr: any) => {
      if (!acc[curr.studentId]) {
        acc[curr.studentId] = { id: curr.studentId, total: 0, incorrect: 0, lastSeen: curr.submittedAt };
      }
      acc[curr.studentId].total += 1;
      if (!curr.isCorrect) acc[curr.studentId].incorrect += 1;
      if (new Date(curr.submittedAt) > new Date(acc[curr.studentId].lastSeen)) {
        acc[curr.studentId].lastSeen = curr.submittedAt;
      }
      return acc;
    }, {});

    return Object.values(studentStats)
      .map((s: any) => ({
        ...s,
        failRate: Math.round((s.incorrect / s.total) * 100)
      }))
      .filter((s: any) => s.failRate > 40)
      .sort((a, b) => b.failRate - a.failRate);
  }, [responses]);

  const fetchInsights = async (topic: string) => {
    if (!user || !teacherDoc) return;
    setLoading(true);
    try {
      const topicKeywords = topic.toLowerCase().split(' ');
      const relevantResponses = responses
        ?.filter(r => !r.isCorrect && topicKeywords.some(kw => (r.lessonId || '').toLowerCase().includes(kw)))
        .map(r => r.responseValue) || [];

      // Fallback example data if no responses exist for the demo
      const inputResponses = relevantResponses.length > 3 ? relevantResponses : [
        "Mitochondria is only in plant cells.",
        "Cells are the same as bricks.",
        "The nucleus is optional.",
        "Plant cells don't have energy.",
        "Triangle sum is 90 degrees."
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

  if (isUserLoading || isTeacherCheckLoading || isResponsesLoading || isAnalysesLoading) {
    return <SplashScreen message="Syncing Educator Intelligence" />;
  }

  if (!user) return null;

  if (!teacherDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 hero-gradient">
        <Navigation />
        <Card className="max-w-md w-full border-4 border-destructive/10 shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <div className="bg-destructive h-2 w-full" />
          <CardHeader className="text-center pt-12 pb-6">
            <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-[2.5rem] flex items-center justify-center text-destructive mb-8 rotate-12">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <CardTitle className="text-4xl font-black font-headline tracking-tighter">{t.teacher.restricted}</CardTitle>
            <CardDescription className="text-xl font-medium pt-4 px-4 leading-relaxed">
              {t.teacher.restrictedDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-12">
            <Button size="lg" className="rounded-2xl font-black h-16 px-10 shadow-xl" onClick={() => router.push('/learn')}>
              {t.teacher.returnStudent}
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
              {t.teacher.dashboard}
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-foreground font-headline leading-[0.85]">
              {t.teacher.title} <span className="text-primary">{t.teacher.subtitle}</span>
            </h1>
            <p className="text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
              Converting student cognitive patterns into specialized teaching interventions.
            </p>
          </div>
          <Button 
            size="lg"
            className="h-20 px-10 text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all active:scale-95 group" 
            onClick={() => fetchInsights(activeTopic)} 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-4 h-6 w-6" /> : <RefreshCw className="mr-4 h-6 w-6 group-hover:rotate-180 transition-transform duration-1000" />}
            {t.teacher.regenerate}
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: t.teacher.participation, value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
            { label: t.teacher.mastery, value: `${stats.mastery}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/5' },
            { label: t.teacher.gaps, value: insights?.commonMisconceptions?.length || 0, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/5' },
            { label: t.teacher.bridges, value: analyses?.length || 0, icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-500/5' }
          ].map((stat) => (
            <Card key={stat.label} className="border-2 shadow-sm rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black opacity-30 uppercase border-2">{t.learn.snapshot}</Badge>
                </div>
                <div className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-3">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-12">
            <Card className="pro-card p-10 space-y-8">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-black font-headline tracking-tighter text-foreground uppercase">{t.teacher.cognitiveDistribution}</CardTitle>
                <CardDescription className="font-medium">{t.teacher.misunderstandingTypes}</CardDescription>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="pro-card p-0 overflow-hidden border-rose-100 bg-rose-50/20">
              <CardHeader className="p-10 border-b border-rose-100 bg-rose-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500 rounded-2xl text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-black font-headline tracking-tighter text-rose-800 uppercase">{t.teacher.atRisk}</CardTitle>
                </div>
              </CardHeader>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-rose-100">
                      <TableHead className="font-black text-[10px] uppercase text-rose-900/40">{t.teacher.studentUid}</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase text-rose-900/40">{t.teacher.failureRate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskStudents.length > 0 ? atRiskStudents.map((s: any) => (
                      <TableRow key={s.id} className="border-rose-100 hover:bg-white transition-colors">
                        <TableCell className="font-bold text-rose-950 truncate max-w-[120px]">{s.id}</TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-rose-500 text-white font-black">{s.failRate}%</Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-10 text-muted-foreground italic font-medium">{t.teacher.onTrack}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-12">
            <Tabs defaultValue="Cell Biology" className="w-full" onValueChange={setActiveTopic}>
              <div className="bg-white/50 backdrop-blur-sm p-2 rounded-[2.5rem] shadow-xl border-2 inline-flex mb-8">
                <TabsList className="bg-transparent h-auto p-0 gap-2">
                  {['Cell Biology', 'Geometry', 'History'].map(topic => (
                    <TabsTrigger 
                      key={topic}
                      value={topic} 
                      className="data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-8 font-black transition-all rounded-[1.8rem] text-muted-foreground uppercase tracking-widest text-[10px]"
                    >
                      {topic}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTopic} className="space-y-12 outline-none">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-10 bg-white rounded-[3rem] border-2 border-dashed border-primary/20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-xl font-black text-muted-foreground/60">{t.teacher.synthesizing}</p>
                  </div>
                ) : insights ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="pro-card overflow-hidden">
                      <div className="bg-primary/5 px-8 py-6 border-b-2 border-primary/10 flex items-center gap-4">
                        <AlertTriangle className="text-primary w-6 h-6" />
                        <CardTitle className="text-xl font-black font-headline text-primary tracking-tighter uppercase">{t.teacher.gapTitle}</CardTitle>
                      </div>
                      <CardContent className="p-8 space-y-4">
                        {insights.commonMisconceptions.map((m: string, i: number) => (
                          <div key={i} className="flex items-start gap-4 p-5 bg-secondary/30 rounded-2xl">
                            <span className="font-black text-primary/30 text-lg">{i+1}</span>
                            <p className="text-sm font-bold leading-relaxed">{m}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-none bg-primary text-white shadow-2xl rounded-[3rem] overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Sparkles className="w-48 h-48" />
                      </div>
                      <CardHeader className="p-10 relative">
                        <Badge className="bg-white/20 text-white border-none uppercase text-[9px] mb-4 w-fit">{t.teacher.intervention}</Badge>
                        <CardTitle className="text-4xl font-black font-headline tracking-tighter leading-none">{t.teacher.adaptive}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 pt-0 space-y-6 relative">
                        {insights.suggestedTeachingPoints.map((point: string, i: number) => (
                          <div key={i} className="flex gap-4 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <CheckCircle2 className="w-6 h-6 shrink-0 text-white" />
                            <p className="text-sm font-bold leading-snug">{point}</p>
                          </div>
                        ))}
                        <Button className="w-full h-14 rounded-2xl bg-white text-primary font-black hover:bg-white/90 active:scale-95 transition-all mt-6">
                          {t.teacher.export} <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-muted/50">
                    <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                    <p className="text-2xl font-black text-muted-foreground/30 font-headline uppercase">{t.teacher.selectTopic}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
