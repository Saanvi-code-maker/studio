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
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Sparkles, Trophy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const LESSON_DATA: Record<string, any> = {
  'biology-1': {
    title: 'The Living Cell',
    topic: 'Cell Biology',
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
  const { saveResponse, completeLesson } = useStore();
  
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState<{ text: string, visual?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = lesson.questions[activeQuestionIndex];
  const progressPercent = ((activeQuestionIndex) / lesson.questions.length) * 100;

  const handleSubmit = async (overrideAnswer?: string) => {
    const finalAnswer = overrideAnswer || answer;
    if (!finalAnswer) return;

    setIsLoading(true);
    const correct = finalAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase());
    setIsCorrect(correct);
    
    saveResponse(id, currentQuestion.id, finalAnswer, correct);

    if (!correct) {
      try {
        const result = await generateStudentExplanation({
          question: currentQuestion.text,
          studentAnswer: finalAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          context: `This is a basic ${lesson.topic} lesson for students.`,
          studentUnderstandingLevel: 'confused'
        });
        setExplanation({ text: result.explanation, visual: result.visualDescription });
      } catch (error) {
        setExplanation({ text: "It seems like there was a little misunderstanding. Let's try to look at it again!" });
      }
    } else {
      setExplanation(null);
    }
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
    <div className="min-h-screen pb-20 md:pt-20 bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex-1 max-w-[200px] ml-4">
             <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">{lesson.topic}</span>
              <span className="text-xs font-medium text-muted-foreground">Question {activeQuestionIndex + 1} of {lesson.questions.length}</span>
            </div>
            <CardTitle className="text-2xl font-headline text-foreground leading-tight">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="quiz" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
                <TabsTrigger value="quiz">Multiple Choice</TabsTrigger>
                <TabsTrigger value="text">Text Entry</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4">
                <Input 
                  placeholder="Type your answer here..." 
                  className="h-14 text-lg border-2 focus-visible:ring-primary"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isCorrect === true || isLoading}
                />
              </TabsContent>
              
              <TabsContent value="quiz" className="space-y-4">
                <RadioGroup 
                  onValueChange={(val) => {
                    setAnswer(val);
                    handleSubmit(val);
                  }} 
                  value={answer}
                  disabled={isCorrect === true || isLoading}
                  className="grid grid-cols-1 gap-3"
                >
                  {currentQuestion.options.map((option: string) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} className="sr-only" />
                      <Label 
                        htmlFor={option} 
                        className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer font-medium hover:border-primary/50 ${answer === option ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                      >
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
                className="w-full h-14 text-lg font-bold shadow-md hover:translate-y-[-2px] transition-all" 
                disabled={!answer || isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Check My Answer'}
              </Button>
            )}

            {isCorrect === true && (
              <div className="space-y-4 animate-in zoom-in-95 duration-500">
                <Alert className="bg-primary/10 border-primary border-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <AlertTitle className="text-lg font-bold text-primary">Brilliant!</AlertTitle>
                  <AlertDescription className="text-primary/80">You nailed it! Ready for the next challenge?</AlertDescription>
                </Alert>
                <Button onClick={handleNext} className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90">
                  Continue Journey
                </Button>
              </div>
            )}

            {isCorrect === false && explanation && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                <Alert variant="destructive" className="bg-destructive/5 text-destructive border-2 border-destructive/20">
                  <AlertCircle className="h-6 w-6" />
                  <AlertTitle className="font-bold">Not quite right, but don't worry!</AlertTitle>
                  <AlertDescription>Learning is a journey. Let's simplify this concept together.</AlertDescription>
                </Alert>
                
                <Card className="border-2 border-accent/30 bg-accent/5 shadow-inner">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-accent-foreground uppercase tracking-widest">
                      <Sparkles className="w-4 h-4 text-accent" />
                      AI Learning Bridge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-lg leading-relaxed text-foreground/90 font-medium">{explanation.text}</p>
                    {explanation.visual && (
                      <div className="p-4 bg-white/60 rounded-xl border-2 border-dashed border-accent/40 text-sm text-muted-foreground flex items-center gap-4">
                         <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                           <Sparkles className="w-6 h-6 text-accent" />
                         </div>
                         <p className="italic">"{explanation.visual}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Button variant="outline" onClick={resetState} className="w-full h-12 border-2 hover:bg-muted">
                  I'll Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
