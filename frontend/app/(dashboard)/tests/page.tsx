'use client';

import { useTests } from '@/hooks/use-tests';
import TestList from '@/components/tests/test-list';
import Link from 'next/link';

export default function TestsPage() {
  const { data: tests = [], isLoading } = useTests();

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="p-12 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Тесты</h1>
          <p className="text-xl text-gray-600">Создавайте и управляйте психологическими тестами</p>
        </div>
        <Link
          href="/tests/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>Создать тест</span>
        </Link>
      </div>
      <TestList tests={tests} />
    </div>
  );
}