'use client';

export default function BillingPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Usage & Billing</h1>
        <p className="page-subtitle">Aggregate usage across all tenants grouped by plan</p>
      </div>

      {/* Plan summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { plan: 'Free', color: 'var(--text-muted)', limit: '100K req/mo' },
          { plan: 'Pro', color: 'var(--primary-light)', limit: '1M req/mo' },
          { plan: 'Enterprise', color: 'var(--accent-light)', limit: 'Unlimited' },
        ].map((p) => (
          <div key={p.plan} className="glass-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: p.color }}>{p.plan}</span>
              <span className="badge badge-primary">{p.limit}</span>
            </div>
            <p style={{ fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)' }}>—</p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>tenants</p>
          </div>
        ))}
      </div>

      {/* Usage table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Plan</th>
              <th>Used</th>
              <th>Limit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5}>
                <div className="empty-state" style={{ padding: '32px' }}>
                  <p>Billing data requires <code style={{ color: 'var(--primary-light)' }}>GET /admin/billing</code> API endpoint</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

