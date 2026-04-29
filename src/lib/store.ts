'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';

export interface StudentProgress {
  userId: string;
  completedLessons: string[];
  lastAccessed: any;
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

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: progressData, isLoading } = useDoc(userDocRef);

  const saveResponse = (lessonId: string, questionId: string, answer: string, isCorrect: boolean) => {
    if (!db || !user || !userDocRef) return;
    
    const responseId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const responseData = {
      lessonId,
      questionId,
      answer,
      isCorrect,
      timestamp: now,
    };

    // 1. Update user profile for student view
    updateDoc(userDocRef, {
      responses: arrayUnion(responseData),
      updatedAt: serverTimestamp()
    }).catch(err => {
      // Initialize if doesn't exist (failsafe)
      setDoc(userDocRef, {
        id: user.uid,
        email: user.email,
        responses: [responseData],
        completedLessons: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    // 2. Save to top-level studentResponses for teacher visibility
    const studentResponseRef = doc(db, 'studentResponses', responseId);
    setDoc(studentResponseRef, {
      id: responseId,
      studentId: user.uid,
      lessonId,
      questionId,
      responseValue: answer,
      isCorrect,
      submittedAt: now
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
    saveResponse, 
    completeLesson 
  };
};