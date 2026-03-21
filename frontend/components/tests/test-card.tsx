import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { testsAPI } from '@/lib/api';
import { Edit, Trash2, Eye, Users } from 'lucide-react';

interface TestCardProps {
  test: {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    sessionsCount?: number;
  };
}

export default function TestCard({ test }: TestCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Удалить тест? Все прохождения также будут удалены.')) {
      try {
        await testsAPI.delete(test.id);
        router.refresh();
      } catch (error) {
        alert('Ошибка удаления');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <Link href={`/tests/${test.id}`} className="block">
            <h3 className="font-semibold text-xl text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-1">
              {test.title}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{test.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          test.isPublished
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          {test.isPublished ? 'Опубликован' : 'Черновик'}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-2" />
          <span>{test.sessionsCount || 0} прохождений</span>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/tests/${test.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            title="Просмотр"
          >
            <Eye className="h-5 w-5" />
          </Link>
          <Link
            href={`/constructor/${test.id}`}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
            title="Редактировать"
          >
            <Edit className="h-5 w-5" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Удалить"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}