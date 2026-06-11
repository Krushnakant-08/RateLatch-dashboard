'use client';

import { StatCard } from '@/components/shared/StatCard';

export default function AdminOverview() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Platform Overview</h1>
        <p className="page-subtitle">System health and traffic across all tenants</p>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Tenants"
          value="—"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          }
        />
        <StatCard
          label="Active (24h)"
          value="—"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Total Requests/s"
          value="—"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <StatCard
          label="Redis Memory"
          value="—"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            </svg>
          }
        />
      </div>

      {/* Latency Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="chart-title">Gateway Latency</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          textAlign: 'center',
          padding: '20px 0',
        }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>p50</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success-light)' }}>—</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>p95</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--warning-light)' }}>—</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>p99</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--error-light)' }}>—</p>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Requires Prometheus metrics integration
        </p>
      </div>

      {/* Info */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        fontSize: '13px',
        color: 'var(--text-muted)',
      }}>
        <strong style={{ color: 'var(--accent-light)' }}>Note:</strong> Platform-wide stats require the admin API
        endpoints ({`GET /admin/stats`}). These endpoints need to be implemented in the management API to aggregate
        data across all tenants.
      </div>
    </>
  );
}
