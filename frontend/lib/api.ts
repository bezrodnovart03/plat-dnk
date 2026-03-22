// frontend/lib/api.ts

import { 
  Test, 
  Question, 
  Session, 
  ClientReport, 
  ApiResponse,
  User 
} from '@/types';
import { mockDB } from '@/mocks';

// Базовый URL API (из переменных окружения или localhost)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Функция для получения токена
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('access_token');
};

// Базовый экземпляр fetch с JWT-интерцептором
const api = {
  async get<T>(url: string): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async post<T>(url: string, data: any): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async put<T>(url: string, data: any): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async patch<T>(url: string, data?: any): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async delete<T>(url: string): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
};

// ============== PUBLIC API (для клиента) ==============
export const publicAPI = {
  // Получить тест по slug
  getTestBySlug: async (slug: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: 'test-1',
        slug: slug,
        title: 'Демо тест',
        description: 'Описание демо теста',
        questions: [
          {
            id: 'q1',
            test_id: 'test-1',
            order_index: 0,
            text: 'Как вас зовут?',
            type: 'text',
            required: true,
            metadata: {}
          },
          {
            id: 'q2',
            test_id: 'test-1',
            order_index: 1,
            text: 'Выберите вариант',
            type: 'single_choice',
            required: true,
            metadata: {
              options: ['Вариант 1', 'Вариант 2', 'Вариант 3']
            }
          },
          {
            id: 'q3',
            test_id: 'test-1',
            order_index: 2,
            text: 'Оцените по шкале',
            type: 'scale',
            required: false,
            metadata: {
              scale_min: 1,
              scale_max: 10,
              scale_labels: {
                '1': 'Совсем не нравится',
                '10': 'Очень нравится'
              }
            }
          }
        ]
      };
    }
    
    const response = await api.get<{ data: any }>(`/public/tests/${slug}`);
    return response.data;
  },

  // Создать сессию (начать прохождение)
  createSession: async (slug: string, clientName: string, clientEmail?: string, clientPhone?: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const test = mockDB.tests.find((t: any) => t.slug === slug);
      if (!test) throw new Error('Test not found');
      
      const questions = mockDB.questions.filter((q: any) => q.test_id === test.id);
      
      const newSession = {
        id: `sess-${Date.now()}`,
        test_id: test.id,
        test_title: test.title,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        completed_at: null,
        answers_count: 0,
      };
      
      mockDB.sessions.push(newSession);
      
      return {
        session_id: newSession.id,
        test_title: test.title,
        total_questions: questions.length,
      };
    }
    
    const response = await api.post<{ data: { session_id: string; test_title: string; total_questions: number } }>(`/public/sessions/start`, {
      test_slug: slug,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
    });
    return response.data;
  },

  // Сохранить ответ
  saveAnswer: async (sessionId: string, questionId: string, answer: any) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const session = mockDB.sessions.find((s: any) => s.id === sessionId);
      const question = mockDB.questions.find((q: any) => q.id === questionId);
      
      if (!session) throw new Error('Session not found');
      
      // Сохраняем ответ
      const newAnswer = {
        session_id: sessionId,
        question_id: questionId,
        question_text: question?.text || '',
        question_type: question?.type || 'text',
        order_index: question?.order_index || 0,
        answer_value: answer,
      };
      
      mockDB.answers.push(newAnswer);
      
      // Обновляем счётчик
      const sessionIndex = mockDB.sessions.findIndex((s: any) => s.id === sessionId);
      const allAnswers = mockDB.answers.filter((a: any) => a.session_id === sessionId);
      mockDB.sessions[sessionIndex].answers_count = allAnswers.length;
      
      // Подсчитываем оставшиеся вопросы
      const testQuestions = mockDB.questions.filter((q: any) => q.test_id === session.test_id);
      const remainingQuestions = testQuestions.length - allAnswers.length;
      
      return {
        session_id: sessionId,
        question_id: questionId,
        next_exists: remainingQuestions > 0,
        remaining_questions: Math.max(0, remainingQuestions),
      };
    }
    
    const response = await api.post<{ data: { session_id: string; question_id: string; next_exists: boolean; remaining_questions: number } }>(`/public/sessions/${sessionId}/answer`, {
      question_id: questionId,
      answer_value: answer,
    });
    return response.data;
  },

  // Завершить сессию
  completeSession: async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = mockDB.sessions.findIndex((s: any) => s.id === sessionId);
      if (index === -1) throw new Error('Session not found');
      
      mockDB.sessions[index].status = 'completed';
      mockDB.sessions[index].completed_at = new Date().toISOString();
      
      return {
        session_id: sessionId,
        completed_at: mockDB.sessions[index].completed_at,
        show_report: true,
        report_url: `/reports/client/session/${sessionId}?format=html`,
      };
    }
    
    const response = await api.post<{ data: { session_id: string; completed_at: string; show_report: boolean; report_url: string } }>(`/public/sessions/${sessionId}/complete`, {});
    return response.data;
  },

  // Получить сессию (для продолжения)
  getSession: async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const session = mockDB.sessions.find((s: any) => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      
      const answers = mockDB.answers.filter((a: any) => a.session_id === sessionId);
      
      return {
        id: sessionId,
        clientName: session.client_name,
        status: session.status,
        testTitle: session.test_title,
        answers: answers.map((a: any) => ({
          question_id: a.question_id,
          answer_value: a.answer_value,
        })),
      };
    }
    
    const response = await api.get<{ data: any }>(`/public/sessions/${sessionId}`);
    return response.data;
  },
};

