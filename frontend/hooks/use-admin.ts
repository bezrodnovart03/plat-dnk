import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';

// Получить всех психологов
export function usePsychologists(params?: {
  status?: 'active' | 'blocked' | 'expired';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['psychologists', params],
    queryFn: () => adminAPI.getPsychologists(params),
    enabled: true,
  });
}

// Получить статистику системы
export function useSystemStats() {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: () => adminAPI.getSystemStats(),
    refetchInterval: 30000, // обновлять каждые 30 секунд
  });
}

// Создать психолога
export function useCreatePsychologist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.createPsychologist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychologists'] });
      toast.success('Психолог создан');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Ошибка при создании');
    },
  });
}

// Блокировать/разблокировать психолога
export function useToggleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminAPI.toggleBlock(userId, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['psychologists'] });
      toast.success(variables.isActive ? 'Психолог разблокирован' : 'Психолог заблокирован');
    },
    onError: () => {
      toast.error('Ошибка при изменении статуса');
    },
  });
}

// Удалить психолога
export function useDeletePsychologist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.deletePsychologist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychologists'] });
      toast.success('Психолог удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении');
    },
  });
}

// Продлить срок действия
export function useExtendExpiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newExpiryDate }: { userId: string; newExpiryDate: string }) =>
      adminAPI.extendExpiry(userId, newExpiryDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychologists'] });
      toast.success('Срок действия продлён');
    },
    onError: () => {
      toast.error('Ошибка при продлении');
    },
  });
}
