'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePlanInfo, usePlans, useSubscription } from '@/lib/hooks/usePlan';
import { createSubscription, cancelSubscription, fetchDowngradePreview, confirmDowngrade, type DowngradePreview, type Rule } from '@/lib/api';
import { getToken } from '@/lib/auth';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function BillingPage() {
  const { data: planInfo, isLoading: planLoading } = usePlanInfo();
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { data: subData } = useSubscription();
  const queryClient = useQueryClient();

  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [downgradePreview, setDowngradePreview] = useState<DowngradePreview | null>(null);
  const [confirmingDowngrade, setConfirmingDowngrade] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPlan = planInfo?.plan || 'free';
  const planOrder: Record<string, number> = { free: 0, pro: 1, enterprise: 2 };

  const handleUpgrade = async (targetPlan: string) => {
    setError('');
    setSuccess('');
    setUpgrading(targetPlan);

    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await createSubscription(token, targetPlan);

      // Load Razorpay Checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: res.razorpayKeyId,
          subscription_id: res.subscriptionId,
          name: 'RateLatch',
          description: `${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} Plan — Monthly`,
          theme: { color: '#556b2f' },
          handler: () => {
            setSuccess(`Upgraded to ${targetPlan}! Your plan is now active.`);
            queryClient.invalidateQueries({ queryKey: ['plan-info'] });
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['rules'] });
          },
          modal: {
            ondismiss: () => {
              setUpgrading(null);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start upgrade');
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setError('');
    setSuccess('');

    const token = getToken();
    if (!token) return;

    // First show downgrade preview
    try {
      const preview = await fetchDowngradePreview(token, 'free');
      if (preview.rulesToDelete.length > 0) {
        setDowngradePreview(preview);
        return;
      }
      // No rules to delete, just cancel
      setCancelling(true);
      await cancelSubscription(token);
      setSuccess('Subscription cancelled. You are now on the Free plan.');
      queryClient.invalidateQueries({ queryKey: ['plan-info'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmDowngrade = async () => {
    if (!downgradePreview) return;
    setConfirmingDowngrade(true);
    setError('');

    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      await confirmDowngrade(token, downgradePreview.targetPlan);
      await cancelSubscription(token);
      setSuccess(
        `Subscription cancelled. ${downgradePreview.rulesToDelete.length} rule(s) removed. You are now on the Free plan.`
      );
      setDowngradePreview(null);
      queryClient.invalidateQueries({ queryKey: ['plan-info'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to downgrade');
    } finally {
      setConfirmingDowngrade(false);
    }
  };

  if (planLoading || plansLoading) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">Manage your subscription and plan</p>
        </div>
        <div className="skeleton" style={{ height: '400px' }} />
      </>
    );
  }

  const plans = plansData?.plans || [];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Billing</h1>
        <p className="page-subtitle">Manage your subscription and plan</p>
      </div>

      {/* Current Plan Badge */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Current Plan</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <span style={{
              fontSize: '24px',
              fontWeight: 700,
              background: currentPlan === 'enterprise' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                currentPlan === 'pro' ? 'linear-gradient(135deg, #556b2f, #6b8e23)' :
                  'linear-gradient(135deg, #7f7b71, #b5af9f)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'capitalize',
            }}>
              {currentPlan}
            </span>
            {subData?.subscription && (
              <span className="badge badge-success" style={{ fontSize: '13px' }}>
                {subData.subscription.status}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Rules Used</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {planInfo?.ruleCount ?? 0} / {planInfo?.limits.maxRoutes ?? 5}
          </div>
        </div>
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

      {/* Pricing Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isUpgrade = planOrder[plan.id] > planOrder[currentPlan];
          const isDowngrade = planOrder[plan.id] < planOrder[currentPlan];
          const accentColor = plan.id === 'enterprise' ? '#f59e0b' : plan.id === 'pro' ? '#556b2f' : '#7f7b71';

          return (
            <div
              key={plan.id}
              style={{
                padding: '28px 24px',
                borderRadius: 'var(--radius-lg)',
                background: isCurrent ? `rgba(${plan.id === 'pro' ? '85,107,47' : plan.id === 'enterprise' ? '245,158,11' : '100,116,139'}, 0.05)` : 'var(--bg-secondary)',
                border: `2px solid ${isCurrent ? accentColor : 'var(--border)'}`,
                position: 'relative',
                transition: 'all var(--transition-fast)',
              }}
            >
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '20px',
                  background: accentColor,
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: '0 0 8px 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Current
                </div>
              )}

              <h3 style={{ fontSize: '22px', fontWeight: 700, color: accentColor, marginBottom: '4px', textTransform: 'capitalize' }}>
                {plan.label}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {plan.description}
              </p>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ₹{plan.priceInr}
                </span>
                {plan.priceInr > 0 && (
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/month</span>
                )}
                {plan.priceInr === 0 && (
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)', marginLeft: '4px' }}>forever</span>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--success-light)', fontWeight: 700 }}>✓</span>
                  {plan.maxRoutes} route rules
                </li>
                <li style={{ fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--success-light)', fontWeight: 700 }}>✓</span>
                  {plan.maxReqCap ? `${plan.maxReqCap} max req/rule` : 'Unlimited requests'}
                </li>
                <li style={{ fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--success-light)', fontWeight: 700 }}>✓</span>
                  Key by: {plan.allowedKeyBy.join(', ')}
                </li>
                <li style={{ fontSize: '15px', color: plan.priorityAllowed ? 'var(--text-secondary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: plan.priorityAllowed ? 'var(--success-light)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {plan.priorityAllowed ? '✓' : '✗'}
                  </span>
                  Rule priority
                </li>
              </ul>

              {isCurrent ? (
                currentPlan !== 'free' ? (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px' }}
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                ) : (
                  <button className="btn btn-secondary" style={{ width: '100%', padding: '10px', opacity: 0.5 }} disabled>
                    Current Plan
                  </button>
                )
              ) : isUpgrade ? (
                <button
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: plan.id === 'enterprise' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : undefined,
                  }}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading !== null}
                >
                  {upgrading === plan.id ? 'Processing...' : `Upgrade to ${plan.label}`}
                </button>
              ) : isDowngrade ? (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '10px' }}
                  onClick={async () => {
                    const token = getToken();
                    if (!token) return;
                    try {
                      const preview = await fetchDowngradePreview(token, plan.id);
                      if (preview.rulesToDelete.length > 0) {
                        setDowngradePreview(preview);
                      } else {
                        await confirmDowngrade(token, plan.id);
                        setSuccess(`Downgraded to ${plan.label}.`);
                        queryClient.invalidateQueries({ queryKey: ['plan-info'] });
                        queryClient.invalidateQueries({ queryKey: ['subscription'] });
                        queryClient.invalidateQueries({ queryKey: ['rules'] });
                      }
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed');
                    }
                  }}
                >
                  Downgrade
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Subscription Details */}
      {subData?.subscription && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Subscription Details</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Status</span>
              <span className={`badge ${subData.subscription.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {subData.subscription.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Plan</span>
              <span style={{ fontSize: '15px', fontWeight: 500, textTransform: 'capitalize' }}>{subData.subscription.plan}</span>
            </div>
            {subData.subscription.current_end && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Next Billing</span>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>
                  {new Date(subData.subscription.current_end).toLocaleDateString()}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Subscription ID</span>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--primary-light)' }}>
                {subData.subscription.razorpay_sub_id}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {downgradePreview && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDowngradePreview(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h2 className="modal-title" style={{ color: 'var(--error-light)' }}>
              ⚠️ Downgrade Warning
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Downgrading to <strong style={{ textTransform: 'capitalize' }}>{downgradePreview.targetPlan}</strong> will
              require deleting <strong>{downgradePreview.rulesToDelete.length}</strong> rule(s):
            </p>

            {downgradePreview.reasons.map((reason, i) => (
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

            <div className="table-container" style={{ marginTop: '16px', maxHeight: '200px', overflow: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Key By</th>
                    <th>Max Req</th>
                  </tr>
                </thead>
                <tbody>
                  {downgradePreview.rulesToDelete.map((rule: Rule) => (
                    <tr key={rule.id}>
                      <td><code style={{ fontSize: '14px', color: 'var(--error-light)' }}>{rule.route}</code></td>
                      <td><span className="badge badge-primary" style={{ fontSize: '13px' }}>{rule.key_by}</span></td>
                      <td>{rule.max_req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setDowngradePreview(null)} disabled={confirmingDowngrade}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDowngrade} disabled={confirmingDowngrade}>
                {confirmingDowngrade ? 'Downgrading...' : `Delete ${downgradePreview.rulesToDelete.length} Rules & Downgrade`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

