'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';

// ВРЕМЕННО: Отключена проверка авторизации для тестирования
// import { useAuth } from '@/hooks/use-auth';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // const { user, isLoading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && (!user || user.role !== 'admin')) {
  //     router.push('/dashboard');
  //   }
  // }, [user, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e600]"></div>
  //     </div>
  //   );
  // }

  // if (!user || user.role !== 'admin') {
  //   return null;
  // }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-[#00e600]/5 p-8">
        {children}
      </main>
    </div>
  );
}
