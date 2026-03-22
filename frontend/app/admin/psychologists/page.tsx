'use client';
import { useState } from 'react';
import { usePsychologists, useToggleBlock, useDeletePsychologist } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreVertical, UserCheck, UserX, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { BlockDialog } from '@/components/admin/block-dialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function PsychologistsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'expired'>(
    'all'
  );
  const [selectedPsychologist, setSelectedPsychologist] = useState<any>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading } = usePsychologists({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });

  const toggleBlock = useToggleBlock();
  const deletePsychologist = useDeletePsychologist();

  const psychologists = data?.data?.users || [];

  const getStatusBadge = (user: any) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Заблокирован</Badge>;
    }
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      return <Badge className="bg-yellow-500">Срок истёк</Badge>;
    }
    return <Badge className="bg-[#00e600]">Активен</Badge>;
  };

  const handleBlock = async () => {
    if (selectedPsychologist) {
      await toggleBlock.mutateAsync({
        userId: selectedPsychologist.id,
        isActive: !selectedPsychologist.is_active,
      });
      setBlockDialogOpen(false);
      setSelectedPsychologist(null);
    }
  };

  const handleDelete = async () => {
    if (selectedPsychologist) {
      await deletePsychologist.mutateAsync(selectedPsychologist.id);
      setDeleteDialogOpen(false);
      setSelectedPsychologist(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e600]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Психологи</h1>
          <p className="text-gray-600 mt-1">Управление аккаунтами психологов</p>
        </div>
        <Link href="/admin/psychologists/new">
          <Button className="bg-[#00e600] hover:bg-[#00cc00] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Создать психолога
          </Button>
        </Link>
      </div>

      {/* Фильтры */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по email или имени..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Все
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Активные
              </Button>
              <Button
                variant={statusFilter === 'blocked' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('blocked')}
                size="sm"
              >
                Заблокированные
              </Button>
              <Button
                variant={statusFilter === 'expired' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('expired')}
                size="sm"
              >
                С истекшим сроком
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица психологов */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Психолог
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Статус
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Срок действия
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Тестов</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Прохождений
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {psychologists.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user)}</td>
                    <td className="px-6 py-4">
                      {user.expires_at ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(user.expires_at), 'dd.MM.yyyy', { locale: ru })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Бессрочно</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{user.stats?.total_tests || 0}</td>
                    <td className="px-6 py-4 text-sm">{user.stats?.total_sessions || 0}</td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.is_active ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPsychologist(user);
                                setBlockDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Заблокировать
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPsychologist(user);
                                setBlockDialogOpen(true);
                              }}
                              className="text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Разблокировать
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPsychologist(user);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Диалог блокировки */}
      <BlockDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        psychologist={selectedPsychologist}
        onConfirm={handleBlock}
        isLoading={toggleBlock.isPending}
      />

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление психолога</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Вы действительно хотите удалить психолога{' '}
              <strong>{selectedPsychologist?.full_name}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Внимание! Это действие удалит все тесты и данные психолога. Отменить невозможно.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePsychologist.isPending}
            >
              {deletePsychologist.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
