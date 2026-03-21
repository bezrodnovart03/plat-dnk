import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Calendar } from 'lucide-react';

interface Session {
  id: string;
  clientName: string;
  test: { title: string };
  createdAt: string;
}

export default function RecentSessions({ sessions }: { sessions: Session[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/50 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Последние прохождения</h2>
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-1">Пока нет прохождений</p>
          <p className="text-sm text-gray-500">Результаты появятся после того, как клиенты пройдут ваши тесты</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-xl hover:border-gray-200 transition-all duration-200 hover:shadow-sm">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{session.clientName}</p>
                <p className="text-sm text-gray-600 mb-2">{session.test.title}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(session.createdAt), 'dd.MM.yyyy в HH:mm')}
                </div>
              </div>
              <Link
                href={`/sessions/${session.id}`}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>Просмотр</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}