'use client';

import { useParams } from 'next/navigation';
import { useTest } from '@/hooks/use-tests';
import { useSessions } from '@/hooks/use-sessions';
import SessionsList from '@/components/sessions/sessions-list';
import Link from 'next/link';

export default function TestDetailPage() {
  const { id } = useParams();
  const { data: test, isLoading: testLoading } = useTest(id as string);
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions(id as string);

  if (testLoading) return <div>Загрузка теста...</div>;
  if (!test) return <div>Тест не найден</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-gray-600 mt-1">{test.description}</p>
        </div>
        <div className="space-x-2">
          <Link
            href={`/constructor/${test.id}`}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Редактировать
          </Link>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/t/${test.slug}`)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Скопировать ссылку
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Статистика</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold">{sessions.length}</div>
            <div className="text-gray-500">Всего прохождений</div>
          </div>
          {/* Можно добавить другие метрики */}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Прохождения</h2>
        <SessionsList sessions={sessions} testId={test.id} />
      </div>
    </div>
  );
}