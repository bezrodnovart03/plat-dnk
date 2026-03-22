'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTests } from '@/hooks/use-tests';
import { useSessions } from '@/hooks/use-sessions';
import StatsCards from '@/components/dashboard/stats-cards';
import RecentSessions from '@/components/dashboard/recent-sessions';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: tests = [] } = useTests();
  const { data: sessions = [] } = useSessions();

  const totalTests = tests.length;
  const totalSessions = sessions.length;
  const avgCompletion = 85; // Заглушка, позже можно вычислить

  return (
    <div className="p-12 max-w-screen-2xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Добро пожаловать</h1>
        <p className="text-xl text-gray-600">Управляйте тестами и просматривайте результаты</p>
      </div>
      <StatsCards
        totalTests={totalTests}
        totalSessions={totalSessions}
        avgCompletion={avgCompletion}
      />
      <div className="mt-12">
        <RecentSessions sessions={sessions.slice(0, 5)} />
      </div>
    </div>
  );
}