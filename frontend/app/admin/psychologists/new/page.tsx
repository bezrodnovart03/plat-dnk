'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePsychologist } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewPsychologistPage() {
  const router = useRouter();
  const createPsychologist = useCreatePsychologist();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    phone: '',
    expires_at: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.full_name) newErrors.full_name = 'Имя обязательно';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createPsychologist.mutateAsync({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        phone: formData.phone || undefined,
        expires_at: formData.expires_at || undefined,
      });
      router.push('/admin/psychologists');
    } catch (error) {
      // Ошибка уже обработана в хуке
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/psychologists">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Создание психолога</h1>
        <p className="text-gray-600 mt-1">Заполните информацию для нового аккаунта</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Учётные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="psychologist@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="full_name">Полное имя *</Label>
              <Input
                id="full_name"
                placeholder="Иван Петров"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="password">Пароль *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Временный пароль. Психолог сможет изменить его после первого входа.
              </p>
            </div>

            <div>
              <Label htmlFor="expires_at">Срок действия (опционально)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Если не указать, аккаунт будет действовать бессрочно
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/psychologists')}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createPsychologist.isPending}
                className="bg-[#00e600] hover:bg-[#00cc00] text-white"
              >
                {createPsychologist.isPending ? 'Создание...' : 'Создать психолога'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
