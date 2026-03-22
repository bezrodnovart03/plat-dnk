'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTests } from '@/hooks/use-tests';
import { useCreateSession } from '@/hooks/use-sessions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, User, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewSessionPage() {
  const router = useRouter();
  const { data: tests = [], isLoading: testsLoading } = useTests();
  const createSession = useCreateSession();
  
  const [formData, setFormData] = useState({
    testId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.testId || !formData.clientName) {
      toast.error('Выберите тест и введите имя клиента');
      return;
    }

    try {
      const session = await createSession.mutateAsync({
        testId: formData.testId,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || undefined,
        clientPhone: formData.clientPhone || undefined,
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
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Выбор теста */}
            <div className="space-y-2">
              <Label htmlFor="test">Тест *</Label>
              <select
                id="test"
                value={formData.testId}
                onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
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

            {/* Имя клиента */}
            <div className="space-y-2">
              <Label htmlFor="clientName">Имя клиента *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="clientName"
                  placeholder="Иванов Иван"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email клиента */}
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email клиента</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Телефон клиента */}
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Телефон клиента</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="clientPhone"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/sessions" className="flex-1">
                <Button variant="outline" className="w-full">
                  Отмена
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={createSession.isPending || !formData.testId || !formData.clientName}
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
