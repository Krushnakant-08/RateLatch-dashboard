'use client';

import { useState } from 'react';

interface KeyDisplayProps {
  label: string;
  value: string;
  masked?: boolean;
}

export function KeyDisplay({ label, value, masked = true }: KeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const displayValue = masked && value.length > 16
    ? `${value.slice(0, 12)}...${value.slice(-4)}`
    : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>
        {label}
      </span>
      <code style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '13px',
        color: 'var(--primary-light)',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {displayValue}
      </code>
      <button
        onClick={handleCopy}
        className="btn btn-ghost btn-sm"
        style={{ flexShrink: 0, fontSize: '12px', padding: '4px 10px' }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
