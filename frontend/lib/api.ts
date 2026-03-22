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
      };
    }
    
    const response = await api.get<{ data: any }>(`/public/tests/${slug}`);
    return response.data;
  },

  // Создать сессию (начать прохождение)
  createSession: async (slug: string, clientName: string, clientEmail?: string, clientPhone?: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        session_id: sessionId,
        test_title: 'Демо тест',
        total_questions: 3
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
      console.log('MOCK saveAnswer:', { sessionId, questionId, answer_value: answer });
      return {
        session_id: sessionId,
        question_id: questionId,
        next_exists: true,
        remaining_questions: 10
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
      console.log('MOCK completeSession:', sessionId);
      return {
        session_id: sessionId,
        completed_at: new Date().toISOString(),
        show_report: true,
        report_url: `/reports/client/session/${sessionId}?format=html`
      };
    }
    
    const response = await api.post<{ data: { session_id: string; completed_at: string; show_report: boolean; report_url: string } }>(`/public/sessions/${sessionId}/complete`, {});
    return response.data;
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
    
    const response = await api.get<{ data: any }>(`/public/sessions/${sessionId}`);
    return response.data;
  },
};

// ============================================
// 📊 TESTS API (для Frontend A и B)
// ============================================
export const testsAPI = {
  // Получить все тесты
  getAll: async () => {
    const response = await api.get<ApiResponse<Test[]>>('/tests');
    return response.data;
  },

  // Получить тест по ID
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Test>>(`/tests/${id}`);
    return response.data;
  },

  // Получить вопросы теста
  getQuestions: async (testId: string) => {
    const response = await api.get<ApiResponse<Question[]>>(`/tests/${testId}/questions`);
    return response.data;
  },

  // Создать новый тест
  create: async (data: { title: string; description?: string }) => {
    const response = await api.post<ApiResponse<Test>>('/tests', data);
    return response.data;
  },

  // Обновить тест
  update: async (id: string, data: Partial<Test>) => {
    const response = await api.put<ApiResponse<Test>>(`/tests/${id}`, data);
    return response.data;
  },

  // Удалить тест
  delete: async (id: string) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  // Добавить вопрос к тесту
  addQuestion: async (testId: string, data: Partial<Question>) => {
    const response = await api.post<ApiResponse<Question>>(`/tests/${testId}/questions`, data);
    return response.data;
  },

  // Обновить вопрос (с testId для совместимости с хуками)
  updateQuestion: async (testId: string, questionId: string, data: Partial<Question>) => {
    const response = await api.put<ApiResponse<Question>>(`/questions/${questionId}`, data);
    return response.data;
  },

  // Удалить вопрос (с testId для совместимости с хуками)
  deleteQuestion: async (testId: string, questionId: string) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },

  // Изменить порядок вопросов
  reorderQuestions: async (testId: string, questionIds: string[]) => {
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
        testName: 'Тестовый тест',
        completedAt: new Date().toISOString(),
        summary: 'Тест пройден успешно',
        recommendations: 'Рекомендации для улучшения',
      };
    }
    const response = await api.get<ApiResponse<ClientReport>>(`/sessions/${sessionId}/report`);
    return response.data;
  },

  // Скачать отчёт теста (для Frontend A)
  downloadTestReport: async (testId: string) => {
    const response = await api.get<Blob>(`/tests/${testId}/report/download`);
    return response;
  },

  // Получить статистику теста
  getTestStats: async (testId: string) => {
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
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Выйти
  logout: async () => {
    const response = await api.post('/auth/logout', {});
    return response;
  },

  // Получить текущего пользователя
  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Регистрация
  register: async (data: { email: string; password: string; name: string }) => {
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
    const response = await api.post('/auth/users', data);
    return response.data;
  },

  // Блокировать/разблокировать психолога
  toggleBlock: async (userId: string, isActive: boolean) => {
    const response = await api.put(`/auth/users/${userId}/block`, { is_active: isActive });
    return response.data;
  },

  // Удалить психолога
  deletePsychologist: async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Продлить срок действия аккаунта
  extendExpiry: async (userId: string, newExpiryDate: string) => {
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

