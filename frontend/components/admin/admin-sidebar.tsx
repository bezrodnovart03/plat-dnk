'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutDashboard, BarChart3, Settings, Shield } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/psychologists', label: 'Психологи', icon: Users },
  { href: '/admin/stats', label: 'Статистика', icon: BarChart3 },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-80 bg-white border-r border-gray-200/50 min-h-screen">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#00e600]" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Панель администратора</h1>
            <p className="text-xs text-gray-500">Управление платформой</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00e600]/10 text-[#00e600] border border-[#00e600]/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
