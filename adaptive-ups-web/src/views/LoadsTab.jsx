import React from 'react';
import HeroCard from '../components/HeroCard';
import RelayTile from '../components/RelayTile';
import {
  Power,
  Zap,
  Lightbulb,
  Cpu,
  CheckCheck,
  PowerOff,
  Bot,
  PlugZap,
  BatteryCharging,
  Battery,
  ZapOff,
} from 'lucide-react';

export default function LoadsTab({
  supplyOn,
  load1On,
  load2On,
  battSupplyOn = true,
  chargerOn = true,
  espOnline,
  autoLoadSheddingEnabled,
  onToggleAutoShedding,
  pendingRelayId,
  onSetRelayState,
  onBatchSetLoads,
  priority,
  onSetPriority,
}) {
  const chipText = `Grid: ${supplyOn ? 'ON' : 'OFF'} | Batt DC: ${battSupplyOn ? 'ON' : 'OFF'} | Charger: ${chargerOn ? 'ON' : 'OFF'}`;

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Hero Banner */}
      <HeroCard
        title="Full 5-Relay Control Center"
        subtitle="Direct hardware management over Mains, Inverter, Battery Supply, Charger & Load Relays"
        chipText={chipText}
      />

      {/* Relay Control Center Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap mb-2">
          <h3 className="text-lg font-extrabold text-[var(--text-main)]">
            Relay Control Center (5 Relays)
          </h3>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              espOnline
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                : 'bg-amber-500/15 border-amber-500 text-amber-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                espOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {espOnline ? 'ESP32 Online' : 'ESP32 Offline'}
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-4">
          Direct bidirectional hardware control over Relays 1, 2, 3, 4 & 5 via Cloud & ESP32.
        </p>

        {/* Automated Load Shedding Switch */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Bot
              className={`w-5 h-5 ${
                autoLoadSheddingEnabled ? 'text-emerald-500' : 'text-slate-400'
              }`}
            />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                Automated Load Shedding
              </h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)]">
                {autoLoadSheddingEnabled
                  ? 'Enabled: Auto-sheds Load 2 when on battery'
                  : 'Disabled: 100% manual control over all 5 relays'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoLoadSheddingEnabled}
              onChange={(e) => onToggleAutoShedding(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-400/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* 5 RELAYS LIST */}
        <div className="flex flex-col gap-3">
          {/* RELAY 1: MAINS GRID CUTOFF RELAY */}
          <RelayTile
            title="Relay 1: Mains Grid Cutoff Relay (GPIO 18)"
            subtitle={
              supplyOn
                ? 'Active: MAINS GRID ONLINE (230V AC Mains Supply Active)'
                : 'Active: MAINS GRID ISOLATED (Grid Cutoff Active)'
            }
            icon={supplyOn ? Power : Zap}
            iconColor={supplyOn ? '#10B981' : '#F59E0B'}
            stateText={supplyOn ? 'MAINS ONLINE' : 'GRID ISOLATED'}
            stateColor={supplyOn ? '#10B981' : '#F59E0B'}
            value={supplyOn}
            isPending={pendingRelayId === 'source'}
            onChanged={(val) => onSetRelayState('source', val)}
            actions={
              <>
                <button
                  disabled={supplyOn}
                  onClick={() => onSetRelayState('source', true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer transition ${
                    supplyOn
                      ? 'opacity-50 border-emerald-500/50 text-emerald-500'
                      : 'border-[var(--border-color)] hover:bg-emerald-500/10 text-[var(--text-main)]'
                  }`}
                >
                  <PlugZap className="w-3.5 h-3.5" />
                  <span>Set Mains</span>
                </button>
                <button
                  disabled={!supplyOn}
                  onClick={() => onSetRelayState('source', false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer transition ${
                    !supplyOn
                      ? 'opacity-50 border-amber-500/50 text-amber-500'
                      : 'border-[var(--border-color)] hover:bg-amber-500/10 text-[var(--text-main)]'
                  }`}
                >
                  <BatteryCharging className="w-3.5 h-3.5" />
                  <span>Set Inverter</span>
                </button>
              </>
            }
          />

          {/* RELAY 2: INVERTER CUTOFF RELAY */}
          <RelayTile
            title="Relay 2: Inverter Cutoff Relay (GPIO 5)"
            subtitle="Inverter AC Backup Cutoff • Priority Supply Relay"
            icon={Lightbulb}
            iconColor={load1On ? '#38BDF8' : '#94A3B8'}
            stateText={load1On ? 'INVERTER ACTIVE (ON)' : 'INVERTER CUTOFF (OFF)'}
            stateColor={load1On ? '#38BDF8' : '#94A3B8'}
            value={load1On}
            isPending={pendingRelayId === 'load1'}
            onChanged={(val) => onSetRelayState(1, val)}
          />

          {/* RELAY 3: LOAD OUTPUT CIRCUIT RELAY */}
          <RelayTile
            title="Relay 3: Load Output Relay (GPIO 15)"
            subtitle="Load Output Circuit Cutoff • Secondary Circuit"
            icon={Cpu}
            iconColor={load2On ? '#A78BFA' : '#94A3B8'}
            stateText={load2On ? 'LOAD CONNECTED (ON)' : 'LOAD CUTOFF (OFF)'}
            stateColor={load2On ? '#A78BFA' : '#94A3B8'}
            value={load2On}
            isPending={pendingRelayId === 'load2'}
            onChanged={(val) => onSetRelayState(2, val)}
          />

          {/* RELAY 4: BATTERY-TO-INVERTER DC SUPPLY RELAY */}
          <RelayTile
            title="Relay 4: Battery-to-Inverter DC Relay (GPIO 19)"
            subtitle="Controls whether Battery supplies DC voltage to Inverter"
            icon={Battery}
            iconColor={battSupplyOn ? '#10B981' : '#EF4444'}
            stateText={battSupplyOn ? 'DC SUPPLY ACTIVE (ON)' : 'DC SUPPLY CUTOFF (OFF)'}
            stateColor={battSupplyOn ? '#10B981' : '#EF4444'}
            value={battSupplyOn}
            isPending={pendingRelayId === 'battSupply'}
            onChanged={(val) => onSetRelayState(4, val)}
          />

          {/* RELAY 5: BATTERY CHARGER CONTROL RELAY */}
          <RelayTile
            title="Relay 5: Battery Charger Relay (GPIO 21)"
            subtitle="Controls whether Inverter/Mains charges the Battery"
            icon={BatteryCharging}
            iconColor={chargerOn ? '#F59E0B' : '#94A3B8'}
            stateText={chargerOn ? 'CHARGER ACTIVE (ON)' : 'CHARGER CUTOFF (OFF)'}
            stateColor={chargerOn ? '#F59E0B' : '#94A3B8'}
            value={chargerOn}
            isPending={pendingRelayId === 'charger'}
            onChanged={(val) => onSetRelayState(5, val)}
          />
        </div>

        {/* Batch Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => onBatchSetLoads(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>All Relays ON</span>
          </button>
          <button
            onClick={() => onBatchSetLoads(false)}
            className="py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-500 font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <PowerOff className="w-4 h-4" />
            <span>All Relays OFF</span>
          </button>
        </div>
      </div>

      {/* Priority Selection Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <h3 className="text-base font-extrabold text-[var(--text-main)] mb-3">
          Battery Mode - Priority Selection
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'auto', label: 'Auto (Load-1 default)' },
            { id: 'load1', label: 'Load-1 Priority' },
            { id: 'load2', label: 'Load-2 Priority' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => onSetPriority(chip.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                priority === chip.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-blue-500/10'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
