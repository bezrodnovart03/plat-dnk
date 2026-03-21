// frontend/app/t/[slug]/test/page.tsx
'use client';

import { useClientSession } from '@/hooks/use-client-session';
import { QuestionDisplay } from '@/components/client/question-display';
import { ProgressBar } from '@/components/client/progress-bar';
import { CompletionScreen } from '@/components/client/completion-screen';
import { publicAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '@/types';

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  
  // ИСПРАВЛЕНИЕ: корректное извлечение slug
  let slug = '';
  if (typeof params.slug === 'string') {
    slug = params.slug;
  } else if (Array.isArray(params.slug) && params.slug.length > 0) {
    slug = params.slug[0];
  }
  
  // Декодируем slug на случай URL-encoding
  try {
    slug = decodeURIComponent(slug);
  } catch (e) {
    // Игнорируем ошибки декодирования
  }

  const { sessionId, currentQuestionIndex, submitAnswer, completeTest, isLoading, error } = useClientSession(slug);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ждем пока slug загрузится
    if (!slug) return;
    
    setIsLoaded(true);
  }, [slug]);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Проверяем сессию
    if (!sessionId) {
      console.log('⚠️ No session found, redirecting to start');
      router.replace(`/t/${slug}`);
      return;
    }

    async function loadQuestions() {
      try {
        console.log('📥 Loading questions for slug:', slug);
        const data = await publicAPI.getTestQuestions(slug);
        const questionsList = data.data?.questions || data.questions || [];
        console.log('✅ Questions loaded:', questionsList.length);
        setQuestions(questionsList);
      } catch (err) {
        console.error('❌ Error loading questions:', err);
      }
    }

    loadQuestions();
  }, [sessionId, slug, router, isLoaded]);

  useEffect(() => {
    if (questions.length > 0) {
      setCurrentQuestion(questions[currentQuestionIndex] || null);
    }
  }, [questions, currentQuestionIndex]);

  if (!isLoaded || !sessionId || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  const handleAnswer = async (answer: any) => {
    await submitAnswer(currentQuestion.id, answer);
    if (isLastQuestion) {
      setTimeout(() => completeTest(), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} className="mb-8" />
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            disabled={isLoading}
          />
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {isLastQuestion && <CompletionScreen onComplete={completeTest} isLoading={isLoading} />}
      </div>
    </div>
  );
}