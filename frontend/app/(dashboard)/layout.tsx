import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}