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

// Создать сессию
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { testId: string; clientName: string; clientEmail?: string; clientPhone?: string }) => 
      sessionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// Обновить сессию
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) => 
      sessionsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.id] });
    },
  });
}

// Отправить ответ
export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, questionId, answerValue }: { sessionId: string; questionId: string; answerValue: any }) => 
      sessionsAPI.submitAnswer(sessionId, { questionId, answerValue }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId, 'answers'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
    },
  });
}

// Завершить сессию
export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionsAPI.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
    },
  });
}