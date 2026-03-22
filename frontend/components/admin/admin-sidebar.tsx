'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Users, BarChart3, Settings, Shield, LogOut } from 'lucide-react';

const navItems = [
  { href: '/admin/psychologists', label: 'Психологи', icon: Users },
  { href: '/admin/stats', label: 'Статистика', icon: BarChart3 },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200/50 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#00e600]" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Панель администратора</h1>
            <p className="text-xs text-gray-500">Управление платформой</p>
          </div>
        </div>
      </div>

      <nav className="p-4 flex-1">
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

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#00e600]/10 rounded-full flex items-center justify-center">
            <span className="text-[#00e600] font-semibold text-sm">
              {user?.full_name?.[0] || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || 'Администратор'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  );
}
