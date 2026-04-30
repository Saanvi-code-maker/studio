'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { VoiceInterface } from '@/components/VoiceInterface';
import { generateStudentExplanation } from '@/ai/flows/generate-student-explanation';
import { analyzeStudentAnswer } from '@/ai/flows/analyze-student-answer';
import { useUser } from '@/firebase';
import { 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Lightbulb,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Brain,
  Send,
  Zap,
  Map
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { t } = useTranslation();
  
  const lesson = (t.content[id as keyof typeof t.content] || t.content['biology-1']) as any;
  const { saveResponseWithAnalysis, completeLesson } = useStore();
  
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState<{ 
    text: string, 
    story: string, 
    visual: string,
    mindmap: string[],
    imageUrl?: string,
    analysisType?: string,
    analysisExplanation?: string 
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const currentQuestion = lesson.questions[activeQuestionIndex];
  const progressPercent = ((activeQuestionIndex) / lesson.questions.length) * 100;

  const handleSubmit = async (overrideAnswer?: string) => {
    const finalAnswer = overrideAnswer || answer;
    if (!finalAnswer || isCorrect !== null) return;

    setIsLoading(true);
    
    try {
      const typeResult = await analyzeStudentAnswer({
        question: currentQuestion.text,
        studentAnswer: finalAnswer,
        correctAnswer: currentQuestion.correctAnswer,
      });

      const correct = typeResult.isCorrect;
      let analysisResult = null;

      if (!correct) {
        const bridgeResult = await generateStudentExplanation({
          question: currentQuestion.text,
          studentAnswer: finalAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          context: `Topic: ${lesson.topic}. ${lesson.title}.`
        });

        // Use high-fidelity seed for dynamic illustrations
        const seedId = `${id}-${activeQuestionIndex}`;

        analysisResult = { 
          explanation: bridgeResult.explanation, 
          story: bridgeResult.story, 
          visual: bridgeResult.visualDescription,
          mindmap: bridgeResult.mindmap,
          imageUrl: `https://picsum.photos/seed/${seedId}/800/600`,
          analysisType: typeResult.analysisType,
          analysisExplanation: typeResult.explanation
        };
        setExplanation(analysisResult);
      }

      saveResponseWithAnalysis(id, currentQuestion.id, finalAnswer, correct, analysisResult);
      setIsCorrect(correct);
    } catch (error) {
      console.error("AI Analysis failed", error);
      // Fallback simple check
      setIsCorrect(finalAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase()));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (activeQuestionIndex < lesson.questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
      resetState();
    } else {
      completeLesson(id);
      router.push('/learn');
    }
  };

  const resetState = () => {
    setAnswer('');
    setExplanation(null);
    setIsCorrect(null);
  };

  const getAnalysisBadge = (type?: string) => {
    switch(type) {
      case 'guessing': return { label: 'Intuitive Guess', icon: HelpCircle, color: 'bg-amber-100 text-amber-700' };
      case 'partial_understanding': return { label: 'Getting There', icon: Brain, color: 'bg-blue-100 text-blue-700' };
      case 'confused': return { label: 'New Concept', icon: AlertCircle, color: 'bg-rose-100 text-rose-700' };
      default: return { label: 'Learning Opportunity', icon: Sparkles, color: 'bg-primary/10 text-primary' };
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pt-24 bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-primary hover:bg-primary/5 rounded-2xl">
            <ArrowLeft className="mr-2 h-5 w-5" /> {t.common.back}
          </Button>
          <div className="flex-1 max-w-md space-y-2">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               <span>{t.lesson.progress}</span>
               <span>{Math.round(progressPercent)}%</span>
             </div>
             <Progress value={progressPercent} className="h-3 rounded-full bg-primary/10" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-6">
            <Card className="pro-card shadow-xl overflow-hidden border-2">
              <CardHeader className="p-8 border-b bg-secondary/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{lesson.topic}</span>
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-2 uppercase tracking-widest px-3 py-1">
                    {t.lesson.question} {activeQuestionIndex + 1}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-black font-headline tracking-tighter leading-tight text-foreground">{currentQuestion.text}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <Tabs defaultValue="quiz" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-2xl h-12">
                    <TabsTrigger value="quiz" className="rounded-xl font-bold">{t.lesson.options}</TabsTrigger>
                    <TabsTrigger value="text" className="rounded-xl font-bold">{t.lesson.write}</TabsTrigger>
                    <TabsTrigger value="voice" className="rounded-xl font-bold">{t.lesson.speak}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <Textarea 
                      placeholder={t.lesson.write + "..."} 
                      className="min-h-[160px] text-lg border-2 focus-visible:ring-primary rounded-2xl px-6 py-4 resize-none"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={isCorrect !== null || isLoading}
                    />
                  </TabsContent>
                  
                  <TabsContent value="quiz" className="space-y-4">
                    <RadioGroup 
                      onValueChange={(val) => {
                        setAnswer(val);
                        handleSubmit(val);
                      }} 
                      value={answer}
                      disabled={isCorrect !== null || isLoading}
                      className="grid grid-cols-1 gap-4"
                    >
                      {currentQuestion.options.map((option: string) => (
                        <div key={option} className="relative">
                          <RadioGroupItem value={option} id={option} className="sr-only" />
                          <Label 
                            htmlFor={option} 
                            className={`flex items-center p-6 rounded-2xl border-2 transition-all cursor-pointer text-lg font-bold hover:shadow-md ${answer === option ? 'border-primary bg-primary/5 text-primary shadow-inner' : 'border-border bg-card'}`}
                          >
                            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-xs font-black ${answer === option ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}>
                              {String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                            </span>
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </TabsContent>
                  
                  <TabsContent value="voice">
                    <VoiceInterface onResult={(text) => {
                      setAnswer(text);
                      handleSubmit(text);
                    }} />
                  </TabsContent>
                </Tabs>

                {isCorrect === null && (
                  <Button 
                    onClick={() => handleSubmit()} 
                    className="w-full h-16 text-xl font-black rounded-2xl shadow-lg bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] group" 
                    disabled={!answer || isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                      <>
                        {t.lesson.confirm} <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                )}

                {isCorrect === true && (
                  <div className="space-y-4 animate-in zoom-in-95 duration-500">
                    <Alert className="bg-emerald-50 border-emerald-500/20 border-2 py-10 rounded-[2.5rem] relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                         <Trophy className="w-32 h-32 text-emerald-600" />
                       </div>
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-500/20">
                          <Trophy className="h-8 w-8" />
                        </div>
                        <AlertTitle className="text-4xl font-black text-emerald-800 tracking-tighter">{t.lesson.perfect}</AlertTitle>
                        <AlertDescription className="text-emerald-700/80 text-lg font-medium max-w-sm">
                          {t.lesson.perfectDesc}
                        </AlertDescription>
                      </div>
                    </Alert>
                    <Button onClick={handleNext} className="w-full h-16 text-xl font-black bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                      {t.lesson.continue}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-8">
            {isCorrect === false && explanation && (
              <div className="space-y-6 animate-in slide-in-from-right-12 duration-700">
                <Card className="border-none bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
                    <Sparkles className="w-48 h-48" />
                  </div>
                  
                  <div className="p-10 space-y-10 relative z-10">
                    <header className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                          <Lightbulb className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black font-headline tracking-tighter text-foreground">{t.lesson.bridge}</h3>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">AI Learning Support</p>
                        </div>
                      </div>
                      <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getAnalysisBadge(explanation.analysisType).color}`}>
                        {getAnalysisBadge(explanation.analysisType).label}
                      </Badge>
                    </header>
                    
                    <div className="grid grid-cols-1 gap-8">
                      <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 relative group hover:bg-white hover:border-primary transition-all duration-500">
                        <div className="absolute -top-4 left-8 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <BookOpen className="w-3 h-3" /> {t.lesson.conceptualStory}
                        </div>
                        <p className="text-xl font-bold leading-relaxed text-foreground italic">
                          "{explanation.story}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-2 border-border shadow-2xl group">
                          <Image 
                            src={explanation.imageUrl || `https://picsum.photos/seed/${id}/800/600`} 
                            alt={explanation.visual}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                            data-ai-hint="academic illustration"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{t.lesson.visualConcept}</p>
                            <p className="text-xs font-bold text-white/80 italic">{explanation.visual}</p>
                          </div>
                        </div>

                        <div className="bg-secondary/30 p-8 rounded-[2.5rem] border-2 border-dashed border-border space-y-6 flex flex-col justify-center">
                          <div className="flex items-center gap-3 text-primary">
                            <Map className="w-5 h-5" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Mindmap Points</h4>
                          </div>
                          <div className="space-y-4">
                            {explanation.mindmap?.map((point, i) => (
                              <div key={i} className="flex items-start gap-3 bg-white/50 p-3 rounded-xl border border-white/50">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                                <span className="text-xs font-bold text-muted-foreground leading-tight">{point}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm font-bold text-muted-foreground leading-relaxed pt-4 border-t border-border">
                            {explanation.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button onClick={resetState} className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                      <RotateCcw className="mr-3 h-5 w-5" /> {t.lesson.refine}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {isCorrect === null && !isLoading && (
              <Card className="border-4 border-dashed border-muted/50 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center space-y-6 bg-white/40 min-h-[500px]">
                <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary/30 animate-pulse">
                  <Zap className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <p className="text-3xl font-black text-muted-foreground/30 font-headline tracking-tighter uppercase">{t.lesson.awaiting}</p>
                  <p className="text-sm font-medium text-muted-foreground/30 max-w-[240px] mx-auto leading-relaxed">
                    {t.lesson.awaitingDesc}
                  </p>
                </div>
              </Card>
            )}
            
            {isLoading && (
              <Card className="border-none bg-secondary/30 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center space-y-8 animate-pulse min-h-[500px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-2xl font-black text-primary/60 font-headline tracking-tighter uppercase">{t.lesson.building}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] max-w-[200px] mx-auto">{t.lesson.analyzing}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
