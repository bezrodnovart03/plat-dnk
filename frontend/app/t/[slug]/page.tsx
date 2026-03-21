// frontend/app/t/[slug]/page.tsx
import { StartForm } from '@/components/client/start-form';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientTestPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
              Профориентационный тест
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Пройдите тест, чтобы определить подходящие вам направления
            </p>
            <p className="text-sm text-gray-500">
              Займет около 10-15 минут вашего времени
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-md transition-all duration-200">
              <StartForm slug={slug} />
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

