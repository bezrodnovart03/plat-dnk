// frontend/hooks/use-client-session.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { publicAPI } from '@/lib/api';

interface UseClientSessionReturn {
  sessionId: string | null;
  clientName: string | null;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  startSession: (name: string) => Promise<void>;
  submitAnswer: (questionId: string, answer: any) => Promise<void>;
  completeTest: () => Promise<void>;
}

export function useClientSession(slug: string): UseClientSessionReturn {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Восстановление сессии
  useEffect(() => {
    if (!slug) return;
    
    const storageKey = `test_session_${slug}`;
    const savedSession = sessionStorage.getItem(storageKey);
    
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        setSessionId(data.sessionId);
        setClientName(data.clientName);
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setAnswers(data.answers || {});
      } catch (e) {
        console.error('Failed to parse session:', e);
        sessionStorage.removeItem(storageKey);
      }
    }
    setIsInitialized(true);
  }, [slug]);

  const saveSession = useCallback((data: any) => {
    if (!slug) return;
    const storageKey = `test_session_${slug}`;
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [slug]);

  const startSession = async (name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await publicAPI.startClientSession(slug, name);
      
      const sessionData = {
        sessionId: response.data?.sessionId || response.sessionId,
        clientName: name,
        currentQuestionIndex: 0,
        answers: {}
      };
      
      setSessionId(sessionData.sessionId);
      setClientName(sessionData.clientName);
      saveSession(sessionData);
      
      await router.replace(`/t/${slug}/test`);
      
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setError(err.message || 'Не удалось начать тест');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answer: any) => {
    if (!sessionId) return;
    
    try {
      await publicAPI.submitAnswer(sessionId, questionId, answer);
      const newAnswers = { ...answers, [questionId]: answer };
      setAnswers(newAnswers);
      saveSession({ sessionId, clientName, currentQuestionIndex: currentQuestionIndex + 1, answers: newAnswers });
      setCurrentQuestionIndex(prev => prev + 1);
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setError(err.message || 'Ошибка при отправке ответа');
    }
  };

const completeTest = async () => {
  if (!sessionId) return;
  setIsLoading(true);
  try {
    await publicAPI.completeSession(sessionId);
    // НЕ удаляем сессию здесь! Она нужна для страницы результатов
    // sessionStorage.removeItem(`test_session_${slug}`);
    router.replace(`/t/${slug}/result`);
  } catch (err: any) {
    console.error('Failed to complete session:', err);
    setError(err.message || 'Ошибка при завершении теста');
  } finally {
    setIsLoading(false);
  }
};

  return {
    sessionId,
    clientName,
    currentQuestionIndex,
    answers,
    isLoading,
    error,
    startSession,
    submitAnswer,
    completeTest,
  };
}