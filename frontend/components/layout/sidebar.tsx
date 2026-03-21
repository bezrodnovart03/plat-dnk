'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileText, Users } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Дашборд', icon: BarChart3 },
  { href: '/tests', label: 'Тесты', icon: FileText },
  { href: '/sessions', label: 'Сессии', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r border-gray-200/50 min-h-screen">
      <div className="p-8 border-b border-gray-200/50">
        <h1 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Навигация</h1>
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
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
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