'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [upstreamUrl, setUpstreamUrl] = useState('');
  const [plan] = useState('free');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ projectKey: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register({ email, upstreamUrl, plan });
      setToken(res.dashboardToken);
      setResult({ projectKey: res.projectKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAndContinue = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.projectKey);
      } catch { /* ignore */ }
    }
    router.push('/dashboard');
  };

  if (result) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            margin: '0 auto 24px',
          }}>
            ✓
          </div>

          <h1 className="auth-title" style={{ color: 'var(--success-light)' }}>
            Registration Successful!
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
            Save your project key — it won&apos;t be shown again.
          </p>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Your Project Key
            </p>
            <code style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '16px',
              color: 'var(--primary-light)',
              wordBreak: 'break-all',
            }}>
              {result.projectKey}
            </code>
          </div>

          <button
            onClick={handleCopyAndContinue}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '17px' }}
          >
            Copy Key & Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            boxShadow: '0 8px 24px rgba(85, 107, 47, 0.3)',
          }}>
            ⚡
          </div>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start rate limiting your API in minutes</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="input-label">Email</label>
            <input
              id="register-email"
              className="input"
              type="email"
              placeholder="dev@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">Upstream API URL</label>
            <input
              id="register-upstream"
              className="input"
              type="url"
              placeholder="https://api.yourcompany.com"
              value={upstreamUrl}
              onChange={(e) => setUpstreamUrl(e.target.value)}
              required
            />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              The URL of your backend API that requests will be forwarded to.
            </p>
          </div>

          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(85, 107, 47, 0.05)',
            border: '1px solid rgba(85, 107, 47, 0.1)',
            fontSize: '15px',
            color: 'var(--text-muted)',
          }}>
            ✨ All accounts start on the <strong style={{ color: 'var(--text-secondary)' }}>Free plan</strong>. You can upgrade to Pro or Enterprise from the Billing page after registration.
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '17px' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

