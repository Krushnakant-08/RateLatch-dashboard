'use client';

export default function TenantsPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tenants</h1>
        <p className="page-subtitle">Manage all registered tenants on the platform</p>
      </div>

      {/* Search & Filter */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <input
          className="input"
          placeholder="Search by email..."
          style={{ maxWidth: '320px' }}
        />
        <select className="input select" style={{ width: '160px' }}>
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Tenants Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Plan</th>
              <th>Requests Today</th>
              <th>Blocked</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6}>
                <div className="empty-state" style={{ padding: '32px' }}>
                  <p>Tenant listing requires <code style={{ color: 'var(--primary-light)' }}>GET /admin/tenants</code> API endpoint</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        fontSize: '13px',
        color: 'var(--text-muted)',
      }}>
        <strong style={{ color: 'var(--accent-light)' }}>Coming soon:</strong> Full tenant management with search,
        filtering, suspension, and detailed usage views. Requires admin API endpoints to be implemented.
      </div>
    </>
  );
}
