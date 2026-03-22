// User types
export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'psychologist'
  is_active: boolean
  expires_at?: string
  created_at: string
}

// Test types
export interface Test {
  id: string
  title: string
  slug: string
  description?: string
  is_published: boolean
  show_report_to_client: boolean
  questions_count: number
  sessions_count: number
  last_session_at?: string
  created_at: string
  updated_at: string
  data?: {
    questions: Question[]
  }
}

export interface TestDetail extends Test {
  questions: Question[]
}

// Question types
export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'scale' | 'likert'

export interface Question {
  id: string
  test_id: string
  order_index: number
  type: QuestionType
  text: string
  required: boolean
  weight: number // Вес вопроса (0-100)
  metadata: Record<string, any>
}

// Session types
export interface Session {
  id: string
  test_id: string
  test_title: string
  test_slug: string
  client_name: string
  client_email?: string
  client_phone?: string
  status: 'in_progress' | 'completed'
  started_at: string
  completed_at?: string
  answers_count: number
}

export interface SessionDetail extends Session {
  answers: Answer[]
}

export interface Answer {
  question_id: string
  question_text: string
  question_type: QuestionType
  order_index: number
  answer_value: string | number | string[]
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T
  meta?: {
    request_id: string
    timestamp: string
  }
}

export interface ClientReport {
  sessionId?: string
  session_id?: string
  testName?: string
  test_name?: string
  clientName?: string
  client_name?: string
  completedAt?: string
  completed_at?: string
  summary?: string
  recommendations?: string
  answers?: Array<{
    questionId?: string
    question_id?: string
    question_text?: string
    answer?: any
    answer_value?: any
    createdAt?: string
    created_at?: string
  }>
}