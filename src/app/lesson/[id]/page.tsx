
'use client';

import { useState, use } from 'react';
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
import { AlertCircle, ArrowLeft, Loader2, Sparkles, Trophy, BookOpen, Lightbulb } from 'lucide-react';
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
  const lesson = LESSON_DATA[id] || LESSON_DATA['biology-1'];
  const { saveResponseWithAnalysis, completeLesson } = useStore();
  
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState<{ text: string, story: string, visual: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
        analysisResult = { explanation: result.explanation, story: result.story, visual: result.visualDescription };
        setExplanation(analysisResult);
      } catch (error) {
        analysisResult = { explanation: "Let's review this concept together.", story: "Think of it as a missing piece in a puzzle.", visual: "" };
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
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-primary hover:bg-primary/5">
            <ArrowLeft className="mr-2 h-5 w-5" /> Dashboard
          </Button>
          <div className="flex-1 max-w-sm ml-8 space-y-2">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               <span>Lesson Progress</span>
               <span>{Math.round(progressPercent)}%</span>
             </div>
             <Progress value={progressPercent} className="h-2 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <Card className="pro-card shadow-xl overflow-hidden">
              <CardHeader className="p-8 border-b bg-secondary/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{lesson.topic}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question {activeQuestionIndex + 1}/{lesson.questions.length}</span>
                </div>
                <CardTitle className="text-3xl font-black font-headline tracking-tighter leading-tight">{currentQuestion.text}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <Tabs defaultValue="quiz" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-2xl">
                    <TabsTrigger value="quiz" className="rounded-xl font-bold">Quiz</TabsTrigger>
                    <TabsTrigger value="text" className="rounded-xl font-bold">Write</TabsTrigger>
                    <TabsTrigger value="voice" className="rounded-xl font-bold">Talk</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <Input 
                      placeholder="Enter your thoughts..." 
                      className="h-16 text-lg border-2 focus-visible:ring-primary rounded-2xl px-6"
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
                            className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer text-lg font-bold hover:shadow-md ${answer === option ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card'}`}
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
                    className="w-full h-16 text-xl font-black rounded-2xl shadow-lg bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]" 
                    disabled={!answer || isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Confirm Answer'}
                  </Button>
                )}

                {isCorrect === true && (
                  <div className="space-y-4 animate-in zoom-in-95 duration-500">
                    <Alert className="bg-emerald-50 border-emerald-500/20 border-2 py-6 rounded-[2rem]">
                      <Trophy className="h-8 w-8 text-emerald-600" />
                      <AlertTitle className="text-2xl font-black text-emerald-700 tracking-tight">Exceptional Work!</AlertTitle>
                      <AlertDescription className="text-emerald-600/80 text-lg font-medium">You've mastered this concept. Let's move to the next level.</AlertDescription>
                    </Alert>
                    <Button onClick={handleNext} className="w-full h-16 text-xl font-black bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-600/20">
                      Continue Learning Path
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {isCorrect === false && explanation && (
              <div className="space-y-6 animate-in slide-in-from-right-12 duration-1000">
                <Card className="border-none bg-primary shadow-[0_40px_80px_-20px_rgba(59,130,246,0.4)] rounded-[3rem] overflow-hidden text-white">
                  <div className="p-10 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black font-headline tracking-tighter">Learning Bridge</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-xl font-medium leading-relaxed text-white/90">
                        {explanation.text}
                      </p>
                      
                      <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <BookOpen className="w-16 h-16" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-4">Conceptual Story</h4>
                        <p className="text-lg font-bold leading-relaxed italic relative z-10">
                          "{explanation.story}"
                        </p>
                      </div>

                      {placeholder && (
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-white/20 shadow-2xl">
                          <Image 
                            src={placeholder.imageUrl} 
                            alt={placeholder.description}
                            fill
                            className="object-cover"
                            data-ai-hint={placeholder.imageHint}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <p className="text-xs font-bold text-white/80 italic">Visualizing: {explanation.visual}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" onClick={resetState} className="w-full h-14 rounded-2xl border-2 border-white/20 bg-white/10 hover:bg-white text-white hover:text-primary font-black text-lg transition-all">
                      I'll try again
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {isCorrect === null && !isLoading && (
              <Card className="border-2 border-dashed border-muted rounded-[3rem] p-12 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-muted/30 rounded-[2rem] flex items-center justify-center text-muted-foreground">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-muted-foreground/50 tracking-tight">AI Assistant is ready</p>
                  <p className="text-sm font-medium text-muted-foreground/40">Submit your answer for instant bridge building.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
