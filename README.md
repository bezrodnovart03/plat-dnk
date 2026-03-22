# ПрофДНК — Платформа для профориентации

## Описание

Платформа для проведения профориентационных тестов. Состоит из:
- **Frontend** (Next.js 14) — веб-интерфейс для администраторов, психологов и клиентов
- **Auth Service** (Python/FastAPI) — сервис аутентификации
- **Gateway** (Python) — API Gateway
- **Test Service** (Python) — сервис управления тестами
- **Session Service** (Python) — сервис управления сессиями
- **Report Service** (Python) — сервис генерации отчетов

## Быстрый старт

Для запуска frontend:

### 1. Установка зависимостей

```bash
cd frontend
npm install
```

### 2. Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### 3. Данные для входа

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@profdnk.ru | admin |
| Психолог | psychologist@example.com | password |

## Доступные URL

### Публичные страницы (для клиентов)

| URL | Описание |
|-----|----------|
| http://localhost:3000 | Главная страница |
| http://localhost:3000/t/demo_test | Демо тест (прохождение теста) |
| http://localhost:3000/t/proforientation | Тест "Профессиональные склонности" |
| http://localhost:3000/t/personality | Тест "Личностный опросник" |

### Панель психолога

| URL | Описание |
|-----|----------|
| http://localhost:3000/login | Страница входа |
| http://localhost:3000/dashboard | Дашборд со статистикой |
| http://localhost:3000/tests | Список тестов |
| http://localhost:3000/tests/test-1 | Детали теста |
| http://localhost:3000/tests/new | Создание нового теста |
| http://localhost:3000/constructor/test-1 | Конструктор теста (редактирование вопросов) |
| http://localhost:3000/sessions | Список сессий |
| http://localhost:3000/sessions/sess-1 | Детали сессии |
| http://localhost:3000/sessions/new | Создание новой сессии |

### Панель администратора

| URL | Описание |
|-----|----------|
| http://localhost:3000/admin | Управление психологами |
| http://localhost:3000/admin/psychologists | Список психологов |
| http://localhost:3000/admin/psychologists/new | Создание психолога |

## Структура проекта

```
plat-dnk/
├── frontend/           # Next.js 14 приложение
│   ├── app/           # App Router страницы
│   ├── components/    # React компоненты
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API клиенты и утилиты
│   ├── mocks/         # Mock данные (JSON)
│   └── types/         # TypeScript типы
├── auth-service/      # Сервис аутентификации
├── gateway/           # API Gateway
├── test-service/      # Сервис тестов
├── session-service/   # Сервис сессий
└── report-service/    # Сервис отчетов
```

## Функционал

### Администратор
- Управление психологами (создание, блокировка, продление доступа)
- Просмотр статистики системы

### Психолог
- Создание и редактирование тестов (конструктор)
- Управление сессиями тестирования
- Просмотр результатов и генерация отчетов
- Публикация тестов по прямым ссылкам

### Клиент (респондент)
- Прохождение тестов по прямым ссылкам
- Просмотр результатов (если разрешено)

## Технологии

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query
- **UI Components**: Radix UI, Lucide Icons
- **Backend**: Python, FastAPI

## Переменные окружения

Frontend использует следующие переменные окружения (можно задать в `.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MOCK_MODE=true
```

## Скрипты

```bash
# Frontend
npm run dev      # Запуск dev-сервера
```

## Лицензия

MIT
