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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00e600]/5 via-white to-[#00e600]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e600] mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // ← НОВОЕ: Если тест завершён, показываем CompletionScreen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00e600]/5 via-white to-[#00e600]/10 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4">
          <div className="max-w-screen-2xl mx-auto flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00e600] to-[#00cc00] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">П</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">ПрофДНК</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-12 md:py-20 flex items-center justify-center">
          <CompletionScreen />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200/50 py-6 px-8 text-center text-sm text-gray-500">
          <div className="max-w-screen-2xl mx-auto">
            © {new Date().getFullYear()} ПрофДНК — платформа для профориентологов
          </div>
        </footer>
      </div>
    );
  }

  // ← НОВОЕ: Проверяем что текущий вопрос существует
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
    <div className="min-h-screen bg-gradient-to-br from-[#00e600]/5 via-white to-[#00e600]/10 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00e600] to-[#00cc00] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">П</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">ПрофДНК</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-12 md:py-16">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 md:p-12 shadow-sm hover:shadow-md transition-all duration-200">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
            onAnswer={handleAnswer}
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {error}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200/50 py-6 px-8 text-center text-sm text-gray-500">
        <div className="max-w-screen-2xl mx-auto">
          © {new Date().getFullYear()} ПрофДНК — платформа для профориентологов
        </div>
      </footer>
    </div>
  );
}