// Мок-данные для тестов
let mockTests: Test[] = [
  {
    id: 'test-1',
    title: 'Тест на профориентацию',
    description: 'Определите подходящую профессию',
    is_published: true,
    show_report_to_client: true,
    questions_count: 10,
    sessions_count: 25,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'test-2',
    title: 'Опросник удовлетворённости',
    description: 'Измерение уровня удовлетворённости работой',
    is_published: true,
    show_report_to_client: false,
    questions_count: 15,
    sessions_count: 42,
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 'test-3',
    title: 'Тест стрессоустойчивости',
    description: 'Оценка уровня стрессоустойчивости',
    is_published: false,
    show_report_to_client: true,
    questions_count: 8,
    sessions_count: 0,
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-10T09:15:00Z',
  },
];

let mockQuestions: Question[] = [
  {
    id: 'q1',
    test_id: 'test-1',
    order_index: 0,
    type: 'single_choice',
    text: 'Какая деятельность вам ближе?',
    required: true,
    weight: 33.33,
    metadata: {
      options: ['Работа с людьми', 'Работа с техникой', 'Творческая деятельность', 'Аналитическая работа']
    }
  },
  {
    id: 'q2',
    test_id: 'test-1',
    order_index: 1,
    type: 'scale',
    text: 'Оцените свою коммуникабельность',
    required: true,
    weight: 33.33,
    metadata: { scale_min: 1, scale_max: 10 }
  },
  {
    id: 'q3',
    test_id: 'test-1',
    order_index: 2,
    type: 'text',
    text: 'Опишите ваши сильные стороны',
    required: false,
    weight: 33.34,
    metadata: {}
  },
];

