// hooks/use-reports.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '@/lib/api';

// Получить отчёт клиента
export function useClientReport(sessionId: string) {
  return useQuery({
    queryKey: ['reports', 'client', sessionId],
    queryFn: () => reportsAPI.getClientReport(sessionId),
    enabled: !!sessionId,
  });
}

// Сохранить отчёт
export function useSaveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: { summary?: string; recommendations?: string } }) => 
      reportsAPI.saveReport(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'client', variables.sessionId] });
    },
  });
}

// Получить статистику теста
export function useTestStats(testId: string) {
  return useQuery({
    queryKey: ['reports', 'stats', testId],
    queryFn: () => reportsAPI.getTestStats(testId),
    enabled: !!testId,
  });
}

// Скачать отчёт теста
export function useDownloadTestReport() {
  return useMutation({
    mutationFn: (testId: string) => reportsAPI.downloadTestReport(testId),
  });
}
