// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============== AUTH API ==============
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ============== TESTS API ==============
export const testsAPI = {
  // Получить все тесты психолога
  getAll: async () => {
    const response = await api.get('/tests');
    return response.data;
  },

  // Получить тест по ID
  getById: async (id: string) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  // Создать тест
  create: async (data: { title: string; description?: string }) => {
    const response = await api.post('/tests', data);
    return response.data;
  },

  // Обновить тест
  update: async (id: string, data: { title?: string; description?: string; isPublished?: boolean }) => {
    const response = await api.patch(`/tests/${id}`, data);
    return response.data;
  },

  // Удалить тест
  delete: async (id: string) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  // Получить вопросы теста
  getQuestions: async (testId: string) => {
    const response = await api.get(`/tests/${testId}/questions`);
    return response.data;
  },

  // Добавить вопрос
  addQuestion: async (testId: string, data: any) => {
    const response = await api.post(`/tests/${testId}/questions`, data);
    return response.data;
  },

  // Обновить вопрос
  updateQuestion: async (testId: string, questionId: string, data: any) => {
    const response = await api.patch(`/tests/${testId}/questions/${questionId}`, data);
    return response.data;
  },

  // Удалить вопрос
  deleteQuestion: async (testId: string, questionId: string) => {
    const response = await api.delete(`/tests/${testId}/questions/${questionId}`);
    return response.data;
  },

  // Изменить порядок вопросов
  reorderQuestions: async (testId: string, questionIds: string[]) => {
    const response = await api.patch(`/tests/${testId}/questions/reorder`, { questionIds });
    return response.data;
  },
};

// ============== SESSIONS API ==============
export const sessionsAPI = {
  // Получить все сессии психолога (или по тесту)
  getAll: async (testId?: string) => {
    const url = testId ? `/sessions?testId=${testId}` : '/sessions';
    const response = await api.get(url);
    return response.data;
  },

  // Получить сессию по ID
  getById: async (id: string) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  // Получить сессии по тесту (альтернативный метод)
  getByTestId: async (testId: string) => {
    const response = await api.get(`/tests/${testId}/sessions`);
    return response.data;
  },
};

// ============== REPORTS API ==============
export const reportsAPI = {
  // Скачать отчёт в DOCX
  getReport: async (sessionId: string) => {
    const response = await api.get(`/reports/${sessionId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Получить отчёт в формате JSON (для предпросмотра)
  getReportJSON: async (sessionId: string) => {
    const response = await api.get(`/reports/${sessionId}/json`);
    return response.data;
  },
};

// ============== PUBLIC API (для клиента) ==============
export const publicAPI = {
  // Получить тест по slug
  getTestBySlug: async (slug: string) => {
    const response = await api.get(`/public/tests/${slug}`);
    return response.data;
  },

  // Создать сессию (начать прохождение)
  createSession: async (slug: string, clientName: string, clientEmail?: string) => {
    const response = await api.post(`/public/tests/${slug}/sessions`, {
      clientName,
      clientEmail,
    });
    return response.data;
  },

  // Сохранить ответ
  saveAnswer: async (sessionId: string, questionId: string, answer: any) => {
    const response = await api.post(`/public/sessions/${sessionId}/answers`, {
      questionId,
      answer,
    });
    return response.data;
  },

  // Завершить сессию
  completeSession: async (sessionId: string) => {
    const response = await api.patch(`/public/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Получить сессию (для продолжения)
  getSession: async (sessionId: string) => {
    const response = await api.get(`/public/sessions/${sessionId}`);
    return response.data;
  },
};