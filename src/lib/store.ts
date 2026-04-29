
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface StudentProgress {
  id: string;
  displayName: string;
  email: string;
  role: 'student' | 'teacher';
  completedLessons: string[];
  languagePreference: string;
  createdAt: string;
  updatedAt: string;
}

export const useStore = () => {
  const { user } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: progressData, isLoading } = useDoc<StudentProgress>(userDocRef);

  const saveResponseWithAnalysis = (
    lessonId: string, 
    questionId: string, 
    answer: string, 
    isCorrect: boolean,
    analysis?: { 
      explanation: string, 
      story: string, 
      visual: string,
      analysisType?: string,
      analysisExplanation?: string
    }
  ) => {
    if (!db || !user || !userDocRef) return;
    
    const responseId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const responseData = {
      id: responseId,
      lessonId,
      questionId,
      responseValue: answer,
      isCorrect,
      submittedAt: now,
      studentId: user.uid,
    };

    // 1. Save to top-level studentResponses
    setDoc(doc(db, 'studentResponses', responseId), responseData);

    // 2. If analysis exists, save it to aiAnalyses
    if (analysis) {
      const analysisId = crypto.randomUUID();
      // Crucial: Denormalize studentId for security rules as per backend.json
      setDoc(doc(db, 'aiAnalyses', analysisId), {
        id: analysisId,
        studentResponseId: responseId,
        studentId: user.uid, 
        analysisResultType: analysis.analysisType || (isCorrect ? 'correct' : 'incorrect'),
        explanationText: analysis.explanation,
        storyText: analysis.story,
        visualDescription: analysis.visual,
        teacherFeedback: analysis.analysisExplanation || '',
        generatedAt: now
      });
    }

    // 3. Update user profile last updated timestamp
    updateDoc(userDocRef, {
      updatedAt: serverTimestamp()
    });
  };

  const completeLesson = (lessonId: string) => {
    if (!db || !user || !userDocRef) return;

    updateDoc(userDocRef, {
      completedLessons: arrayUnion(lessonId),
      updatedAt: serverTimestamp()
    });
  };

  return { 
    progress: progressData, 
    isLoading,
    saveResponseWithAnalysis, 
    completeLesson 
  };
};
