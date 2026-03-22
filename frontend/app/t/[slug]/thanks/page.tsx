'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ThanksPage() {
  const router = useRouter();
  const params = useParams();
  
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
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200/50 p-8 md:p-12 shadow-sm text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#00e600]/20 to-[#00cc00]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#00e600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Спасибо!</h1>
            <p className="text-lg text-gray-600 mb-2">
              Ваши ответы успешно сохранены
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Результаты будут доступны для психолога после обработки
            </p>

            {/* Countdown */}
            <div className="mb-8 p-4 bg-[#00e600]/5 rounded-xl border border-[#00e600]/30">
              <p className="text-sm text-gray-600">
                Страница закроется через <span className="font-semibold text-[#00e600] text-lg">{countdown}</span> сек
              </p>
            </div>

            {/* Button */}
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-[#00e600] to-[#00cc00] hover:from-[#00cc00] hover:to-[#00b300] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
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