'use client';

import { useState, useEffect } from 'react';
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
    if (!progressRef || !user) return;

    const response = {
      lessonId,
      questionId,
      answer,
      isCorrect,
      timestamp: new Date().toISOString(),
    };

    updateDoc(progressRef, {
      responses: arrayUnion(response),
      lastAccessed: new Date().toISOString()
    }).catch(err => {
      // If doc doesn't exist, create it (should be created on signup but safety first)
      setDoc(progressRef, {
        id: user.uid,
        responses: [response],
        completedLessons: [],
        lastAccessed: new Date().toISOString()
      }, { merge: true });
    });
  };

  const completeLesson = (lessonId: string) => {
    if (!progressRef || !user) return;

    updateDoc(progressRef, {
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
