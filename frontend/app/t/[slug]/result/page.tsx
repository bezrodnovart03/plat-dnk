// frontend/app/t/[slug]/result/page.tsx
'use client';

import { reportsAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClientReport } from '@/types';

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];
  
  const [report, setReport] = useState<ClientReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      // Получаем sessionId из sessionStorage
      const storageKey = `test_session_${slug}`;
      const savedSession = sessionStorage.getItem(storageKey);
      
      if (!savedSession) {
        // Если сессии нет, идём на thanks (тест уже завершён)
        router.replace(`/t/${slug}/thanks`);
        return;
      }
      
      try {
        const session = JSON.parse(savedSession);
        const data = await reportsAPI.getClientReport(session.sessionId);
        setReport(data.data || data);
      } catch (err) {
        console.error('Ошибка загрузки отчёта:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const handleContinue = () => {
    // Очищаем сессию только при переходе на thanks
    const storageKey = `test_session_${slug}`;
    sessionStorage.removeItem(storageKey);
    router.push(`/t/${slug}/thanks`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Результаты теста</h1>
        
        {report ? (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 rounded-xl">
              <p className="text-sm text-gray-600">Название теста</p>
              <p className="font-semibold text-gray-900">{report.test_name || report.testName}</p>
            </div>

            {report.client_name && (
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-gray-600">Клиент</p>
                <p className="font-semibold text-gray-900">{report.client_name}</p>
              </div>
            )}

            {report.summary && (
              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">Общая информация</h3>
                <p className="text-gray-700 whitespace-pre-line">{report.summary}</p>
              </div>
            )}

            {report.recommendations && (
              <div className="p-6 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">Рекомендации</h3>
                <p className="text-gray-700 whitespace-pre-line">{report.recommendations}</p>
              </div>
            )}

            {report.answers && report.answers.length > 0 && (
              <div className="p-6 bg-white border rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Ваши ответы</h3>
                <div className="space-y-4">
                  {report.answers.map((answer: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{idx + 1}. {answer.question_text || 'Вопрос'}</p>
                      <p className="text-gray-700 mt-1">
                        Ответ: {Array.isArray(answer.answer) ? answer.answer.join(', ') : String(answer.answer || answer.answer_value || '—')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Отчёт временно недоступен</p>
        )}

        <div className="mt-8">
          <button
            onClick={handleContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}