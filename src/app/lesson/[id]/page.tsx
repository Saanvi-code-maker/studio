'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { VoiceInterface } from '@/components/VoiceInterface';
import { generateStudentExplanation } from '@/ai/flows/generate-student-explanation';
import { useUser } from '@/firebase';
import { 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const LESSON_DATA: Record<string, any> = {
  'biology-1': {
    title: 'The Living Cell',
    topic: 'Cell Biology',
    imageKey: 'cell-analogy',
    questions: [
      {
        id: 'q1',
        text: 'What is the "powerhouse of the cell" that produces energy?',
        correctAnswer: 'Mitochondria',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Vacuole']
      }
    ]
  },
  'math-1': {
    title: 'Geometry Foundations',
    topic: 'Geometry',
    imageKey: 'geometry-analogy',
    questions: [
      {
        id: 'q1',
        text: 'What is the sum of angles in a triangle?',
        correctAnswer: '180 degrees',
        options: ['90 degrees', '180 degrees', '360 degrees', '270 degrees']
      }
    ]
  },
  'history-1': {
    title: 'Ancient Civilizations',
    topic: 'History',
    imageKey: 'history-analogy',
    questions: [
      {
        id: 'q1',
        text: 'Which civilization built the Pyramids of Giza?',
        correctAnswer: 'Egyptians',
        options: ['Romans', 'Greeks', 'Egyptians', 'Mayans']
      }
    ]
  }
};

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const lesson = LESSON_DATA[id] || LESSON_DATA['biology-1'];
  const { saveResponseWithAnalysis, completeLesson } = useStore();
  
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState<{ text: string, story: string, visual: string } | null>(null);
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
  const placeholder = PlaceHolderImages.find(img => img.id === lesson.imageKey);

  const handleSubmit = async (overrideAnswer?: string) => {
    const finalAnswer = overrideAnswer || answer;
    if (!finalAnswer || isCorrect !== null) return;

    setIsLoading(true);
    const correct = finalAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase());
    
    let analysisResult;
    if (!correct) {
      try {
        const result = await generateStudentExplanation({
          question: currentQuestion.text,
          studentAnswer: finalAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          context: `Topic: ${lesson.topic}. ${lesson.title}.`
        });
        analysisResult = { 
          explanation: result.explanation, 
          story: result.story, 
          visual: result.visualDescription 
        };
        setExplanation(analysisResult);
      } catch (error) {
        analysisResult = { 
          explanation: "Let's review this concept together. It seems there's a small misunderstanding.", 
          story: "Think of it like a puzzle where one piece is just slightly turned the wrong way.", 
          visual: "A puzzle piece fitting perfectly into place." 
        };
        setExplanation(analysisResult);
      }
    } else {
      setExplanation(null);
    }

    saveResponseWithAnalysis(id, currentQuestion.id, finalAnswer, correct, analysisResult);
    setIsCorrect(correct);
    setIsLoading(false);
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

  return (
    <div className="min-h-screen pb-24 md:pt-24 bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-primary hover:bg-primary/5 rounded-2xl">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Journey
          </Button>
          <div className="flex-1 max-w-md space-y-2">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               <span>Module Progress</span>
               <span>{Math.round(progressPercent)}%</span>
             </div>
             <Progress value={progressPercent} className="h-3 rounded-full bg-primary/10" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <Card className="pro-card shadow-xl overflow-hidden">
              <CardHeader className="p-8 border-b bg-secondary/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{lesson.topic}</span>
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-2 uppercase tracking-widest">
                    Step {activeQuestionIndex + 1} of {lesson.questions.length}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-black font-headline tracking-tighter leading-tight">{currentQuestion.text}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <Tabs defaultValue="quiz" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-2xl h-12">
                    <TabsTrigger value="quiz" className="rounded-xl font-bold">Multiple Choice</TabsTrigger>
                    <TabsTrigger value="text" className="rounded-xl font-bold">Written</TabsTrigger>
                    <TabsTrigger value="voice" className="rounded-xl font-bold">Voice</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <Input 
                      placeholder="Type your explanation here..." 
                      className="h-20 text-lg border-2 focus-visible:ring-primary rounded-2xl px-6"
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
                            className={`flex items-center p-6 rounded-2xl border-2 transition-all cursor-pointer text-lg font-bold hover:shadow-md ${answer === option ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card'}`}
                          >
                            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-xs ${answer === option ? 'bg-primary text-white border-primary' : 'border-border'}`}>
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
                    className="w-full h-16 text-xl font-black rounded-2xl shadow-lg bg-primary hover:bg-primary/90 transition-all hover:scale-[1.01]" 
                    disabled={!answer || isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Confirm Understanding'}
                  </Button>
                )}

                {isCorrect === true && (
                  <div className="space-y-4 animate-in zoom-in-95 duration-500">
                    <Alert className="bg-emerald-50 border-emerald-500/20 border-2 py-8 rounded-[2.5rem] relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                         <Trophy className="w-24 h-24 text-emerald-600" />
                       </div>
                      <Trophy className="h-10 w-10 text-emerald-600 mb-2" />
                      <AlertTitle className="text-3xl font-black text-emerald-700 tracking-tight">Exceptional Mastery!</AlertTitle>
                      <AlertDescription className="text-emerald-600/80 text-lg font-medium">You've clearly bridged the gap on this concept. Ready for the next challenge?</AlertDescription>
                    </Alert>
                    <Button onClick={handleNext} className="w-full h-16 text-xl font-black bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                      Continue Path
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {isCorrect === false && explanation && (
              <div className="space-y-6 animate-in slide-in-from-right-12 duration-700">
                <Card className="border-none bg-primary shadow-[0_40px_100px_-20px_rgba(59,130,246,0.5)] rounded-[3rem] overflow-hidden text-white relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  <div className="p-10 space-y-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black font-headline tracking-tighter">Learning Bridge</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-xl font-medium leading-relaxed text-white/90">
                        {explanation.text}
                      </p>
                      
                      <div className="bg-white/10 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <BookOpen className="w-16 h-16" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4">Conceptual Story</h4>
                        <p className="text-xl font-bold leading-relaxed italic relative z-10">
                          "{explanation.story}"
                        </p>
                      </div>

                      {placeholder && (
                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-white/20 shadow-2xl group">
                          <Image 
                            src={placeholder.imageUrl} 
                            alt={placeholder.description}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                            data-ai-hint={placeholder.imageHint}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Visual Concept</p>
                            <p className="text-xs font-bold text-white/80 italic">{explanation.visual}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" onClick={resetState} className="w-full h-14 rounded-2xl border-2 border-white/20 bg-white/10 hover:bg-white text-white hover:text-primary font-black text-lg transition-all active:scale-95">
                      <RotateCcw className="mr-2 h-5 w-5" /> Refine my Answer
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {isCorrect === null && !isLoading && (
              <Card className="border-4 border-dashed border-muted/50 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center space-y-6 bg-white/40">
                <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary/30 animate-pulse">
                  <Sparkles className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <p className="text-3xl font-black text-muted-foreground/30 font-headline tracking-tighter">AI Assistant Waiting</p>
                  <p className="text-sm font-medium text-muted-foreground/30 max-w-[200px] mx-auto leading-relaxed">
                    Submit your thoughts for an instant, personalized learning bridge.
                  </p>
                </div>
              </Card>
            )}
            
            {isLoading && (
              <Card className="border-none bg-secondary/30 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center space-y-8 animate-pulse">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="space-y-2">
                  <p className="text-2xl font-black text-primary/40 font-headline tracking-tighter">Building Knowledge Bridge</p>
                  <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Gemini is analyzing your path...</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}