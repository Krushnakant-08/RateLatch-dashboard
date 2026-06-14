'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaDirection?: 'up' | 'down';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, delta, deltaDirection, icon }: StatCardProps) {
  return (
    <div className="glass-card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}>
            {label}
          </p>
          <p style={{
            fontSize: '30px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {delta && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: deltaDirection === 'up' ? 'var(--success-light)' : 'var(--error-light)',
              background: deltaDirection === 'up'
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              <span>{deltaDirection === 'up' ? '↑' : '↓'}</span>
              <span>{delta}</span>
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.9,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

