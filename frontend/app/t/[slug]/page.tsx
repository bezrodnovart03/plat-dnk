'use client';

import { StartForm } from '@/components/client/start-form';
import { usePublicTest } from '@/hooks/use-client-test';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ClientTestPage({ params, searchParams }: PageProps) {
  const { slug, sessionId } = useParamsAndSearchParams({ params, searchParams });
  const { data: test, isLoading } = usePublicTest(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00e600]/5 via-white to-[#00e600]/10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00e600]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00e600]/5 via-white to-[#00e600]/10">
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
      <main className="max-w-screen-2xl mx-auto px-8 py-12 md:py-20">
        <div className="flex flex-col items-center justify-center">
          {/* Title Section */}
          <div className="text-center mb-12 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {test?.title || 'Тест'}
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              {test?.description || 'Пройдите тест, чтобы узнать результаты'}
            </p>
            <p className="text-sm text-gray-500">
              {test?.questions?.length ? `Вопросов: ${test.questions.length}` : ''}
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-md transition-all duration-200">
              <StartForm slug={slug} sessionId={sessionId} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200/50 py-6 px-8 text-center text-sm text-gray-500 mt-12 md:mt-20">
        <div className="max-w-screen-2xl mx-auto">
          © {new Date().getFullYear()} ПрофДНК — платформа для профориентологов
        </div>
      </footer>
    </div>
  );
}

// Хелпер для работы с params и searchParams
function useParamsAndSearchParams({ params, searchParams }: PageProps) {
  const [resolved, setResolved] = React.useState<{ slug: string; sessionId?: string }>({ slug: '' });
  
  React.useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      const sessionId = typeof sp.session === 'string' ? sp.session : undefined;
      setResolved({ slug: p.slug, sessionId });
    });
  }, [params, searchParams]);
  
  return resolved;
}

import React from 'react';

