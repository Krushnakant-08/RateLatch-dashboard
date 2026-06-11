'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { getAuth } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="dashboard-layout">
      <Sidebar variant="tenant" />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}
