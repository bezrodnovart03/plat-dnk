// hooks/use-client-test.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api';

// Получить тест по slug
export function usePublicTest(slug: string) {
  return useQuery({
    queryKey: ['public-test', slug],
    queryFn: () => publicAPI.getTestBySlug(slug),
    enabled: !!slug,
  });
}

// Создать сессию (начать тест)
export function useCreatePublicSession() {
  return useMutation({
    mutationFn: ({ slug, clientName, clientEmail, clientPhone }: { 
      slug: string; 
      clientName: string; 
      clientEmail?: string; 
      clientPhone?: string;
    }) => publicAPI.createSession(slug, clientName, clientEmail, clientPhone),
  });
}

// Получить сессию
export function usePublicSession(sessionId: string) {
  return useQuery({
    queryKey: ['public-session', sessionId],
    queryFn: () => publicAPI.getSession(sessionId),
    enabled: !!sessionId,
  });
}

// Сохранить ответ
export function useSavePublicAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, questionId, answer }: { 
      sessionId: string; 
      questionId: string; 
      answer: any;
    }) => publicAPI.saveAnswer(sessionId, questionId, answer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public-session', variables.sessionId] });
    },
  });
}

// Завершить сессию
export function useCompletePublicSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => publicAPI.completeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['public-session', sessionId] });
    },
  });
}
