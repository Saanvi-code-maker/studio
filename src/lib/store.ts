'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  const setLanguage = async (lang: string) => {
    if (userDocRef) {
      updateDoc(userDocRef, {
        languagePreference: lang,
        updatedAt: serverTimestamp()
      }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: { languagePreference: lang }
        }));
      });
    }
    localStorage.setItem('shikshasetu_lang', lang);
  };

  const saveResponseWithAnalysis = (
    lessonId: string, 
    questionId: string, 
    answer: string, 
    isCorrect: boolean,
    analysis?: { 
      explanation: string, 
      story: string, 
      visual: string,
      imageUrl?: string,
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

    const responseRef = doc(db, 'studentResponses', responseId);
    setDoc(responseRef, responseData).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: responseRef.path,
        operation: 'create',
        requestResourceData: responseData
      }));
    });

    if (analysis) {
      const analysisId = crypto.randomUUID();
      const analysisData = {
        id: analysisId,
        studentResponseId: responseId,
        studentId: user.uid, 
        analysisResultType: analysis.analysisType || (isCorrect ? 'correct' : 'incorrect'),
        explanationText: analysis.explanation,
        storyText: analysis.story,
        visualDescription: analysis.visual,
        imageUrl: analysis.imageUrl || '',
        generatedAt: now
      };
      const analysisRef = doc(db, 'aiAnalyses', analysisId);
      setDoc(analysisRef, analysisData).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: analysisRef.path,
          operation: 'create',
          requestResourceData: analysisData
        }));
      });
    }

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
    setLanguage,
    saveResponseWithAnalysis, 
    completeLesson 
  };
};