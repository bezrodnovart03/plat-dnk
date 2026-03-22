'use client';
import { useSystemStats } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useSystemStats();

  // Мок-данные для заглушки (пока нет бэкенда)
  const mockStats = {
    total_psychologists: 12,
    active_psychologists: 8,
    blocked_psychologists: 2,
    expired_psychologists: 2,
    total_tests: 156,
    total_sessions: 2345,
    completed_sessions: 1987,
    new_psychologists_this_month: 3,
  };

  const displayStats = stats?.data || mockStats;

  const statCards = [
    {
      title: 'Всего психологов',
      value: displayStats.total_psychologists,
      icon: Users,
      color: 'text-[#00e600]',
      bg: 'bg-[#00e600]/10',
    },
    {
      title: 'Активных',
      value: displayStats.active_psychologists,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Заблокированных',
      value: displayStats.blocked_psychologists,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'С истекшим сроком',
      value: displayStats.expired_psychologists,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Всего тестов',
      value: displayStats.total_tests,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Всего прохождений',
      value: displayStats.total_sessions,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e600]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
        <p className="text-gray-600 mt-1">
          Добро пожаловать, {user?.full_name}! Вот сводка по платформе.
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Динамика за месяц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-[#00e600]/5 rounded-lg">
              <div>
                <p className="text-sm text-[#00e600]">Новых психологов</p>
                <p className="text-2xl font-bold text-[#00e600]">
                  +{displayStats.new_psychologists_this_month || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#00e600]">Завершённых прохождений</p>
                <p className="text-2xl font-bold text-[#00e600]">
                  {displayStats.completed_sessions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/psychologists/new" className="block w-full">
              <Button className="w-full bg-[#00e600] hover:bg-[#00cc00] text-white">
                + Создать психолога
              </Button>
            </Link>
            <Link href="/admin/psychologists" className="block w-full">
              <Button
                variant="outline"
                className="w-full border-[#00e600] text-[#00e600] hover:bg-[#00e600]/5"
              >
                Управление психологами
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
