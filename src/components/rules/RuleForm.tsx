'use client';

import { useState, useEffect } from 'react';
import type { Rule } from '@/lib/api';
import { useCreateRule, useUpdateRule } from '@/lib/hooks/useRules';
import { usePlanInfo } from '@/lib/hooks/usePlan';

interface RuleFormProps {
  rule?: Rule | null;
  onClose: () => void;
}

const KEY_BY_LABELS: Record<string, string> = {
  ip: 'IP Address',
  api_key: 'API Key',
  user_id: 'User ID',
};

export function RuleForm({ rule, onClose }: RuleFormProps) {
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const { data: planInfo } = usePlanInfo();
  const isEditing = !!rule;

  const limits = planInfo?.limits;
  const planLabel = limits?.label || 'Free';

  const [form, setForm] = useState({
    route: '',
    keyBy: 'ip',
    maxReq: 10,
    windowMs: 60000,
    priority: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (rule) {
      setForm({
        route: rule.route,
        keyBy: rule.key_by,
        maxReq: rule.max_req,
        windowMs: rule.window_ms,
        priority: rule.priority,
      });
    }
  }, [rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side plan validation
    if (limits) {
      if (limits.maxReqCap !== null && form.maxReq > limits.maxReqCap) {
        setError(`${planLabel} plan allows max ${limits.maxReqCap} requests per rule. Upgrade for more.`);
        return;
      }
      if (!limits.allowedKeyBy.includes(form.keyBy)) {
        setError(`"${KEY_BY_LABELS[form.keyBy]}" is not available on the ${planLabel} plan.`);
        return;
      }
      if (form.priority !== 0 && !limits.priorityAllowed) {
        setError('Custom rule priority is only available on the Enterprise plan.');
        return;
      }
    }

    try {
      if (isEditing && rule) {
        await updateRule.mutateAsync({
          ruleId: rule.id,
          data: form,
        });
      } else {
        await createRule.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule');
    }
  };

  const isLoading = createRule.isPending || updateRule.isPending;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h2 className="modal-title">
          {isEditing ? 'Edit Rule' : 'Add New Rule'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Route</label>
            <input
              className="input"
              placeholder="/login, /api/*, or * for all routes"
              value={form.route}
              onChange={(e) => setForm({ ...form, route: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="input-label">Key By</label>
            <select
              className="input select"
              value={form.keyBy}
              onChange={(e) => setForm({ ...form, keyBy: e.target.value })}
            >
              {limits?.allowedKeyBy.map((key) => (
                <option key={key} value={key}>{KEY_BY_LABELS[key] || key}</option>
              )) || (
                <option value="ip">IP Address</option>
              )}
            </select>
            {limits && limits.allowedKeyBy.length < 3 && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {planLabel} plan supports: {limits.allowedKeyBy.map(k => KEY_BY_LABELS[k]).join(', ')}.
                {limits.allowedKeyBy.length === 1 && ' Upgrade to Pro for API Key support.'}
                {limits.allowedKeyBy.length === 2 && ' Upgrade to Enterprise for User ID support.'}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Max Requests</label>
              <input
                className="input"
                type="number"
                min="1"
                max={limits?.maxReqCap ?? undefined}
                value={form.maxReq}
                onChange={(e) => setForm({ ...form, maxReq: parseInt(e.target.value, 10) || 1 })}
                required
              />
              {limits?.maxReqCap && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {planLabel} plan max: {limits.maxReqCap} req
                </p>
              )}
            </div>
            <div>
              <label className="input-label">Window</label>
              <select
                className="input select"
                value={form.windowMs}
                onChange={(e) => setForm({ ...form, windowMs: parseInt(e.target.value, 10) })}
              >
                <option value="10000">10 seconds</option>
                <option value="30000">30 seconds</option>
                <option value="60000">1 minute</option>
                <option value="300000">5 minutes</option>
                <option value="900000">15 minutes</option>
                <option value="3600000">1 hour</option>
                <option value="86400000">24 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Priority
              {!limits?.priorityAllowed && (
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Enterprise Only
                </span>
              )}
            </label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value, 10) || 0 })}
              disabled={!limits?.priorityAllowed}
              style={{ opacity: limits?.priorityAllowed ? 1 : 0.5 }}
            />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {limits?.priorityAllowed
                ? 'Higher priority rules are evaluated first.'
                : 'Priority is locked to 0 on your plan. Upgrade to Enterprise for custom priorities.'}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

