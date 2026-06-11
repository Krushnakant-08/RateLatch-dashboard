'use client';

import { useState } from 'react';
import { RuleTable } from '@/components/rules/RuleTable';
import { RuleForm } from '@/components/rules/RuleForm';
import { useRules } from '@/lib/hooks/useRules';
import type { Rule } from '@/lib/api';

export default function RulesPage() {
  const { data, isLoading } = useRules();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingRule(null);
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Rate Rules</h1>
          <p className="page-subtitle">Configure rate limits for your API routes</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingRule(null); setShowForm(true); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Rule
        </button>
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: '200px' }} />
      ) : (
        <RuleTable
          rules={data?.rules ?? []}
          onEdit={handleEdit}
        />
      )}

      {/* Hint */}
      <div style={{
        marginTop: '24px',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.1)',
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>How rules work:</strong> Rules are matched by route and
        evaluated from highest to lowest priority. If no rule matches a request, the default limit for your plan is
        used. Changes take effect within 60 seconds.
      </div>

      {showForm && (
        <RuleForm rule={editingRule} onClose={handleClose} />
      )}
    </>
  );
}
