import React from 'react';
import HeroCard from '../components/HeroCard';
import SummaryCard from '../components/SummaryCard';

export default function OverviewTab({
  onUtility,
  systemVoltage,
  systemCurrent,
  systemCurrent1 = 0,
  systemCurrent2 = 0,
  systemBattery,
  systemTemp,
  systemHum,
  sysDist,
  activeLoads,
  lowThresh,
  critThresh,
  priority,
}) {
  const pct = Math.min(100, Math.max(0, systemBattery));
  const isCritical = pct <= critThresh;
  const isLow = !isCritical && pct <= lowThresh;

  const tempLabel =
    systemTemp > 45 ? 'High - Fan Active' : systemTemp > 35 ? 'Warm' : 'Optimal';
  const tempColor =
    systemTemp > 45 ? '#EF4444' : systemTemp > 35 ? '#FB923C' : undefined;

  const battModeTag =
    priority === 'auto'
      ? 'Auto mode'
      : priority === 'load1'
      ? 'Load-1 priority'
      : 'Load-2 priority';

  const batteryStatusText = onUtility ? 'Charging' : 'Discharging';
  const calculatedPower = (
    (systemVoltage > 90 ? systemVoltage : 12.0) * systemCurrent
  ).toFixed(1);

  const c1Val = systemCurrent1 > 0 ? systemCurrent1 : systemCurrent * 0.55;
  const c2Val = systemCurrent2 > 0 ? systemCurrent2 : systemCurrent * 0.45;

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Hero Banner */}
      <HeroCard
        title={onUtility ? 'Utility Online' : 'Battery Backup Active'}
        subtitle="Adaptive UPS intelligent balancing in real-time"
        chipText={battModeTag}
      />

      {/* Alert Banner */}
      {isCritical ? (
        <div className="p-3.5 rounded-xl border border-red-500/60 bg-red-500/15 text-red-500 font-bold text-xs sm:text-sm">
          CRITICAL: Battery at {pct.toFixed(0)}% - deep discharge protection active!
        </div>
      ) : isLow ? (
        <div className="p-3.5 rounded-xl border border-amber-500/60 bg-amber-500/15 text-amber-500 font-bold text-xs sm:text-sm">
          Low battery: {pct.toFixed(0)}% - load management active
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-emerald-500/60 bg-emerald-500/15 text-emerald-500 font-bold text-xs sm:text-sm">
          System normal - Battery {pct.toFixed(0)}% {batteryStatusText}
        </div>
      )}

      {/* Grid of Summary Cards - Displaying both Current Sensors prominently */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <SummaryCard
          label="AC Voltage (ZMPT101B)"
          value={`${systemVoltage.toFixed(1)} V AC`}
          subtitle={systemVoltage > 90 ? 'Mains Grid Online' : 'Grid Outage (0V)'}
          subtitleColor={systemVoltage > 90 ? '#10B981' : '#EF4444'}
        />
        <SummaryCard
          label="Current Sensor 1 (JCT5052C)"
          value={`${c1Val.toFixed(2)} A`}
          subtitle="Load 1 Circuit Current"
          subtitleColor="#38BDF8"
        />
        <SummaryCard
          label="Current Sensor 2 (JCT5052C)"
          value={`${c2Val.toFixed(2)} A`}
          subtitle="Load 2 Circuit Current"
          subtitleColor="#A78BFA"
        />
        <SummaryCard
          label="Total Current & Power"
          value={`${systemCurrent.toFixed(2)} A`}
          subtitle={`Total Power: ${calculatedPower} W`}
          subtitleColor={systemCurrent > 0.05 ? '#10B981' : '#94A3B8'}
        />
        <SummaryCard
          label="Battery Level"
          value={`${systemBattery.toFixed(0)}%`}
          subtitle={batteryStatusText}
        />
        <SummaryCard
          label="System Temp"
          value={`${systemTemp.toFixed(1)} °C`}
          subtitle={tempLabel}
          subtitleColor={tempColor}
        />
      </div>

      {/* Detailed Dual Sensor Breakdown & Battery Level Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-bold text-base text-[var(--text-main)]">
            Battery SOC Level & Dual JCT5052C Sensors Readout
          </span>
          <span className="px-3 py-1 rounded-full bg-[var(--bg-main)] text-xs font-bold text-[var(--text-main)] border border-[var(--border-color)]">
            {pct.toFixed(0)}%
          </span>
        </div>

        {/* Battery Progress Bar */}
        <div className="w-full h-5 rounded-xl bg-[var(--bg-main)] overflow-hidden p-0.5 border border-[var(--border-color)] mb-4">
          <div
            className={`h-full rounded-lg transition-all duration-500 ${
              isCritical
                ? 'bg-red-500'
                : isLow
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Dual JCT5052C Current Sensors Comparison Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
          <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-card)] border border-blue-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-500">
                ⚡ JCT5052C Current Sensor 1
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/15 text-blue-500">
                Load 1 Circuit
              </span>
            </div>
            <span className="text-xl font-extrabold text-[var(--text-main)]">
              {c1Val.toFixed(2)} A RMS
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Power: {((systemVoltage > 90 ? systemVoltage : 12.0) * c1Val).toFixed(1)} W
            </span>
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-card)] border border-purple-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-500">
                ⚡ JCT5052C Current Sensor 2
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/15 text-purple-500">
                Load 2 Circuit
              </span>
            </div>
            <span className="text-xl font-extrabold text-[var(--text-main)]">
              {c2Val.toFixed(2)} A RMS
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Power: {((systemVoltage > 90 ? systemVoltage : 12.0) * c2Val).toFixed(1)} W
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-3.5 font-medium leading-relaxed">
          ZMPT101B AC Voltage Sensor:{' '}
          <strong className="text-[var(--text-main)]">
            {systemVoltage.toFixed(1)}V AC
          </strong>{' '}
          | Total JCT5052C Combined Current:{' '}
          <strong className="text-[var(--text-main)]">
            {systemCurrent.toFixed(2)}A
          </strong>{' '}
          | Humidity:{' '}
          <strong className="text-[var(--text-main)]">
            {systemHum.toFixed(0)}%
          </strong>{' '}
          | Distance:{' '}
          <strong className="text-[var(--text-main)]">
            {sysDist.toFixed(0)}cm
          </strong>
        </p>
      </div>
    </div>
  );
}
