
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { summarizeCommonMisconceptions } from '@/ai/flows/summarize-common-misconceptions';
import { generateLessonPlan, LessonPlanOutput } from '@/ai/flows/generate-lesson-plan';
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
  AlertCircle,
  FileText,
  Search,
  BookOpen,
  Zap,
  Clock,
  Lightbulb,
  UserCheck
} from 'lucide-react';

export default function TeacherPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { t } = useTranslation();
  const [activeTopic, setActiveTopic] = useState('Cell Biology');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerTopic, setPlannerTopic] = useState('');
  const [lessonPlan, setLessonPlan] = useState<LessonPlanOutput | null>(null);
  
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

  const usersQuery = useMemoFirebase(() => {
    if (!db || !user || !teacherDoc) return null;
    return collection(db, 'users');
  }, [db, user, teacherDoc]);

  const { data: responses, isLoading: isResponsesLoading } = useCollection(responsesQuery);
  const { data: analyses, isLoading: isAnalysesLoading } = useCollection(analysesQuery);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

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
      { name: 'Correct', value: Math.max(0, total - analyses.length), color: '#10b981' }
    ].filter(d => d.value > 0 || d.name === 'Correct');

    return { mastery, total, chartData };
  }, [responses, analyses]);

  const studentProgress = useMemo(() => {
    if (!allUsers || !responses) return [];
    
    return allUsers
      .filter(u => u.role === 'student')
      .map(u => {
        const studentResponses = responses.filter(r => r.studentId === u.id);
        const bioResponses = studentResponses.filter(r => r.lessonId.includes('biology'));
        const mathResponses = studentResponses.filter(r => r.lessonId.includes('math'));
        const histResponses = studentResponses.filter(r => r.lessonId.includes('history'));

        const getMastery = (list: any[]) => list.length > 0 ? Math.round((list.filter(r => r.isCorrect).length / list.length) * 100) : 0;

        const weaknesses = [];
        if (getMastery(bioResponses) < 50 && bioResponses.length > 0) weaknesses.push('Cell Biology');
        if (getMastery(mathResponses) < 50 && mathResponses.length > 0) weaknesses.push('Geometry');
        if (getMastery(histResponses) < 50 && histResponses.length > 0) weaknesses.push('Foundations');

        return {
          id: u.id,
          name: u.displayName,
          bioMastery: getMastery(bioResponses),
          mathMastery: getMastery(mathResponses),
          histMastery: getMastery(histResponses),
          weaknesses
        };
      });
  }, [allUsers, responses]);

  const handleGenerateLessonPlan = async () => {
    if (!plannerTopic) return;
    setPlannerLoading(true);
    try {
      const result = await generateLessonPlan({
        topic: plannerTopic,
        gradeLevel: 'Middle School',
      });
      setLessonPlan(result);
    } catch (error) {
      console.error("Lesson Plan generation failed", error);
    } finally {
      setPlannerLoading(false);
    }
  };

  const fetchInsights = async (topic: string) => {
    if (!user || !teacherDoc || !responses) return;
    setLoading(true);
    try {
      const topicKeywords = topic.toLowerCase().split(' ');
      const relevantResponses = responses
        ?.filter(r => !r.isCorrect && topicKeywords.some(kw => (r.lessonId || '').toLowerCase().includes(kw)))
        .map(r => r.responseValue) || [];

      const inputResponses = relevantResponses.length > 1 ? relevantResponses : [
        "Cells are just simple boxes.",
        "Angles in a triangle can be anything.",
        "History pyramids were made by magic."
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
    if (teacherDoc && responses && !insights) {
      fetchInsights(activeTopic);
    }
  }, [activeTopic, !!teacherDoc, !!responses, insights]);

  if (isUserLoading || isTeacherCheckLoading || isResponsesLoading || isAnalysesLoading || isUsersLoading) {
    return <SplashScreen message={t.teacher.synthesizing} />;
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
              Educator credentials are required to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-10 pb-12">
            <Button size="lg" className="rounded-2xl font-black h-16 px-10 shadow-xl bg-primary" onClick={() => router.push('/profile')}>
              <UserCheck className="mr-2 h-5 w-5" /> Verify in Profile
            </Button>
            <Button variant="ghost" className="font-bold text-muted-foreground" onClick={() => router.push('/learn')}>
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
              {t.teacher.dashboard}
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-foreground font-headline leading-[0.85]">
              {t.teacher.title} <span className="text-primary">{t.teacher.subtitle}</span>
            </h1>
            <p className="text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
              Synthesizing real-time classroom data into adaptive curriculum strategies.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              size="lg"
              variant="outline"
              className="h-20 px-10 text-xl font-black rounded-[2rem] border-2 border-primary/20 hover:bg-primary/5 transition-all"
              onClick={() => router.push('/learn')}
            >
              {t.teacher.returnStudent}
            </Button>
            <Button 
              size="lg"
              className="h-20 px-10 text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all active:scale-95 group" 
              onClick={() => fetchInsights(activeTopic)} 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-4 h-6 w-6" /> : <RefreshCw className="mr-4 h-6 w-6 group-hover:rotate-180 transition-transform duration-1000" />}
              {t.teacher.regenerate}
            </Button>
          </div>
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

        <Tabs defaultValue="progress" className="space-y-12">
          <div className="bg-white/50 backdrop-blur-sm p-2 rounded-[2.5rem] shadow-xl border-2 inline-flex">
            <TabsList className="bg-transparent h-auto p-0 gap-2">
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-8 font-black transition-all rounded-[1.8rem] text-muted-foreground uppercase tracking-widest text-[10px]"
              >
                <TrendingUp className="w-4 h-4 mr-2" /> {t.teacher.progress}
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-8 font-black transition-all rounded-[1.8rem] text-muted-foreground uppercase tracking-widest text-[10px]"
              >
                <BarChart3 className="w-4 h-4 mr-2" /> {t.teacher.cognitiveDistribution}
              </TabsTrigger>
              <TabsTrigger 
                value="planner" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-8 font-black transition-all rounded-[1.8rem] text-muted-foreground uppercase tracking-widest text-[10px]"
              >
                <Zap className="w-4 h-4 mr-2" /> {t.teacher.planner}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="progress" className="animate-in fade-in duration-500">
             <Card className="pro-card p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-black font-headline tracking-tighter text-foreground uppercase">{t.teacher.progress}</CardTitle>
                    <CardDescription className="text-lg font-medium">Real-time mastery tracking across all lesson modules.</CardDescription>
                  </div>
                  <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-12 rounded-2xl border-2 h-12 font-bold" placeholder="Search students..." />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 hover:bg-transparent">
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t.teacher.studentName}</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t.teacher.biology}</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t.teacher.math}</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t.teacher.history}</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t.teacher.weakAreas}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentProgress.map((student) => (
                      <TableRow key={student.id} className="group hover:bg-primary/5 transition-colors">
                        <TableCell className="font-black text-foreground">{student.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${student.bioMastery}%` }} />
                            </div>
                            <span className="text-xs font-bold">{student.bioMastery}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${student.mathMastery}%` }} />
                            </div>
                            <span className="text-xs font-bold">{student.mathMastery}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${student.histMastery}%` }} />
                            </div>
                            <span className="text-xs font-bold">{student.histMastery}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {student.weaknesses.length > 0 ? student.weaknesses.map(w => (
                              <Badge key={w} variant="destructive" className="rounded-full px-3 text-[9px] font-black uppercase">
                                {w}
                              </Badge>
                            )) : (
                              <Badge className="bg-emerald-500 text-white rounded-full px-3 text-[9px] font-black uppercase">
                                On Track
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </Card>
          </TabsContent>

          <TabsContent value="analytics" className="animate-in fade-in duration-500">
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
                    <div className="p-8">
                       <p className="text-xs font-bold text-rose-900/40 uppercase tracking-widest mb-6">Critical Interventions Needed</p>
                       <div className="space-y-4">
                         {studentProgress.filter(s => s.weaknesses.length >= 2).map(s => (
                           <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-rose-100 shadow-sm">
                             <span className="font-black text-rose-950">{s.name}</span>
                             <Badge className="bg-rose-500 text-white font-black">{s.weaknesses.length} Topics At Risk</Badge>
                           </div>
                         ))}
                         {studentProgress.filter(s => s.weaknesses.length >= 2).length === 0 && (
                           <p className="text-center italic text-muted-foreground py-4">No critical interventions required.</p>
                         )}
                       </div>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-8 space-y-12">
                   <Card className="pro-card p-10">
                      <div className="flex items-center gap-6 mb-10">
                         {['Cell Biology', 'Geometry', 'History'].map(topic => (
                           <Button 
                             key={topic}
                             variant={activeTopic === topic ? 'default' : 'outline'}
                             onClick={() => {
                               setActiveTopic(topic);
                               setInsights(null);
                             }}
                             className={`rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] border-2 ${activeTopic === topic ? 'bg-primary' : 'border-primary/20 text-muted-foreground'}`}
                           >
                             {topic}
                           </Button>
                         ))}
                      </div>

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-10">
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
                            </CardContent>
                          </Card>
                        </div>
                      ) : null}
                   </Card>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="planner" className="animate-in fade-in duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4">
                   <Card className="pro-card p-10 space-y-8 sticky top-24">
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-black font-headline tracking-tighter text-foreground uppercase">{t.teacher.planner}</CardTitle>
                        <CardDescription className="text-lg font-medium">{t.teacher.plannerDesc}</CardDescription>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Target Subject</label>
                           <Input 
                             value={plannerTopic} 
                             onChange={(e) => setPlannerTopic(e.target.value)} 
                             placeholder="e.g. Advanced Mitochondria Analysis" 
                             className="h-14 border-2 rounded-2xl font-bold px-6"
                           />
                        </div>
                        <Button 
                          onClick={handleGenerateLessonPlan}
                          disabled={plannerLoading || !plannerTopic}
                          className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group"
                        >
                          {plannerLoading ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <Zap className="mr-3 h-6 w-6 group-hover:animate-pulse" />}
                          {t.teacher.generatePlan}
                        </Button>
                      </div>
                   </Card>
                </div>

                <div className="lg:col-span-8">
                   {lessonPlan ? (
                     <div className="space-y-12 animate-in slide-in-from-right-10 duration-700">
                        <Card className="border-none bg-white shadow-2xl rounded-[3rem] overflow-hidden">
                           <div className="bg-primary/5 px-10 py-12 border-b-2 border-primary/10">
                              <Badge className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Generated Lesson Architecture</Badge>
                              <h2 className="text-5xl font-black font-headline tracking-tighter text-foreground leading-none">{lessonPlan.title}</h2>
                           </div>
                           <CardContent className="p-12 space-y-16">
                              <section className="space-y-8">
                                 <div className="flex items-center gap-4 text-primary">
                                    <div className="p-3 bg-primary/10 rounded-2xl"><Lightbulb className="w-6 h-6" /></div>
                                    <h3 className="text-2xl font-black font-headline tracking-tight uppercase">{t.teacher.objectives}</h3>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {lessonPlan.objectives.map((obj, i) => (
                                      <div key={i} className="flex gap-4 p-6 bg-secondary/30 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all">
                                         <span className="font-black text-primary/30 text-xl">{i+1}</span>
                                         <p className="font-bold text-muted-foreground leading-relaxed">{obj}</p>
                                      </div>
                                    ))}
                                 </div>
                              </section>

                              <section className="space-y-8">
                                 <div className="flex items-center gap-4 text-primary">
                                    <div className="p-3 bg-primary/10 rounded-2xl"><Clock className="w-6 h-6" /></div>
                                    <h3 className="text-2xl font-black font-headline tracking-tight uppercase">{t.teacher.activities}</h3>
                                 </div>
                                 <div className="space-y-6">
                                    {lessonPlan.activities.map((act, i) => (
                                      <div key={i} className="flex flex-col md:flex-row gap-8 p-8 bg-white border-2 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                                         <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex flex-col items-center justify-center shrink-0 border-2 border-primary/10">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{act.duration}</span>
                                            <div className="h-0.5 w-6 bg-primary/20 my-2" />
                                            <span className="font-black text-primary text-xl">STEP {i+1}</span>
                                         </div>
                                         <div className="space-y-2">
                                            <h4 className="text-xl font-black group-hover:text-primary transition-colors">{act.title}</h4>
                                            <p className="text-muted-foreground font-medium leading-relaxed">{act.description}</p>
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                              </section>

                              <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t-2 border-border/50">
                                 <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-primary">
                                       <div className="p-3 bg-primary/10 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
                                       <h3 className="text-xl font-black font-headline tracking-tight uppercase">{t.teacher.assessment}</h3>
                                    </div>
                                    <p className="p-8 bg-secondary/30 rounded-[2rem] font-bold text-muted-foreground leading-relaxed italic">
                                       "{lessonPlan.assessment}"
                                    </p>
                                 </div>
                                 <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-emerald-600">
                                       <div className="p-3 bg-emerald-500/10 rounded-2xl"><Sparkles className="w-6 h-6" /></div>
                                       <h3 className="text-xl font-black font-headline tracking-tight uppercase">{t.teacher.adaptiveTips}</h3>
                                    </div>
                                    <p className="p-8 bg-emerald-500/5 rounded-[2rem] font-bold text-emerald-700/80 leading-relaxed border-2 border-emerald-500/10">
                                       {lessonPlan.adaptiveTips}
                                    </p>
                                 </div>
                              </section>
                           </CardContent>
                           <CardFooter className="bg-secondary/30 p-10 border-t-2">
                              <Button className="h-16 px-12 rounded-2xl bg-primary text-white font-black text-lg shadow-2xl shadow-primary/30 w-full md:w-auto">
                                <FileText className="mr-3 h-6 w-6" /> {t.teacher.export}
                              </Button>
                           </CardFooter>
                        </Card>
                     </div>
                   ) : (
                     <Card className="border-4 border-dashed border-muted/50 rounded-[3rem] p-32 text-center flex flex-col items-center justify-center space-y-8 bg-white/40 min-h-[600px]">
                        <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary/30 animate-pulse">
                          <FileText className="w-12 h-12" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-3xl font-black text-muted-foreground/30 font-headline tracking-tighter uppercase">Awaiting Topic Input</p>
                          <p className="text-lg font-medium text-muted-foreground/30 max-w-sm mx-auto leading-relaxed">
                            Define a topic in the planner to generate an AI-optimized lesson architecture.
                          </p>
                        </div>
                     </Card>
                   )}
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
