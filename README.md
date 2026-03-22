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
