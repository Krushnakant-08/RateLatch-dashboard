'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { getAuth } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace('/login');
    } else if (auth.role !== 'owner') {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="dashboard-layout">
      <Sidebar variant="owner" />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}
