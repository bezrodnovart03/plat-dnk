import TestCard from './test-card';
import Link from 'next/link';
import { FileText } from 'lucide-react';

interface Test {
  id: string;
  title: string;
  description?: string;
  is_published: boolean;
  sessions_count?: number;
}

export default function TestList({ tests }: { tests: Test[] }) {
  if (tests.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">У вас пока нет тестов</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Создайте свой первый тест, чтобы начать помогать клиентам в их самопознании
        </p>
        <Link
          href="/tests/new"
          className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg"
        >
          <span>+</span>
          <span>Создать тест</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {tests.map((test) => (
        <TestCard key={test.id} test={test} />
      ))}
    </div>
  );
}