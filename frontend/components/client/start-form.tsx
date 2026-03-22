'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClientSession } from '@/hooks/use-client-session';

interface StartFormProps {
  slug: string;
  sessionId?: string;
}

export function StartForm({ slug, sessionId }: StartFormProps) {
  const router = useRouter();
const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const { startSession, isLoading, error } = useClientSession(slug, sessionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2 || email.trim().length === 0) return;
    
    try {
      console.log('Starting session with fullName:', fullName, 'email:', email, 'sessionId:', sessionId);
      await startSession(fullName.trim(), email.trim());
      console.log('Session started, redirecting...');
    router.push(`/t/${slug}/test`);
  } catch (err) {
    console.error('Failed to start session:', err);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          ФИО
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Введите ваше полное имя"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
          required
          minLength={2}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Электронная почта
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Введите вашу электронную почту"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || fullName.trim().length < 2 || email.trim().length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
      >
        {isLoading ? 'Загрузка...' : 'Начать тест'}
      </button>
    </form>
  );
}