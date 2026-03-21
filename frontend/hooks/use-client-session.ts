'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api';

interface Answer {
  questionId: string;
  answer: any;
}

export function useClientSession(slug: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isTestCompleted, setIsTestCompleted] = useState(false); // ← НОВОЕ

  // ← НОВОЕ: Загрузи sessionId из localStorage при монтировании
  useEffect(() => {
    const savedSessionId = localStorage.getItem(`session_${slug}`);
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, [slug]);

  // --- Логика получения теста (из новой ветки) ---
  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: ['public', 'test', slug],
    queryFn: () => publicAPI.getTestBySlug(slug),
    enabled: !!slug,
  });

  // --- Мутации (из новой ветки) ---
  const createSessionMutation = useMutation({
    mutationFn: ({ clientName, clientEmail }: { clientName: string; clientEmail?: string }) =>
      publicAPI.createSession(slug, clientName, clientEmail),
    onSuccess: (data) => {
      setSessionId(data.data.session_id);
      // ← НОВОЕ: Сохрани sessionId в localStorage
      localStorage.setItem(`session_${slug}`, data.data.session_id);
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
  const startSession = async (clientName: string, clientEmail?: string) => {
    const result = await createSessionMutation.mutateAsync({ clientName, clientEmail });
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
  const questions = test?.data?.questions || [];
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
    isLoading:
      testLoading ||
      createSessionMutation.isPending ||
      saveAnswerMutation.isPending ||
      completeSessionMutation.isPending,
  };
}