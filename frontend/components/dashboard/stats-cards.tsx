import { FileText, Users, BarChart3 } from 'lucide-react';

interface StatsCardsProps {
  totalTests: number;
  totalSessions: number;
  avgCompletion: number;
}

export default function StatsCards({ totalTests, totalSessions, avgCompletion }: StatsCardsProps) {
  const stats = [
    { label: 'Тестов', value: totalTests, icon: FileText, color: 'text-blue-600' },
    { label: 'Прохождений', value: totalSessions, icon: Users, color: 'text-green-600' },
    { label: 'Средняя полнота', value: `${avgCompletion}%`, icon: BarChart3, color: 'text-[#00e600]' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
              <div className={`p-3 rounded-xl bg-gray-50`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}