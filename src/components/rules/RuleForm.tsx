'use client';

import { useState, useEffect } from 'react';
import type { Rule } from '@/lib/api';
import { useCreateRule, useUpdateRule } from '@/lib/hooks/useRules';

interface RuleFormProps {
  rule?: Rule | null;
  onClose: () => void;
}

export function RuleForm({ rule, onClose }: RuleFormProps) {
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const isEditing = !!rule;

  const [form, setForm] = useState({
    route: '',
    keyBy: 'ip',
    maxReq: 100,
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
              <option value="ip">IP Address</option>
              <option value="api_key">API Key</option>
              <option value="user_id">User ID</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Max Requests</label>
              <input
                className="input"
                type="number"
                min="1"
                value={form.maxReq}
                onChange={(e) => setForm({ ...form, maxReq: parseInt(e.target.value, 10) || 1 })}
                required
              />
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
            <label className="input-label">Priority</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value, 10) || 0 })}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Higher priority rules are evaluated first.
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
