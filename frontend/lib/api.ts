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

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
};

// ============================================
// 🔵 PUBLIC API (для Frontend C — Клиент)
// ============================================
export const publicAPI = {
  // Начало сессии клиента (ввод имени)
  startClientSession: async (slug: string, name: string) => {
    // MOCK для разработки
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      console.log('MOCK startClientSession:', { slug, name });
      return { 
        data: { 
          sessionId: `session_${Date.now()}`,
          clientName: name 
        } 
      };
    }
    // Реальный API
    return api.post<ApiResponse<{ sessionId: string; clientName: string }>>(
      `/tests/${slug}/start`,
      { name }
    );
  },

  // Отправка ответа на вопрос
  submitAnswer: async (sessionId: string, questionId: string, answer: any) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      console.log('MOCK submitAnswer:', { sessionId, questionId, answer });
      return { data: { success: true } };
    }
    return api.post<ApiResponse<void>>(`/sessions/${sessionId}/answer`, {
      questionId,
      answer,
    });
  },

  // Завершение сессии
  completeSession: async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      console.log('MOCK completeSession:', sessionId);
      return { data: { success: true } };
    }
    return api.post<ApiResponse<void>>(`/sessions/${sessionId}/complete`);
  },

  // Получение теста по slug
  getTestBySlug: async (slug: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      console.log('MOCK getTestBySlug:', slug);
      return { 
        data: { 
          slug, 
          name: 'Тестовый тест',
          description: 'Описание для тестирования'
        } 
      };
    }
    return api.get<ApiResponse<Test>>(`/tests/slug/${slug}`);
  },

  // Получение вопросов теста
  getTestQuestions: async (slug: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      console.log('MOCK getTestQuestions:', slug);
      return { 
        data: {
          questions: [
            { id: '1', text: 'Как вас зовут?', type: 'text' },
            {
              id: '2',
              text: 'Выберите вариант',
              type: 'single-choice',
              options: [
                { id: 'a', text: 'Вариант А' },
                { id: 'b', text: 'Вариант Б' },
              ],
            },
            {
              id: '3',
              text: 'Оцените по шкале',
              type: 'scale',
              settings: { min: 1, max: 10, minLabel: 'Плохо', maxLabel: 'Отлично' }
            }
          ],
        }
      };
    }
    return api.get<ApiResponse<Question[]>>(`/tests/${slug}/questions`);
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