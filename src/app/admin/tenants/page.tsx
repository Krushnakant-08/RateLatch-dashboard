'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminTenants, updateTenantPlan, type AdminTenant } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    tenantId: string;
    tenantEmail: string;
    newPlan: string;
    preview?: { rulesToDelete: { id: string; route: string; key_by: string }[]; reasons: string[] };
  } | null>(null);

  const { data, isLoading } = useQuery<{ tenants: AdminTenant[] }>({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return fetchAdminTenants(token);
    },
    staleTime: 15_000,
  });

  const filteredTenants = (data?.tenants || []).filter((t) => {
    if (search && !t.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (planFilter && t.plan !== planFilter) return false;
    return true;
  });

  const handlePlanChange = async (tenant: AdminTenant, newPlan: string) => {
    if (newPlan === tenant.plan) return;
    setError('');
    setSuccess('');
    setChangingPlan(tenant.id);

    const token = getToken();
    if (!token) return;

    try {
      const res = await updateTenantPlan(token, tenant.id, newPlan, false);
      setSuccess(`${tenant.email}: ${res.message}`);
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
    } catch (err: unknown) {
      // Check if it's a downgrade conflict
      const errMsg = err instanceof Error ? err.message : 'Failed';
      if (errMsg.includes('Downgrade requires rule cleanup') || errMsg.includes('rule cleanup')) {
        // Try to get preview from the error response
        try {
          const previewRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/admin/tenants/${tenant.id}/downgrade-preview?targetPlan=${newPlan}`,
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          const preview = await previewRes.json();
          setConfirmModal({
            tenantId: tenant.id,
            tenantEmail: tenant.email,
            newPlan,
            preview,
          });
        } catch {
          setConfirmModal({
            tenantId: tenant.id,
            tenantEmail: tenant.email,
            newPlan,
          });
        }
      } else {
        setError(errMsg);
      }
    } finally {
      setChangingPlan(null);
    }
  };

  const handleForceDowngrade = async () => {
    if (!confirmModal) return;
    setChangingPlan(confirmModal.tenantId);
    setError('');

    const token = getToken();
    if (!token) return;

    try {
      const res = await updateTenantPlan(token, confirmModal.tenantId, confirmModal.newPlan, true);
      setSuccess(`${confirmModal.tenantEmail}: ${res.message}`);
      setConfirmModal(null);
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setChangingPlan(null);
    }
  };

  const planBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' };
      case 'pro': return { bg: 'rgba(85, 107, 47, 0.1)', color: 'var(--primary)', border: 'rgba(85, 107, 47, 0.2)' };
      default: return { bg: 'rgba(127, 123, 113, 0.1)', color: '#7f7b71', border: 'rgba(127, 123, 113, 0.2)' };
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tenants</h1>
        <p className="page-subtitle">Manage all registered tenants on the platform</p>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          className="input"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
        />
        <select
          className="input select"
          style={{ width: '160px' }}
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}
      {success && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--success-light)',
          fontSize: '16px',
          marginBottom: '16px',
        }}>
          ✓ {success}
        </div>
      )}

      {/* Tenants Table */}
      {isLoading ? (
        <div className="skeleton" style={{ height: '300px' }} />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Plan</th>
                <th>Rules</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: '180px' }}>Change Plan</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state" style={{ padding: '32px' }}>
                      <p>No tenants found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const badge = planBadgeColor(tenant.plan);
                  return (
                    <tr key={tenant.id}>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: '15px' }}>{tenant.email}</span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontSize: '14px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>
                          {tenant.rule_count}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                          {' '}/ {tenant.planLimits?.maxRoutes ?? '?'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${tenant.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <select
                          className="input select"
                          style={{ fontSize: '14px', padding: '6px 8px', height: 'auto' }}
                          value={tenant.plan}
                          onChange={(e) => handlePlanChange(tenant, e.target.value)}
                          disabled={changingPlan === tenant.id}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmModal(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h2 className="modal-title" style={{ color: 'var(--error-light)' }}>
              ⚠️ Downgrade Tenant
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Downgrading <strong>{confirmModal.tenantEmail}</strong> to{' '}
              <strong style={{ textTransform: 'capitalize' }}>{confirmModal.newPlan}</strong> will
              delete some rules that exceed the new plan limits.
            </p>

            {confirmModal.preview?.reasons?.map((reason, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                fontSize: '15px',
                color: 'var(--error-light)',
                marginBottom: '8px',
              }}>
                {reason}
              </div>
            ))}

            {confirmModal.preview?.rulesToDelete && confirmModal.preview.rulesToDelete.length > 0 && (
              <div className="table-container" style={{ marginTop: '12px', maxHeight: '200px', overflow: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Key By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmModal.preview.rulesToDelete.map((rule) => (
                      <tr key={rule.id}>
                        <td><code style={{ fontSize: '14px', color: 'var(--error-light)' }}>{rule.route}</code></td>
                        <td><span className="badge badge-primary" style={{ fontSize: '13px' }}>{rule.key_by}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleForceDowngrade}
                disabled={changingPlan !== null}
              >
                {changingPlan ? 'Processing...' : 'Force Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

