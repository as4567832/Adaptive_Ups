import React from 'react';
import { Zap } from 'lucide-react';

export default function HeroCard({ title, subtitle, chipText }) {
  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/20 shadow-md flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
          <Zap className="w-7 h-7 fill-current" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[var(--text-main)] leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)]/80 border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] shadow-sm shrink-0">
        {chipText}
      </div>
    </div>
  );
}
