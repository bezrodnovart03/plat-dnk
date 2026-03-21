'use client';

import { useParams } from 'next/navigation';
import { useSession } from '@/hooks/use-sessions';
import SessionDetail from '@/components/sessions/session-detail';

export default function SessionPage() {
  const { id } = useParams();
  const { data: session, isLoading } = useSession(id as string);

  if (isLoading) return <div>Загрузка...</div>;
  if (!session) return <div>Сессия не найдена</div>;

  return <SessionDetail session={session} />;
}