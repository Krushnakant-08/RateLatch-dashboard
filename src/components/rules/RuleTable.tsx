'use client';

import type { Rule } from '@/lib/api';
import { useDeleteRule } from '@/lib/hooks/useRules';
import { useState } from 'react';

interface RuleTableProps {
  rules: Rule[];
  onEdit?: (rule: Rule) => void;
  readOnly?: boolean;
}

function formatWindow(ms: number): string {
  if (ms >= 86400000) return `${ms / 86400000}d`;
  if (ms >= 3600000) return `${ms / 3600000}h`;
  if (ms >= 60000) return `${ms / 60000}m`;
  return `${ms / 1000}s`;
}

export function RuleTable({ rules, onEdit, readOnly = false }: RuleTableProps) {
  const deleteRule = useDeleteRule();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Delete this rule? Traffic will fall back to the next matching rule or plan default.')) {
      return;
    }
    setDeletingId(ruleId);
    try {
      await deleteRule.mutateAsync(ruleId);
    } finally {
      setDeletingId(null);
    }
  };

  if (rules.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
        </svg>
        <h3>No rules configured</h3>
        <p>Add rate limiting rules to control traffic to your API.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Route</th>
            <th>Key By</th>
            <th>Limit</th>
            <th>Window</th>
            <th>Priority</th>
            {!readOnly && <th style={{ width: '140px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td>
                <code style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  color: 'var(--primary-light)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  {rule.route}
                </code>
              </td>
              <td>
                <span className={`badge ${
                  rule.key_by === 'ip' ? 'badge-primary' :
                  rule.key_by === 'api_key' ? 'badge-warning' : 'badge-success'
                }`}>
                  {rule.key_by}
                </span>
              </td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {rule.max_req.toLocaleString()} req
              </td>
              <td>{formatWindow(rule.window_ms)}</td>
              <td>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  {rule.priority}
                </span>
              </td>
              {!readOnly && (
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit?.(rule)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(rule.id)}
                      disabled={deletingId === rule.id}
                    >
                      {deletingId === rule.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
