
'use client';

import { useState, useEffect } from 'react';

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

const STORAGE_KEY = 'edusense_progress';

export const useStore = () => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      const initial: StudentProgress = {
        userId: 'student_123',
        completedLessons: [],
        lastAccessed: new Date().toISOString(),
        responses: [],
      };
      setProgress(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  const saveResponse = (lessonId: string, questionId: string, answer: string, isCorrect: boolean) => {
    if (!progress) return;
    const newResponse = {
      lessonId,
      questionId,
      answer,
      isCorrect,
      timestamp: new Date().toISOString(),
    };
    const updated = {
      ...progress,
      responses: [...progress.responses, newResponse],
      lastAccessed: new Date().toISOString(),
    };
    setProgress(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const completeLesson = (lessonId: string) => {
    if (!progress) return;
    if (progress.completedLessons.includes(lessonId)) return;
    const updated = {
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
      lastAccessed: new Date().toISOString(),
    };
    setProgress(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { progress, saveResponse, completeLesson };
};
