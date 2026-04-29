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

/**
 * Global store for ShikshaSetu that leverages Firestore real-time data.
 * Designed to provide fresh data from the server while utilizing offline persistence
 * as a fallback only.
 */
export const useStore = () => {
  const { user } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  // useDoc handles the real-time subscription and ensures data is kept in sync
  const { data: progressData, isLoading } = useDoc<StudentProgress>(userDocRef);

  const setLanguage = async (lang: string) => {
    // Update local state for immediate UI feedback
    localStorage.setItem('shikshasetu_lang', lang);
    window.dispatchEvent(new CustomEvent('shikshasetu_lang_change', { detail: lang }));
    
    // Persist to Firestore for multi-device sync
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
      studentId: user.uid,
      lessonId,
      questionId,
      responseValue: answer,
      isCorrect,
      submittedAt: now,
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

    // Mark user record as updated
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
