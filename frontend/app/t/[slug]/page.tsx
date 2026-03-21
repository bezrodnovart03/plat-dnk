// frontend/app/t/[slug]/page.tsx
import { StartForm } from '@/components/client/start-form';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientTestPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Тест</h1>
          <p className="text-gray-600">Введите ваше имя для начала</p>
        </div>
        <StartForm slug={slug} />
      </div>
    </div>
  );
}