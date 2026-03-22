// hooks/use-sessions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsAPI } from '@/lib/api';

// Получить все сессии
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsAPI.getAll(),
  });
}

// Получить одну сессию
export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => sessionsAPI.getById(sessionId),
    enabled: !!sessionId,
  });
}

// Получить сессии по тесту
export function useSessionsByTest(testId: string) {
  return useQuery({
    queryKey: ['sessions', 'test', testId],
    queryFn: () => sessionsAPI.getByTest(testId),
    enabled: !!testId,
  });
}

// Получить ответы сессии
export function useSessionAnswers(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'answers'],
    queryFn: () => sessionsAPI.getAnswers(sessionId),
    enabled: !!sessionId,
  });
}

// Удалить сессию
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}