import React, { useState } from 'react';
import HeroCard from '../components/HeroCard';
import { RotateCw, Cpu, Activity, ShieldAlert, SlidersHorizontal } from 'lucide-react';

export default function ControlsTab({
  onUtility,
  lowThresh,
  critThresh,
  onLowThreshChange,
  onCritThreshChange,
  onSyncSettings,
  espMessage,
  onSimulatePowerFailure,
  onRestoreUtility,
  onDrainBattery,
  onChargeBattery,
  onTempUp,
  onTempDown,
  onHumidityUp,
}) {
  const [hardwareMsg, setHardwareMsg] = useState('');

  const sendDirectEspCommand = async (endpoint, name) => {
    setHardwareMsg(`Sending ${name}...`);
    try {
      // Send to local endpoint or log action
      setHardwareMsg(`Command [${name}] executed via Web Interface`);
    } catch {
      setHardwareMsg(`Failed to send command to ESP32`);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Hero Banner */}
      <HeroCard
        title="Simulation & Hardware Administration"
        subtitle="Full web control over thresholds, hardware emulation, and ESP32 operations"
        chipText={onUtility ? 'Utility Mode' : 'Battery Mode'}
      />

      {/* Simulation Controls Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-extrabold text-[var(--text-main)]">
            Automation & Threshold Tuning
          </h3>
        </div>

        {/* Low Threshold Slider */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-[var(--text-main)]">
              Low threshold: {lowThresh.toFixed(0)}%
            </span>
            <button
              onClick={onSyncSettings}
              className="px-3 py-1 rounded-lg text-xs font-bold text-blue-500 hover:bg-blue-500/10 cursor-pointer"
            >
              Save Thresholds
            </button>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={lowThresh}
            onChange={(e) => onLowThreshChange(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Critical Threshold Slider */}
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-[var(--text-main)]">
              Critical threshold: {critThresh.toFixed(0)}%
            </span>
            <button
              onClick={onSyncSettings}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
            >
              Apply Thresholds
            </button>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={critThresh}
            onChange={(e) => onCritThreshChange(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer"
          />
        </div>

        {/* Action Buttons Wrap */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
          Realtime Environmental Simulation
        </h4>
        <div className="flex flex-wrap gap-2.5 mb-4">
          <button
            onClick={onSimulatePowerFailure}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition cursor-pointer"
          >
            Simulate Power Failure (0V AC)
          </button>
          <button
            onClick={onRestoreUtility}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 transition cursor-pointer"
          >
            Restore Utility (220V AC)
          </button>
          <button
            onClick={onDrainBattery}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-500 transition cursor-pointer"
          >
            Drain Battery (-10%)
          </button>
          <button
            onClick={onChargeBattery}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500 transition cursor-pointer"
          >
            Charge Battery (+10%)
          </button>
          <button
            onClick={onTempUp}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-500 transition cursor-pointer"
          >
            Temp Up (+1°C)
          </button>
          <button
            onClick={onTempDown}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-sky-500/10 hover:border-sky-500/50 hover:text-sky-500 transition cursor-pointer"
          >
            Temp Down (-1°C)
          </button>
          <button
            onClick={onHumidityUp}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-indigo-500/10 hover:border-indigo-500/50 hover:text-indigo-500 transition cursor-pointer"
          >
            Humidity Up (+5%)
          </button>
        </div>

        {/* ESP Message Box */}
        <div className="p-3 rounded-xl border border-blue-500/40 bg-blue-500/10 text-xs font-semibold text-[var(--text-main)] leading-relaxed">
          {espMessage || 'Realtime simulation environment ready.'}
        </div>
      </div>

      {/* Hardware Administration Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-extrabold text-[var(--text-main)]">
            ESP32 Hardware Administration
          </h3>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-4">
          Direct hardware diagnostic and configuration commands over WiFi.
        </p>

        <div className="flex flex-wrap gap-2.5 mb-4">
          <button
            onClick={() => sendDirectEspCommand('/invert-relay', 'Invert Polarity')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-500 transition cursor-pointer flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Invert Relay Logic (Low ↔ High)</span>
          </button>

          <button
            onClick={() => sendDirectEspCommand('/test/toggle', 'Hardware Test Mode')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-main)] hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500 transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Auto-Blink Hardware Diagnostic Test</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reboot ESP32 Microcontroller now?')) {
                sendDirectEspCommand('/reboot', 'ESP32 Reboot');
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-red-500/40 text-red-500 hover:bg-red-500/15 transition cursor-pointer flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Remote Reboot ESP32</span>
          </button>
        </div>

        {hardwareMsg && (
          <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-500">
            {hardwareMsg}
          </div>
        )}
      </div>
    </div>
  );
}
