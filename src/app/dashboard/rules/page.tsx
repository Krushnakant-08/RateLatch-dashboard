'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RuleTable } from '@/components/rules/RuleTable';
import { RuleForm } from '@/components/rules/RuleForm';
import { useRules } from '@/lib/hooks/useRules';
import { usePlanInfo } from '@/lib/hooks/usePlan';
import type { Rule } from '@/lib/api';

export default function RulesPage() {
  const { data, isLoading } = useRules();
  const { data: planInfo } = usePlanInfo();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const ruleCount = data?.rules?.length ?? 0;
  const maxRoutes = planInfo?.limits?.maxRoutes ?? 5;
  const planLabel = planInfo?.limits?.label ?? 'Free';
  const atLimit = ruleCount >= maxRoutes;
  const usagePercent = Math.min((ruleCount / maxRoutes) * 100, 100);

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
          disabled={atLimit}
          title={atLimit ? `${planLabel} plan limit reached (${maxRoutes} rules)` : undefined}
          style={{ opacity: atLimit ? 0.5 : 1 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Rule
        </button>
      </div>

      {/* Plan Usage Bar */}
      <div style={{
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Rules Used
            </span>
            <span style={{
              fontSize: '15px',
              fontWeight: 700,
              color: atLimit ? 'var(--error-light)' : 'var(--text-primary)',
            }}>
              {ruleCount} / {maxRoutes}
            </span>
          </div>
          <div style={{
            height: '6px',
            borderRadius: '3px',
            background: 'var(--bg-tertiary)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${usagePercent}%`,
              borderRadius: '3px',
              background: atLimit
                ? 'var(--error)'
                : usagePercent > 75
                  ? '#f59e0b'
                  : 'var(--primary)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
        {atLimit && (
          <Link
            href="/dashboard/billing"
            style={{
              fontSize: '14px',
              color: 'var(--primary-light)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
          >
            Upgrade Plan →
          </Link>
        )}
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
        fontSize: '15px',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>How rules work:</strong> Rules are matched by route and
        evaluated from highest to lowest priority. If no rule matches a request, the default limit for your plan is
        used. Changes take effect within 60 seconds.
        {planInfo && !planInfo.limits.priorityAllowed && (
          <span style={{ display: 'block', marginTop: '6px', color: 'var(--warning-light, #f59e0b)' }}>
            💡 Custom rule priority is available on the Enterprise plan.
          </span>
        )}
      </div>

      {showForm && (
        <RuleForm rule={editingRule} onClose={handleClose} />
      )}
    </>
  );
}

