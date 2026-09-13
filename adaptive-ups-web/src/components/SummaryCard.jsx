import React from 'react';

export default function SummaryCard({ label, value, subtitle, subtitleColor }) {
  return (
    <div className="rounded-2xl p-4 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm transition-all hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <h3 className="text-2xl font-extrabold mt-1 text-[var(--text-main)] tracking-tight">
        {value}
      </h3>
      <p
        className="text-xs font-semibold mt-1.5"
        style={{ color: subtitleColor || 'var(--text-muted)' }}
      >
        {subtitle}
      </p>
    </div>
  );
}
