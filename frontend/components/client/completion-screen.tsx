'use client';

export function CompletionScreen() {

  return (
    <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-green-800 mb-2">Тест завершён!</h3>
      <p className="text-green-700 text-sm">
        Все ответы сохранены. Результаты будут доступны для психолога после обработки.
      </p>
    </div>
  );
}