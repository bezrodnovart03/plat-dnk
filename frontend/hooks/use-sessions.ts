// hooks/use-sessions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsAPI } from '@/lib/api';

// Получить все сессии (опционально по тесту)
export function useSessions(testId?: string) {
  return useQuery({
    queryKey: ['sessions', testId],
    queryFn: () => sessionsAPI.getAll(testId),
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

// Получить сессии по тесту (альтернативный хук)
export function useSessionsByTest(testId: string) {
  return useQuery({
    queryKey: ['sessions', 'test', testId],
    queryFn: () => sessionsAPI.getByTestId(testId),
    enabled: !!testId,
  });
}