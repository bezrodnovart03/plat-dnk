// frontend/components/client/start-form.tsx
'use client';

import { useState } from 'react';
import { useClientSession } from '@/hooks/use-client-session';

interface StartFormProps {
  slug: string;
}

export function StartForm({ slug }: StartFormProps) {
  const [name, setName] = useState('');
  const { startSession, isLoading, error } = useClientSession(slug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Обязательно предотвращаем перезагрузку
    if (name.trim().length < 2) return;
    await startSession(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Ваше имя
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите ваше имя"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
          required
          minLength={2}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || name.trim().length < 2}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
      >
        {isLoading ? 'Загрузка...' : 'Начать тест'}
      </button>
    </form>
  );
}