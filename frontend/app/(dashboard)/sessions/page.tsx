'use client';

import { useSessions } from '@/hooks/use-sessions';
import SessionsList from '@/components/sessions/sessions-list';
import Link from 'next/link';

export default function SessionsPage() {
  const { data: sessions = [], isLoading } = useSessions();

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="p-12 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Сессии</h1>
          <p className="text-xl text-gray-600">Просматривайте результаты прохождений тестов</p>
        </div>
        <Link
          href="/sessions/new"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>Новая сессия</span>
        </Link>
      </div>
      <SessionsList sessions={sessions} />
    </div>
  );
}