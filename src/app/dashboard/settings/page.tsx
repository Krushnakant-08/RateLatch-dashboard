'use client';

import { useState, useEffect } from 'react';
import { getAuth, getToken, removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ email: string; tenantId: string } | null>(null);

  useEffect(() => {
    const a = getAuth();
    if (a) setAuth({ email: a.email, tenantId: a.tenantId });
  }, []);

  const token = getToken();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and project configuration</p>
      </div>

      {/* Account Info */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Account Information</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Email</span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{auth?.email ?? '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tenant ID</span>
            <code style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: 'var(--primary-light)',
            }}>
              {auth?.tenantId ?? '—'}
            </code>
          </div>
        </div>
      </div>

      {/* Dashboard Token */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Dashboard Token</h3>
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          wordBreak: 'break-all',
        }}>
          <code style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}>
            {token ? `${token.slice(0, 30)}...${token.slice(-10)}` : '—'}
          </code>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Use this token to authenticate management API requests.
        </p>
      </div>

      {/* Danger Zone */}
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        background: 'rgba(239, 68, 68, 0.03)',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--error-light)' }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          These actions are irreversible. Proceed with caution.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-danger" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
