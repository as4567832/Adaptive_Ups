import React from 'react';
import { Loader2 } from 'lucide-react';

export default function RelayTile({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  stateText,
  stateColor,
  value,
  isPending,
  onChanged,
  actions,
}) {
  return (
    <div
      className={`p-4 rounded-2xl bg-[var(--bg-card)] border transition-all ${
        value
          ? 'border-emerald-500/40 shadow-sm'
          : 'border-[var(--border-color)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${iconColor}22`, color: iconColor }}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-main)] leading-tight">
              {title}
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Toggle Switch or Loader */}
        <div className="shrink-0 flex items-center">
          {isPending ? (
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          ) : (
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChanged(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-400/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 flex items-center justify-between gap-2 border-t border-[var(--border-color)]/50">
        <span
          className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider"
          style={{ backgroundColor: `${stateColor}18`, color: stateColor }}
        >
          {stateText}
        </span>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
