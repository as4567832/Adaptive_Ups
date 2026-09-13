import React from 'react';
import HeroCard from '../components/HeroCard';

export default function LogsTab({ logs, onClearLogs, apiBase }) {
  const getLogColor = (type) => {
    switch (type) {
      case 'crit':
        return 'text-red-500';
      case 'warn':
        return 'text-amber-500';
      case 'ok':
        return 'text-emerald-500';
      default:
        return 'text-[var(--text-main)]';
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Hero Banner */}
      <HeroCard
        title="System History"
        subtitle="Realtime event trail and backend communication state"
        chipText={logs.length === 0 ? 'No events' : `${logs.length} events`}
      />

      {/* Event Log Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-extrabold text-[var(--text-main)]">
            Event Log
          </h3>
          <button
            onClick={onClearLogs}
            className="px-3 py-1 text-xs font-bold text-blue-500 hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
          >
            Clear Log
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic py-6 text-center">
            No events logged yet.
          </p>
        ) : (
          <div className="h-60 overflow-y-auto pr-1 flex flex-col divide-y divide-[var(--border-color)]/40">
            {logs.map((item, idx) => (
              <div key={idx} className="py-2 flex items-start gap-3 text-xs font-medium">
                <span className="font-mono text-[var(--text-muted)] shrink-0 w-16 sm:w-20">
                  {item.time}
                </span>
                <span className={`flex-1 font-semibold ${getLogColor(item.type)}`}>
                  {item.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-[var(--text-muted)] px-1">
        Backend: <code className="font-mono bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">{apiBase}</code>
      </p>
    </div>
  );
}