// ============================================
// 📊 TESTS API (для Frontend A и B)
// ============================================
export const testsAPI = {
  // Получить все тесты
  getAll: async () => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTests;
    }
    const response = await api.get<ApiResponse<Test[]>>('/tests');
    return response.data;
  },

  // Получить тест по ID
  getById: async (id: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      const test = mockTests.find(t => t.id === id);
      if (!test) throw new Error('Test not found');
      return test;
    }
    const response = await api.get<ApiResponse<Test>>(`/tests/${id}`);
    return response.data;
  },

  // Получить вопросы теста
  getQuestions: async (testId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockQuestions.filter(q => q.test_id === testId);
    }
    const response = await api.get<ApiResponse<Question[]>>(`/tests/${testId}/questions`);
    return response.data;
  },

  // Создать новый тест
  create: async (data: { title: string; description?: string }) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newTest: Test = {
        id: `test-${Date.now()}`,
        title: data.title,
        description: data.description || '',
        is_published: false,
        show_report_to_client: true,
        questions_count: 0,
        sessions_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTests.push(newTest);
      return newTest;
    }
    const response = await api.post<ApiResponse<Test>>('/tests', data);
    return response.data;
  },

  // Обновить тест
  update: async (id: string, data: Partial<Test>) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const testIndex = mockTests.findIndex(t => t.id === id);
      if (testIndex === -1) throw new Error('Test not found');
      mockTests[testIndex] = { ...mockTests[testIndex], ...data, updated_at: new Date().toISOString() };
      return mockTests[testIndex];
    }
    const response = await api.put<ApiResponse<Test>>(`/tests/${id}`, data);
    return response.data;
  },

  // Удалить тест
  delete: async (id: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockTests = mockTests.filter(t => t.id !== id);
      return { success: true };
    }
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  // Добавить вопрос к тесту
  addQuestion: async (testId: string, data: Partial<Question>) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        test_id: testId,
        order_index: mockQuestions.filter(q => q.test_id === testId).length,
        type: data.type || 'text',
        text: data.text || '',
        required: data.required || false,
        weight: data.weight || 0,
        metadata: data.metadata || {},
      };
      mockQuestions.push(newQuestion);
      // Обновляем счётчик вопросов в тесте
      const testIndex = mockTests.findIndex(t => t.id === testId);
      if (testIndex !== -1) {
        mockTests[testIndex].questions_count = mockQuestions.filter(q => q.test_id === testId).length;
      }
      return newQuestion;
    }
    const response = await api.post<ApiResponse<Question>>(`/tests/${testId}/questions`, data);
    return response.data;
  },

  // Обновить вопрос (с testId для совместимости с хуками)
  updateQuestion: async (testId: string, questionId: string, data: Partial<Question>) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const qIndex = mockQuestions.findIndex(q => q.id === questionId);
      if (qIndex === -1) throw new Error('Question not found');
      mockQuestions[qIndex] = { ...mockQuestions[qIndex], ...data };
      return mockQuestions[qIndex];
    }
    const response = await api.put<ApiResponse<Question>>(`/questions/${questionId}`, data);
    return response.data;
  },

  // Удалить вопрос (с testId для совместимости с хуками)
  deleteQuestion: async (testId: string, questionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockQuestions = mockQuestions.filter(q => q.id !== questionId);
      // Обновляем счётчик вопросов в тесте
      const testIndex = mockTests.findIndex(t => t.id === testId);
      if (testIndex !== -1) {
        mockTests[testIndex].questions_count = mockQuestions.filter(q => q.test_id === testId).length;
      }
      return { success: true };
    }
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },

  // Изменить порядок вопросов
  reorderQuestions: async (testId: string, questionIds: string[]) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      questionIds.forEach((id, index) => {
        const qIndex = mockQuestions.findIndex(q => q.id === id);
        if (qIndex !== -1) {
          mockQuestions[qIndex].order_index = index;
        }
      });
      return { success: true };
    }
    const response = await api.put(`/tests/${testId}/questions/order`, { question_ids: questionIds });
    return response.data;
  },

  // Получить ссылку для partage (для Frontend B)
  getShareLink: async (testId: string) => {
    const response = await api.get<ApiResponse<{ shareLink: string }>>(`/tests/${testId}/share`);
    return response.data;
  },
};

