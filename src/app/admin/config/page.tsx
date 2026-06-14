'use client';

export default function ConfigPage() {
  const plans = [
    { name: 'Free', maxReq: 100, windowSec: 60 },
    { name: 'Pro', maxReq: 1000, windowSec: 60 },
    { name: 'Enterprise', maxReq: 10000, windowSec: 60 },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">System Config</h1>
        <p className="page-subtitle">Platform-wide default limits for each plan tier</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Default Max Requests</th>
              <th>Default Window</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.name}>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{plan.name}</span>
                </td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px' }}>
                  {plan.maxReq.toLocaleString()} req
                </td>
                <td>{plan.windowSec} seconds</td>
                <td>
                  <button className="btn btn-secondary btn-sm" disabled>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        fontSize: '15px',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--accent-light)' }}>How defaults work:</strong> These are the fallback rate
        limits applied when a tenant has no matching rule for their plan. Changes here affect all tenants without
        custom rules. Editing requires the <code style={{ color: 'var(--primary-light)' }}>PUT /admin/config/plans</code> API endpoint.
      </div>
    </>
  );
}

