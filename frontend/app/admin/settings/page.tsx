'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Настройки платформы</h1>
        <p className="text-gray-600 mt-1">Управление параметрами системы</p>
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="text-center text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Настройки будут доступны позже</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