// ============================================
// 📋 SESSIONS API (для Frontend A)
// ============================================
export const sessionsAPI = {
  // Получить все сессии
  getAll: async () => {
    const response = await api.get<ApiResponse<Session[]>>('/sessions');
    return response.data;
  },

  // Получить сессию по ID
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Session>>(`/sessions/${id}`);
    return response.data;
  },

  // Получить сессии по тесту
  getByTest: async (testId: string) => {
    const response = await api.get<ApiResponse<Session[]>>(`/tests/${testId}/sessions`);
    return response.data;
  },

  // Получить ответы сессии
  getAnswers: async (sessionId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/sessions/${sessionId}/answers`);
    return response.data;
  },

  // Удалить сессию
  delete: async (id: string) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  },

  // Создать сессию
  create: async (data: { testId: string; clientName: string; clientEmail?: string; clientPhone?: string }) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      const test = mockDB.tests.find((t: any) => t.id === data.testId);
      const newSession = {
        id: `sess-${Date.now()}`,
        test_id: data.testId,
        test_title: test?.title || 'Тест',
        client_name: data.clientName,
        client_email: data.clientEmail,
        client_phone: data.clientPhone || null,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        completed_at: null,
        answers_count: 0,
      };
      mockDB.sessions.push(newSession);
      return newSession;
    }
    const response = await api.post<ApiResponse<Session>>('/sessions', data);
    return response.data;
  },

  // Обновить сессию
  update: async (id: string, data: Partial<Session>) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockDB.sessions.findIndex((s: any) => s.id === id);
      if (index === -1) throw new Error('Session not found');
      mockDB.sessions[index] = { ...mockDB.sessions[index], ...data };
      return mockDB.sessions[index];
    }
    const response = await api.put<ApiResponse<Session>>(`/sessions/${id}`, data);
    return response.data;
  },

  // Отправить ответ на вопрос
  submitAnswer: async (sessionId: string, data: { questionId: string; answerValue: any }) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const session = mockDB.sessions.find((s: any) => s.id === sessionId);
      const question = mockDB.questions.find((q: any) => q.id === data.questionId);
      
      if (!session) throw new Error('Session not found');
      
      const newAnswer = {
        session_id: sessionId,
        question_id: data.questionId,
        question_text: question?.text || '',
        question_type: question?.type || 'text',
        order_index: question?.order_index || 0,
        answer_value: data.answerValue,
      };
      
      mockDB.answers.push(newAnswer);
      
      // Обновляем счётчик ответов в сессии
      const sessionIndex = mockDB.sessions.findIndex((s: any) => s.id === sessionId);
      mockDB.sessions[sessionIndex].answers_count = mockDB.answers.filter((a: any) => a.session_id === sessionId).length;
      
      return newAnswer;
    }
    const response = await api.post<ApiResponse<any>>(`/sessions/${sessionId}/answers`, data);
    return response.data;
  },

  // Завершить сессию
  complete: async (id: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockDB.sessions.findIndex((s: any) => s.id === id);
      if (index === -1) throw new Error('Session not found');
      mockDB.sessions[index].status = 'completed';
      mockDB.sessions[index].completed_at = new Date().toISOString();
      return mockDB.sessions[index];
    }
    const response = await api.post<ApiResponse<Session>>(`/sessions/${id}/complete`, {});
    return response.data;
  },
};

// ============================================
// 📈 REPORTS API (для Frontend A и C)
// ============================================
export const reportsAPI = {
  // Получить отчёт клиента (для Frontend C)
  getClientReport: async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const session = mockDB.sessions.find((s: any) => s.id === sessionId);
      const answers = mockDB.answers.filter((a: any) => a.session_id === sessionId);
      
      if (!session) throw new Error('Session not found');
      
      // Ищем существующий отчёт или создаём новый
      let report = mockDB.reports.find((r: any) => r.session_id === sessionId);
      
      if (!report) {
        report = {
          session_id: sessionId,
          test_name: session.test_title,
          client_name: session.client_name,
          completed_at: session.completed_at || new Date().toISOString(),
          summary: `Тест "${session.test_title}" пройден клиентом ${session.client_name}. Всего ответов: ${answers.length}.`,
          recommendations: 'На основе результатов теста рекомендуется проконсультироваться со специалистом для детальной интерпретации.',
          answers: answers.map((a: any) => ({
            question_id: a.question_id,
            answer: a.answer_value,
            created_at: new Date().toISOString(),
          })),
        };
        mockDB.reports.push(report);
      }
      
      return report;
    }
    const response = await api.get<ApiResponse<ClientReport>>(`/sessions/${sessionId}/report`);
    return response.data;
  },

  // Создать/обновить отчёт
  saveReport: async (sessionId: string, data: { summary?: string; recommendations?: string }) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockDB.reports.findIndex((r: any) => r.session_id === sessionId);
      
      if (index !== -1) {
        mockDB.reports[index] = { ...mockDB.reports[index], ...data };
        return mockDB.reports[index];
      }
      
      throw new Error('Report not found');
    }
    const response = await api.put<ApiResponse<ClientReport>>(`/sessions/${sessionId}/report`, data);
    return response.data;
  },

  // Скачать отчёт теста (для Frontend A)
  downloadTestReport: async (testId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Возвращаем mock Blob
      return new Blob(['Mock report content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }
    const response = await api.get<Blob>(`/tests/${testId}/report/download`);
    return response;
  },

  // Получить статистику теста
  getTestStats: async (testId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const sessions = mockDB.sessions.filter((s: any) => s.test_id === testId);
      const completedSessions = sessions.filter((s: any) => s.status === 'completed');
      
      return {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        avgAnswers: sessions.length > 0 
          ? sessions.reduce((sum: number, s: any) => sum + (s.answers_count || 0), 0) / sessions.length 
          : 0,
      };
    }
    const response = await api.get<ApiResponse<{ totalSessions: number; avgScore?: number }>>(
      `/tests/${testId}/stats`
    );
    return response.data;
  },
};

// ============================================
// 👤 AUTH API (для Team Lead)
// ============================================
export const authAPI = {
  // Войти
  login: async (email: string, password: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Мок-пользователи для тестирования
      const mockUsers = [
        { id: 'admin-1', email: 'admin@example.com', password: 'admin', full_name: 'Администратор', role: 'admin', is_active: true, created_at: new Date().toISOString() },
        { id: 'user-1', email: 'ivanov@example.com', password: 'password', full_name: 'Иванов Иван', role: 'psychologist', is_active: true, created_at: new Date().toISOString() },
        ...mockPsychologists.data.users.map(u => ({ ...u, password: 'password' }))
      ];
      
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Неверный email или пароль');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      const token = `mock-token-${user.id}-${Date.now()}`;
      
      return { token, user: userWithoutPassword };
    }
    
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Выйти
  logout: async () => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true };
    }
    const response = await api.post('/auth/logout', {});
    return response;
  },

  // Получить текущего пользователя
  getCurrentUser: async () => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      // В мок-режиме возвращаем первого пользователя для простоты
      return mockPsychologists.data.users[0];
    }
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Регистрация
  register: async (data: { email: string; password: string; name: string }) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newUser = {
        id: `user-${Date.now()}`,
        email: data.email,
        full_name: data.name,
        role: 'psychologist',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      const token = `mock-token-${newUser.id}`;
      return { token, user: newUser };
    }
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
    return response.data;
  },
};

// Мок-данные для психологов
const mockPsychologists = {
  data: {
    users: [
      {
        id: '1',
        email: 'ivanov@example.com',
        full_name: 'Иванов Иван Иванович',
        phone: '+7 (999) 123-45-67',
        is_active: true,
        expires_at: '2025-12-31T23:59:59Z',
        created_at: '2024-01-15T10:00:00Z',
        stats: { total_tests: 12, total_sessions: 145 }
      },
      {
        id: '2',
        email: 'petrova@example.com',
        full_name: 'Петрова Мария Сергеевна',
        phone: '+7 (999) 234-56-78',
        is_active: true,
        expires_at: '2025-06-30T23:59:59Z',
        created_at: '2024-02-20T14:30:00Z',
        stats: { total_tests: 8, total_sessions: 89 }
      },
      {
        id: '3',
        email: 'sidorov@example.com',
        full_name: 'Сидоров Алексей Петрович',
        phone: '+7 (999) 345-67-89',
        is_active: false,
        expires_at: '2025-12-31T23:59:59Z',
        created_at: '2024-03-10T09:15:00Z',
        stats: { total_tests: 5, total_sessions: 34 }
      },
      {
        id: '4',
        email: 'kozlova@example.com',
        full_name: 'Козлова Анна Владимировна',
        phone: '+7 (999) 456-78-90',
        is_active: true,
        expires_at: '2024-12-01T00:00:00Z',
        created_at: '2024-01-05T11:00:00Z',
        stats: { total_tests: 15, total_sessions: 234 }
      },
      {
        id: '5',
        email: 'novikov@example.com',
        full_name: 'Новikov Дмитрий Олегович',
        phone: null,
        is_active: true,
        expires_at: null,
        created_at: '2024-04-01T16:45:00Z',
        stats: { total_tests: 3, total_sessions: 12 }
      }
    ]
  }
};

// ============== ADMIN API ==============
export const adminAPI = {
  // Получить список всех психологов
  getPsychologists: async (params?: {
    status?: 'active' | 'blocked' | 'expired';
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      let users = mockPsychologists.data.users;
      
      // Фильтр по статусу
      if (params?.status) {
        if (params.status === 'active') {
          users = users.filter(u => u.is_active && (!u.expires_at || new Date(u.expires_at) > new Date()));
        } else if (params.status === 'blocked') {
          users = users.filter(u => !u.is_active);
        } else if (params.status === 'expired') {
          users = users.filter(u => u.expires_at && new Date(u.expires_at) < new Date());
        }
      }
      
      // Фильтр по поиску
      if (params?.search) {
        const search = params.search.toLowerCase();
        users = users.filter(u => 
          u.full_name.toLowerCase().includes(search) || 
          u.email.toLowerCase().includes(search)
        );
      }
      
      return { data: { users } };
    }
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  // Получить статистику системы
  getSystemStats: async () => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        data: {
          total_psychologists: 12,
          active_psychologists: 8,
          blocked_psychologists: 2,
          expired_psychologists: 2,
          total_tests: 156,
          total_sessions: 2345,
          completed_sessions: 1987,
          new_psychologists_this_month: 3,
        }
      };
    }
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Создать психолога
  createPsychologist: async (data: {
    email: string;
    full_name: string;
    password: string;
    phone?: string;
    expires_at?: string;
  }) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newUser: any = {
        id: `user-${Date.now()}`,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone || null,
        is_active: true,
        expires_at: data.expires_at || null,
        created_at: new Date().toISOString(),
        stats: { total_tests: 0, total_sessions: 0 }
      };
      mockPsychologists.data.users.push(newUser);
      return { data: newUser };
    }
    const response = await api.post('/auth/users', data);
    return response.data;
  },

  // Блокировать/разблокировать психолога
  toggleBlock: async (userId: string, isActive: boolean) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = mockPsychologists.data.users.find((u: any) => u.id === userId);
      if (!user) throw new Error('User not found');
      user.is_active = isActive;
      return { data: user };
    }
    const response = await api.put(`/auth/users/${userId}/block`, { is_active: isActive });
    return response.data;
  },

  // Удалить психолога
  deletePsychologist: async (userId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockPsychologists.data.users.findIndex((u: any) => u.id === userId);
      if (index === -1) throw new Error('User not found');
      mockPsychologists.data.users.splice(index, 1);
      return { success: true };
    }
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Продлить срок действия аккаунта
  extendExpiry: async (userId: string, newExpiryDate: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = mockPsychologists.data.users.find((u: any) => u.id === userId);
      if (!user) throw new Error('User not found');
      user.expires_at = newExpiryDate;
      return { data: user };
    }
    const response = await api.put(`/auth/users/${userId}/extend`, {
      expires_at: newExpiryDate,
    });
    return response.data;
  },
};

// Экспорт для удобства
export default {
  publicAPI,
  testsAPI,
  sessionsAPI,
  reportsAPI,
  authAPI,
  adminAPI,
};

