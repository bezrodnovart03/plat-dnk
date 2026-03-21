'use client';

import { useClientSession } from '@/hooks/use-client-session';
import { QuestionDisplay } from '@/components/client/question-display';
import { ProgressBar } from '@/components/client/progress-bar';
import { CompletionScreen } from '@/components/client/completion-screen';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  
  // Извлечение slug
  let slug = '';
  if (typeof params.slug === 'string') {
    slug = params.slug;
  } else if (Array.isArray(params.slug) && params.slug.length > 0) {
    slug = params.slug[0];
  }
  
  try {
    slug = decodeURIComponent(slug);
  } catch (e) {
    // Игнорируем ошибки декодирования
  }

  const { 
    sessionId, 
    currentQuestionIndex, 
    submitAnswer, 
    completeSession, 
    isLoading, 
    error,
    questions,
    currentQuestion,
    totalQuestions,
    isCompleted,
  } = useClientSession(slug);

  // ← НОВОЕ: Ждём пока компонент смонтировался и sessionId загрузился
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Проверяем сессию только после монтирования
    if (!isMounted || !slug) return;
    
    if (!sessionId) {
      console.log('⚠️ No session found, redirecting to start');
      router.replace(`/t/${slug}`);
      return;
    }
  }, [sessionId, slug, router, isMounted]);

  // ← НОВОЕ: Логирование состояния теста
  useEffect(() => {
    console.log('📊 Test state:', {
      currentQuestionIndex,
      totalQuestions,
      isCompleted,
      isLastQuestion: currentQuestionIndex >= totalQuestions - 1,
    });
  }, [currentQuestionIndex, totalQuestions, isCompleted]);

  // ← ИСПРАВИЛ: Если тест завершён, показываем экран спасибо
  if (!isMounted || isLoading || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // ← НОВОЕ: Если тест завершён, показываем CompletionScreen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <CompletionScreen />
        </div>
      </div>
    );
  }

  // ← НОВОЕ: Проверяем что текущий вопрос существует
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Вопрос не найден</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

  const handleAnswer = async (answer: any) => {
    await submitAnswer(currentQuestion.id, answer);
    if (isLastQuestion) {
      setTimeout(() => completeSession(), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} className="mb-8" />
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
            onAnswer={handleAnswer}
            disabled={isLoading}
          />
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}