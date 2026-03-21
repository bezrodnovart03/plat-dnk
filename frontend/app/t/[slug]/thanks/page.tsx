// frontend/app/t/[slug]/thanks/page.tsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ThanksPage() {
  const router = useRouter();
  const params = useParams();
  
  // Исправленное получение slug
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];
  
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Спасибо за прохождение!</h1>
        <p className="text-gray-600 mb-8">
          Ваши ответы успешно сохранены. Результаты будут доступны после обработки.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Вы будете перенаправлены через <span className="font-semibold text-green-600">{countdown}</span> сек.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}