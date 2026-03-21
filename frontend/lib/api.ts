// frontend/lib/api.ts

import { 
  Test, 
  Question, 
  Session, 
  ClientReport, 
  ApiResponse,
  User 
} from '@/types';

// Базовый URL API (из переменных окружения или localhost)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Базовый экземпляр fetch
const api = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
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
      // Заглушка для разработки
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
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
                options: [
                  { id: 'opt1', text: 'Вариант 1' },
                  { id: 'opt2', text: 'Вариант 2' },
                  { id: 'opt3', text: 'Вариант 3' }
                ]
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
        }
      };
    }
    
    const response = await api.get(`/public/tests/${slug}`);
    return response;
  },

  // Создать сессию (начать прохождение)
  createSession: async (slug: string, clientName: string, clientEmail?: string, clientPhone?: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        data: {
          session_id: sessionId,
          test_title: 'Демо тест',
          total_questions: 3
        }
      };
    }
    
    const response = await api.post(`/public/sessions/start`, {
      test_slug: slug,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
    });
    return response;
  },

  // Сохранить ответ
  saveAnswer: async (sessionId: string, questionId: string, answer: any) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('MOCK saveAnswer:', { sessionId, questionId, answer_value: answer });
      return {
        data: {
          session_id: sessionId,
          question_id: questionId,
          next_exists: true,
          remaining_questions: 10
        }
      };
    }
    
    const response = await api.post(`/public/sessions/${sessionId}/answer`, {
      question_id: questionId,
      answer_value: answer,
    });
    return response;
  },

  // Завершить сессию
  completeSession: async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('MOCK completeSession:', sessionId);
      return {
        data: {
          session_id: sessionId,
          completed_at: new Date().toISOString(),
          show_report: true,
          report_url: `/reports/client/session/${sessionId}?format=html`
        }
      };
    }
    
    const response = await api.post(`/public/sessions/${sessionId}/complete`, {});
    return response;
  },

  // Получить сессию (для продолжения)
  getSession: async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: sessionId,
        clientName: 'Тестовый клиент',
        status: 'in_progress',
        answers: []
      };
    }
    
    const response = await api.get(`/public/sessions/${sessionId}`);
    return response.data;
  },
};

// ============================================
// 📊 TESTS API (для Frontend A и B)
// ============================================
export const testsAPI = {
  // Получить все тесты
  getAll: () => api.get<ApiResponse<Test[]>>('/tests'),

  // Получить тест по ID
  getById: (id: string) => api.get<ApiResponse<Test>>(`/tests/${id}`),

  // Создать новый тест
  create: (data: { title: string; description?: string }) =>
    api.post<ApiResponse<Test>>('/tests', data),

  // Обновить тест
  update: (id: string, data: Partial<Test>) =>
    api.put<ApiResponse<Test>>(`/tests/${id}`, data),

  // Удалить тест
  delete: (id: string) => api.delete(`/tests/${id}`),

  // Добавить вопрос к тесту
  addQuestion: (testId: string, data: Partial<Question>) =>
    api.post<ApiResponse<Question>>(`/tests/${testId}/questions`, data),

  // Обновить вопрос
  updateQuestion: (id: string, data: Partial<Question>) =>
    api.put<ApiResponse<Question>>(`/questions/${id}`, data),

  // Удалить вопрос
  deleteQuestion: (id: string) => api.delete(`/questions/${id}`),

  // Изменить порядок вопросов
  reorderQuestions: (testId: string, questionIds: string[]) =>
    api.put(`/tests/${testId}/questions/order`, { question_ids: questionIds }),

  // Получить ссылку для partage (для Frontend B)
  getShareLink: (testId: string) =>
    api.get<ApiResponse<{ shareLink: string }>>(`/tests/${testId}/share`),
};

// ============================================
// 📋 SESSIONS API (для Frontend A)
// ============================================
export const sessionsAPI = {
  // Получить все сессии
  getAll: () => api.get<ApiResponse<Session[]>>('/sessions'),

  // Получить сессию по ID
  getById: (id: string) => api.get<ApiResponse<Session>>(`/sessions/${id}`),

  // Получить сессии по тесту
  getByTest: (testId: string) =>
    api.get<ApiResponse<Session[]>>(`/tests/${testId}/sessions`),

  // Получить ответы сессии
  getAnswers: (sessionId: string) =>
    api.get<ApiResponse<any[]>>(`/sessions/${sessionId}/answers`),

  // Удалить сессию
  delete: (id: string) => api.delete(`/sessions/${id}`),
};

// ============================================
// 📈 REPORTS API (для Frontend A и C)
// ============================================
export const reportsAPI = {
  // Получить отчёт клиента (для Frontend C)
  getClientReport: async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      console.log('MOCK getClientReport:', sessionId);
      return {
        data: {
          testName: 'Тестовый тест',
          completedAt: new Date().toISOString(),
          summary: 'Тест пройден успешно',
          recommendations: 'Рекомендации для улучшения',
        }
      };
    }
    return api.get<ApiResponse<ClientReport>>(`/sessions/${sessionId}/report`);
  },

  // Скачать отчёт теста (для Frontend A)
  downloadTestReport: (testId: string) =>
    api.get<Blob>(`/tests/${testId}/report/download`),

  // Получить статистику теста
  getTestStats: (testId: string) =>
    api.get<ApiResponse<{ totalSessions: number; avgScore?: number }>>(
      `/tests/${testId}/stats`
    ),
};

// ============================================
// 👤 AUTH API (для Team Lead)
// ============================================
export const authAPI = {
  // Войти
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    }),

  // Выйти
  logout: () => api.post('/auth/logout', {}),

  // Получить текущего пользователя
  getCurrentUser: () => api.get<ApiResponse<User>>('/auth/me'),

  // Регистрация
  register: (data: { email: string; password: string; name: string }) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data),
};

// Экспорт для удобства
export default {
  publicAPI,
  testsAPI,
  sessionsAPI,
  reportsAPI,
  authAPI,
};

