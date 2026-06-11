'use client';

import { StatCard } from '@/components/shared/StatCard';
import { KeyDisplay } from '@/components/shared/KeyDisplay';
import { RequestChart } from '@/components/charts/RequestChart';
import { useUsage } from '@/lib/hooks/useUsage';
import { getAuth, getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function DashboardOverview() {
  const { data, isLoading } = useUsage(24);
  const [projectInfo, setProjectInfo] = useState({ email: '', tenantId: '' });

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setProjectInfo({ email: auth.email, tenantId: auth.tenantId });
    }
  }, []);

  const token = getToken();

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Your rate limiting gateway at a glance</p>
      </div>

      {/* Project Info */}
      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        <KeyDisplay label="Tenant ID" value={projectInfo.tenantId || '—'} />
        {token && <KeyDisplay label="Dashboard Token" value={token} />}
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          label="Requests Today"
          value={isLoading ? '—' : (data?.summary.totalAllowed ?? 0)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <StatCard
          label="Blocked"
          value={isLoading ? '—' : (data?.summary.totalBlocked ?? 0)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          }
        />
        <StatCard
          label="Block Rate"
          value={isLoading ? '—' : (data?.summary.blockRate ?? '0%')}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
            </svg>
          }
        />
        <StatCard
          label="Active Rules"
          value="—"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
      </div>

      {/* Usage Chart */}
      <div className="glass-card chart-container">
        <h3 className="chart-title">Requests — Last 24 Hours</h3>
        {isLoading ? (
          <div className="skeleton" style={{ height: '300px' }} />
        ) : (
          <RequestChart data={data?.hourly ?? []} />
        )}
      </div>
    </>
  );
}
