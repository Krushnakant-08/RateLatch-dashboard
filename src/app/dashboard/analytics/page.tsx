'use client';

import { useState } from 'react';
import { RequestChart } from '@/components/charts/RequestChart';
import { useUsage } from '@/lib/hooks/useUsage';

export default function AnalyticsPage() {
  const [hours, setHours] = useState(24);
  const { data, isLoading } = useUsage(hours);

  const timeRanges = [
    { label: '6h', value: 6 },
    { label: '12h', value: 12 },
    { label: '24h', value: 24 },
    { label: '48h', value: 48 },
    { label: '7d', value: 168 },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Deep dive into your API traffic patterns</p>
      </div>

      {/* Time range selector */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        background: 'var(--bg-secondary)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        width: 'fit-content',
      }}>
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => setHours(range.value)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: hours === range.value ? 'var(--primary)' : 'transparent',
              color: hours === range.value ? 'white' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {!isLoading && data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Total Allowed
            </p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-light)' }}>
              {data.summary.totalAllowed.toLocaleString()}
            </p>
          </div>
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Total Blocked
            </p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--error-light)' }}>
              {data.summary.totalBlocked.toLocaleString()}
            </p>
          </div>
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Block Rate
            </p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning-light)' }}>
              {data.summary.blockRate}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="glass-card chart-container">
        <h3 className="chart-title">Traffic — Last {hours >= 24 ? `${hours / 24}d` : `${hours}h`}</h3>
        {isLoading ? (
          <div className="skeleton" style={{ height: '300px' }} />
        ) : (
          <RequestChart data={data?.hourly ?? []} />
        )}
      </div>

      {/* Route & IP breakdown placeholders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="chart-title">By Route</h3>
          <div className="empty-state" style={{ padding: '24px' }}>
            <p>Route-level analytics coming soon</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="chart-title">Top IPs</h3>
          <div className="empty-state" style={{ padding: '24px' }}>
            <p>Per-IP analytics coming soon</p>
          </div>
        </div>
      </div>
    </>
  );
}
