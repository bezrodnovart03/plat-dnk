'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicAPI, sessionsAPI } from '@/lib/api';

interface Answer {
  questionId: string;
  answer: any;
}

export function useClientSession(slug: string, existingSessionId?: string) {
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSlug, setSessionSlug] = useState<string>(slug);

  // Загрузи sessionId из localStorage при монтировании
  useEffect(() => {
    if (existingSessionId) {
      setSessionId(existingSessionId);
      return;
    }
    const savedSessionId = localStorage.getItem(`session_${slug}`);
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, [slug, existingSessionId]);

  // Загрузи сессию, чтобы получить slug теста
  const { data: sessionData } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsAPI.getById(sessionId!),
    enabled: !!sessionId && !!existingSessionId,
  });

  // Обновляем slug из сессии
  useEffect(() => {
    if (sessionData?.test_slug) {
      setSessionSlug(sessionData.test_slug);
    }
  }, [sessionData]);

  // --- Логика получения теста ---
  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: ['public', 'test', sessionSlug],
    queryFn: () => publicAPI.getTestBySlug(sessionSlug),
    enabled: !!sessionSlug,
  });

  // --- Мутации ---
  const createSessionMutation = useMutation({
    mutationFn: ({ clientName, clientEmail, clientPhone }: { clientName: string; clientEmail?: string; clientPhone?: string }) =>
      publicAPI.createSession(slug, clientName, clientEmail, clientPhone, existingSessionId),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      localStorage.setItem(`session_${slug}`, data.session_id);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.message || 'Ошибка при создании сессии');
    },
  });

  const saveAnswerMutation = useMutation({
    mutationFn: ({ questionId, answer }: Answer) =>
      publicAPI.saveAnswer(sessionId!, questionId, answer),
    onSuccess: (_, variables) => {
      setAnswers((prev) => [
        ...prev,
        { questionId: variables.questionId, answer: variables.answer },
      ]);
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: () => publicAPI.completeSession(sessionId!),
    onSuccess: () => {
      // ← НОВОЕ: Установи флаг завершения теста
      setIsTestCompleted(true);
      console.log('✅ Test completed successfully!');
    },
  });

  // --- Функции управления (Объединенные) ---
  const startSession = async (clientName: string, clientEmail?: string, clientPhone?: string) => {
    const result = await createSessionMutation.mutateAsync({ clientName, clientEmail, clientPhone });
    return result;
  };

  const submitAnswer = async (questionId: string, answer: any) => {
    await saveAnswerMutation.mutateAsync({ questionId, answer });
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const completeSession = async () => {
    await completeSessionMutation.mutateAsync();
  };

  // --- Вычисляемые данные ---
  const questions = test?.questions || [];
  const totalQuestions = questions.length;
  const isCompleted = isTestCompleted || currentQuestionIndex >= totalQuestions; // ← ИЗМЕНИЛ
  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  return {
    test,
    testLoading,
    sessionId,
    questions,
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    totalQuestions,
    progress,
    isCompleted,
    startSession,
    submitAnswer,
    completeSession,
    error,
    isLoading:
      testLoading ||
      createSessionMutation.isPending ||
      saveAnswerMutation.isPending ||
      completeSessionMutation.isPending,
  };
}