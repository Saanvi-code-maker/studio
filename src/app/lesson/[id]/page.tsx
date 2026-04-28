
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
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
        console.error("AI explanation failed", error);
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
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{lesson.topic}</span>
              <span className="text-xs text-muted-foreground">Question {activeQuestionIndex + 1} of {lesson.questions.length}</span>
            </div>
            <CardTitle className="text-2xl font-headline">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4">
                <Input 
                  placeholder="Type your answer here..." 
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
                >
                  {currentQuestion.options.map((option: string) => (
                    <div key={option} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/5 cursor-pointer">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
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
                className="w-full h-12 text-lg" 
                disabled={!answer || isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Check Answer'}
              </Button>
            )}

            {isCorrect === true && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <Alert className="bg-primary/10 border-primary text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <AlertTitle className="font-bold">Excellent!</AlertTitle>
                  <AlertDescription>That is the correct answer. You're making great progress!</AlertDescription>
                </Alert>
                <Button onClick={handleNext} className="w-full h-12">
                  Continue to next
                </Button>
              </div>
            )}

            {isCorrect === false && explanation && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                <Alert variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="font-bold">Not quite right</AlertTitle>
                  <AlertDescription>Let's look at it another way.</AlertDescription>
                </Alert>
                
                <Card className="border-accent/40 bg-accent/5 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-accent-foreground">
                      <Sparkles className="w-4 h-4 text-accent" />
                      AI Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed">{explanation.text}</p>
                    {explanation.visual && (
                      <div className="p-3 bg-white/50 rounded-lg border border-dashed border-accent/30 text-xs text-muted-foreground flex items-center gap-3">
                         <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center shrink-0">
                           <Sparkles className="w-5 h-5" />
                         </div>
                         <p><em>Imagine this:</em> {explanation.visual}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Button variant="outline" onClick={resetState} className="w-full">
                  Try again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
