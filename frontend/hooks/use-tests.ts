// hooks/use-tests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsAPI } from '@/lib/api';

// Получить все тесты
export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: () => testsAPI.getAll(),
  });
}

// Получить один тест
export function useTest(testId: string) {
  return useQuery({
    queryKey: ['tests', testId],
    queryFn: () => testsAPI.getById(testId),
    enabled: !!testId,
  });
}

// Получить вопросы теста
export function useQuestions(testId: string) {
  return useQuery({
    queryKey: ['tests', testId, 'questions'],
    queryFn: () => testsAPI.getQuestions(testId),
    enabled: !!testId,
  });
}

// Создать тест
export function useCreateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      testsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}

// Обновить тест
export function useUpdateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      testsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['tests', variables.id] });
    },
  });
}

// Удалить тест
export function useDeleteTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}

// Добавить вопрос
export function useAddQuestion(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => testsAPI.addQuestion(testId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', testId, 'questions'] });
    },
  });
}

// Обновить вопрос
export function useUpdateQuestion(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: any }) =>
      testsAPI.updateQuestion(testId, questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', testId, 'questions'] });
    },
  });
}

// Удалить вопрос
export function useDeleteQuestion(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => testsAPI.deleteQuestion(testId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', testId, 'questions'] });
    },
  });
}

// Изменить порядок вопросов
export function useReorderQuestions(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionIds: string[]) => testsAPI.reorderQuestions(testId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', testId, 'questions'] });
    },
  });
}