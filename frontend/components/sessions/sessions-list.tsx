import Link from 'next/link';
import { format } from 'date-fns';
import { Users } from 'lucide-react';

interface Session {
  id: string;
  clientName: string;
  createdAt: string;
  status: string;
}

export default function SessionsList({ sessions, testId }: { sessions: Session[]; testId?: string }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет сессий</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Сессии появятся после того, как клиенты пройдут ваши тесты
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900">Все сессии</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-600">Клиент</th>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-600">Дата</th>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-600">Статус</th>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-600">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-medium text-gray-900">{session.clientName}</div>
                </td>
                <td className="px-8 py-6 text-sm text-gray-600">
                  {format(new Date(session.createdAt), 'dd.MM.yyyy HH:mm')}
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {session.status === 'completed' ? 'Завершена' : 'В процессе'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <Link
                    href={`/sessions/${session.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline transition-colors"
                  >
                    Просмотр
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}