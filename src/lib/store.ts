'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

export interface StudentProgress {
  userId: string;
  completedLessons: string[];
  lastAccessed: string;
  responses: {
    lessonId: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timestamp: string;
  }[];
}

export const useStore = () => {
  const { user } = useUser();
  const db = useFirestore();

  const progressRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: progressData, isLoading } = useDoc(progressRef);

  const saveResponse = (lessonId: string, questionId: string, answer: string, isCorrect: boolean) => {
    if (!db || !user) return;
    
    const docRef = doc(db, 'users', user.uid);
    const responseId = crypto.randomUUID();
    
    const response = {
      lessonId,
      questionId,
      answer,
      isCorrect,
      timestamp: new Date().toISOString(),
    };

    // 1. Update user profile
    updateDoc(docRef, {
      responses: arrayUnion(response),
      lastAccessed: new Date().toISOString()
    }).catch(err => {
      // If doc doesn't exist, create it
      setDoc(docRef, {
        id: user.uid,
        responses: [response],
        completedLessons: [],
        lastAccessed: new Date().toISOString()
      }, { merge: true });
    });

    // 2. Also save to top-level studentResponses for teacher visibility
    const studentResponseRef = doc(db, 'studentResponses', responseId);
    setDoc(studentResponseRef, {
      id: responseId,
      studentId: user.uid,
      lessonId,
      questionId,
      responseValue: answer,
      isCorrect,
      submittedAt: new Date().toISOString()
    });
  };

  const completeLesson = (lessonId: string) => {
    if (!db || !user) return;
    const docRef = doc(db, 'users', user.uid);

    updateDoc(docRef, {
      completedLessons: arrayUnion(lessonId),
      lastAccessed: new Date().toISOString()
    });
  };

  return { 
    progress: progressData, 
    isLoading,
    saveResponse, 
    completeLesson 
  };
};
