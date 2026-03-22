'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTests } from '@/hooks/use-tests';
import { useCreateSession } from '@/hooks/use-sessions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function NewSessionPage() {
  const router = useRouter();
  const { data: tests = [], isLoading: testsLoading } = useTests();
  const createSession = useCreateSession();
  
  const [selectedTestId, setSelectedTestId] = useState('');

  const selectedTest = tests.find((t: any) => t.id === selectedTestId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTestId) {
      toast.error('Выберите тест');
      return;
    }

    try {
      const session = await createSession.mutateAsync({
        testId: selectedTestId,
        clientName: '', // Будет заполнено клиентом при прохождении
      });
      
      toast.success('Сессия создана');
      router.push(`/sessions/${session.id}`);
    } catch (error) {
      toast.error('Ошибка при создании сессии');
    }
  };

  if (testsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/sessions">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к сессиям
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новая сессия тестирования</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Создайте сессию для прохождения теста клиентом. Данные клиента будут запрошены при открытии ссылки.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Выбор теста */}
            <div className="space-y-2">
              <Label htmlFor="test">Тест *</Label>
              <select
                id="test"
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">Выберите тест</option>
                {tests.map((test: any) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
              {tests.length === 0 && (
                <p className="text-sm text-gray-500">
                  Нет доступных тестов. <Link href="/tests/new" className="text-green-600 hover:underline">Создайте тест</Link>
                </p>
              )}
            </div>

            {/* Информация о выбранном тесте */}
            {selectedTest && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{selectedTest.title}</p>
                    {selectedTest.description && (
                      <p className="text-sm text-gray-600">{selectedTest.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 pt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Создан: {format(new Date(selectedTest.created_at), 'dd.MM.yyyy')}
                    </div>
                    <p className="text-xs text-gray-500">
                      Вопросов: {selectedTest.questions_count || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href="/sessions" className="flex-1">
                <Button variant="outline" className="w-full">
                  Отмена
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={createSession.isPending || !selectedTestId}
              >
                {createSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  'Создать сессию'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
