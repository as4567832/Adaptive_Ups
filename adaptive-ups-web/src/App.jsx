import React, { useState, useEffect, useRef, useCallback } from 'react';
import OverviewTab from './views/OverviewTab';
import LoadsTab from './views/LoadsTab';
import ControlsTab from './views/ControlsTab';
import LogsTab from './views/LogsTab';
import {
  LayoutDashboard,
  Power,
  Sliders,
  FileText,
  Moon,
  Sun,
  Zap,
} from 'lucide-react';
import { primaryApi, fallbackApi } from './services/apiService';

function getCurrentTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function App() {
  // Screen state: 'dashboard' directly
  const [screen, setScreen] = useState('dashboard');

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('ups-theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ups-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Dashboard state
  const [tabIndex, setTabIndex] = useState(0);
  const [clock, setClock] = useState(getCurrentTime);

  const [battPct, setBattPct] = useState(78);
  const [onUtility, setOnUtility] = useState(true);
  const [priority, setPriority] = useState('load1');

  const [manualL1, setManualL1] = useState(true);
  const [manualL2, setManualL2] = useState(true);
  const [manualSupply, setManualSupply] = useState(true);
  const [load1On, setLoad1On] = useState(true);
  const [load2On, setLoad2On] = useState(true);
  const [supplyOn, setSupplyOn] = useState(true);
  const [battSupplyOn, setBattSupplyOn] = useState(true);
  const [chargerOn, setChargerOn] = useState(true);

  const [systemTemp, setSystemTemp] = useState(28.5);
  const [systemHum, setSystemHum] = useState(45);
  const [sysDist, setSysDist] = useState(12);
  const [systemBattery, setSystemBattery] = useState(78);
  const [systemVoltage, setSystemVoltage] = useState(224);
  const [systemCurrent, setSystemCurrent] = useState(0.45);
  const [systemCurrent1, setSystemCurrent1] = useState(0.25);
  const [systemCurrent2, setSystemCurrent2] = useState(0.20);

  const [lowThresh, setLowThresh] = useState(20);
  const [critThresh, setCritThresh] = useState(10);

  const [espMessage, setEspMessage] = useState('');
  const [espOnline, setEspOnline] = useState(false);
  const [autoLoadSheddingEnabled, setAutoLoadSheddingEnabled] = useState(false);
  const [pendingRelayId, setPendingRelayId] = useState(null);

  const [logs, setLogs] = useState([]);

  const prevBatteryMode = useRef('normal');
  const isToggling = useRef(false);
  const busySync = useRef(false);

  const addLog = useCallback((message, type = 'info') => {
    setLogs((prev) => [
      { time: getCurrentTime(), message, type },
      ...prev.slice(0, 39),
    ]);
  }, []);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial log
  useEffect(() => {
    addLog('System initialised - React Web frontend connected', 'ok');
  }, [addLog]);

  // Fetch Loads
  const fetchLoads = useCallback(async () => {
    if (isToggling.current) return;
    try {
      let loads;
      try {
        loads = await primaryApi.fetchLoads();
      } catch {
        loads = await fallbackApi.fetchLoads();
      }
      if (isToggling.current) return;

      setManualL1(loads.load1);
      setManualL2(loads.load2);
      setManualSupply(loads.supply);
      setSupplyOn(loads.supply);
      setLoad1On(loads.load1);
      setLoad2On(loads.load2);
      setBattSupplyOn(loads.battSupply);
      setChargerOn(loads.charger);
      setEspOnline(loads.espOnline);
    } catch {
      // Ignore transient polling errors
    }
  }, []);

  // Fetch Sensor & Settings Data
  const fetchFromBackend = useCallback(async () => {
    try {
      let sensor, settings;
      try {
        sensor = await primaryApi.fetchSensorData();
        settings = await primaryApi.fetchSettings();
      } catch {
        sensor = await fallbackApi.fetchSensorData();
        settings = await fallbackApi.fetchSettings();
      }

      setSystemTemp(sensor.temperature);
      setSystemHum(sensor.humidity);
      setSysDist(sensor.distance);
      setSystemBattery(sensor.battery);
      setSystemVoltage(sensor.inputVoltage);
      setSystemCurrent(sensor.current);
      setSystemCurrent1(sensor.current1 || 0);
      setSystemCurrent2(sensor.current2 || 0);
      setBattPct(sensor.battery);

      setLowThresh(settings.lowBatteryThreshold);
      setCritThresh(settings.criticalThreshold);
      setPriority(settings.priorityLoad);

      setEspMessage(
        `Realtime sync at ${getCurrentTime()} • ${
          espOnline ? 'ESP32 Online' : 'Cloud Active'
        }`
      );
    } catch {
      setEspMessage('Backend offline (Check network/server)');
    }
  }, [espOnline]);

  // Automation Logic
  const applyAutomationLogic = useCallback(() => {
    const low = lowThresh;
    const crit = critThresh;
    let mode = 'normal';

    const currentlyOnUtility = supplyOn && systemVoltage > 50;
    setOnUtility(currentlyOnUtility);

    if (autoLoadSheddingEnabled && !currentlyOnUtility && battPct > 0) {
      if (battPct <= crit && load2On && !isToggling.current) {
        mode = 'critical';
        handleSetRelayState(2, false);
      } else if (battPct <= low && !isToggling.current) {
        mode = 'low';
        if (priority === 'load2' && load1On) {
          handleSetRelayState(1, false);
        } else if (priority !== 'load2' && load2On) {
          handleSetRelayState(2, false);
        }
      }
    }

    if (prevBatteryMode.current !== mode) {
      if (mode === 'critical') {
        addLog('CRITICAL: Auto-shedding engaged - Load-2 OFF', 'crit');
      } else if (mode === 'low') {
        const active = priority === 'load2' ? 'Load-2' : 'Load-1';
        addLog(`Low battery - Auto shedding ${active} priority`, 'warn');
      }
      prevBatteryMode.current = mode;
    }
  }, [
    lowThresh,
    critThresh,
    supplyOn,
    systemVoltage,
    autoLoadSheddingEnabled,
    battPct,
    load1On,
    load2On,
    priority,
    addLog,
  ]);

  // Polling loop
  useEffect(() => {
    if (screen !== 'dashboard') return;

    const poll = async () => {
      await Promise.all([fetchFromBackend(), fetchLoads()]);
      applyAutomationLogic();
    };

    poll();
    const timer = setInterval(poll, 1000);
    return () => clearInterval(timer);
  }, [screen, fetchFromBackend, fetchLoads, applyAutomationLogic]);

  // Relay control handler
  const handleSetRelayState = async (id, targetState = null) => {
    if (isToggling.current) return;
    isToggling.current = true;

    const isSource =
      id === 3 || id === '3' || id === 'supply' || id === 'source';
    const isL1 = id === 1 || id === '1' || id === 'load1';
    const isL2 = id === 2 || id === '2' || id === 'load2';
    const isBattSupply = id === 4 || id === '4' || id === 'battSupply' || id === 'battery';
    const isCharger = id === 5 || id === '5' || id === 'charger';

    const relayTag = isSource
      ? 'source'
      : isL1
      ? 'load1'
      : isL2
      ? 'load2'
      : isBattSupply
      ? 'battSupply'
      : 'charger';

    const prevL1 = load1On;
    const prevL2 = load2On;
    const prevSupply = supplyOn;
    const prevBattSupply = battSupplyOn;
    const prevCharger = chargerOn;

    const desired =
      targetState !== null
        ? targetState
        : isSource
        ? !supplyOn
        : isL1
        ? !load1On
        : isL2
        ? !load2On
        : isBattSupply
        ? !battSupplyOn
        : !chargerOn;

    setPendingRelayId(relayTag);

    // Optimistic UI update
    if (isL1) {
      setManualL1(desired);
      setLoad1On(desired);
    } else if (isL2) {
      setManualL2(desired);
      setLoad2On(desired);
    } else if (isSource) {
      setManualSupply(desired);
      setSupplyOn(desired);
    } else if (isBattSupply) {
      setBattSupplyOn(desired);
    } else if (isCharger) {
      setChargerOn(desired);
    }

    try {
      let state;
      try {
        state = await primaryApi.setLoadState(id, desired);
      } catch {
        state = await fallbackApi.setLoadState(id, desired);
      }

      if (isL1) {
        setManualL1(state);
        setLoad1On(state);
      } else if (isL2) {
        setManualL2(state);
        setLoad2On(state);
      } else if (isSource) {
        setManualSupply(state);
        setSupplyOn(state);
      } else if (isBattSupply) {
        setBattSupplyOn(state);
      } else if (isCharger) {
        setChargerOn(state);
      }

      const label = isSource
        ? 'Mains Grid Cutoff Relay (GPIO 18)'
        : isL1
        ? 'Load 1 Circuit Relay (GPIO 5)'
        : isL2
        ? 'Load 2 Circuit Relay (GPIO 15)'
        : isBattSupply
        ? 'Battery-to-Inverter DC Relay (GPIO 19)'
        : 'Battery Charger Relay (GPIO 21)';
      const statusStr = state ? 'ACTIVE (ON)' : 'ISOLATED (OFF)';
      addLog(`${label} switched to ${statusStr}`, 'ok');
    } catch {
      // Revert optimistic change on network error
      setLoad1On(prevL1);
      setLoad2On(prevL2);
      setSupplyOn(prevSupply);
      setBattSupplyOn(prevBattSupply);
      setChargerOn(prevCharger);
      setManualL1(prevL1);
      setManualL2(prevL2);
      setManualSupply(prevSupply);
      const label = isSource
        ? 'Mains Grid Relay'
        : isL1
        ? 'Load 1 Relay'
        : isL2
        ? 'Load 2 Relay'
        : isBattSupply
        ? 'Battery Supply Relay'
        : 'Battery Charger Relay';
      addLog(`Failed to switch ${label}: Network error`, 'crit');
    } finally {
      setPendingRelayId(null);
      setTimeout(() => {
        isToggling.current = false;
      }, 600);
    }
  };

  // Batch set loads
  const handleBatchSetLoads = async (state) => {
    setLoad1On(state);
    setLoad2On(state);
    setManualL1(state);
    setManualL2(state);
    try {
      await primaryApi.batchSetLoads({ load1: state, load2: state });
      addLog(`All loads set to ${state ? 'CONNECTED' : 'ISOLATED'}`, 'ok');
    } catch {
      addLog('Batch command failed: Network error', 'crit');
    }
  };

  // Sync settings
  const handleSyncSettings = async () => {
    if (busySync.current) return;
    busySync.current = true;
    try {
      await primaryApi.upsertSettings({
        lowBatteryThreshold: lowThresh,
        criticalThreshold: critThresh,
        priorityLoad: priority,
      });
      setEspMessage('Settings synced to MongoDB');
    } catch {
      setEspMessage('Failed to sync settings to DB');
    } finally {
      busySync.current = false;
    }
  };

  // Set priority
  const handleSetPriority = async (next) => {
    setPriority(next);
    const label =
      next === 'auto'
        ? 'Auto (default Load-1)'
        : next === 'load1'
        ? 'Load-1'
        : 'Load-2';
    addLog(`Priority set to: ${label}`, 'ok');

    await primaryApi
      .upsertSettings({
        lowBatteryThreshold: lowThresh,
        criticalThreshold: critThresh,
        priorityLoad: next,
      })
      .catch(() => {});
  };

  // Simulation handlers
  const handleSimEnvUpdate = async (temp, hum, dist) => {
    try {
      await primaryApi.updateEnvironment({
        temperature: temp,
        humidity: hum,
        distance: dist,
        battery: systemBattery,
        inputVoltage: systemVoltage,
        current: systemCurrent,
      });
    } catch {
      setEspMessage('Failed to send environment update');
    }
  };

  const handleSimulatePowerFailure = () => {
    setOnUtility(false);
    setSystemVoltage(0.0);
    handleSimEnvUpdate(systemTemp, systemHum, sysDist);
    applyAutomationLogic();
  };

  const handleRestoreUtility = () => {
    setOnUtility(true);
    setSystemVoltage(220.0);
    handleSimEnvUpdate(systemTemp, systemHum, sysDist);
    applyAutomationLogic();
  };

  const handleDrainBattery = () => {
    const next = Math.max(0, battPct - 10);
    setBattPct(next);
    setSystemBattery(next);
    applyAutomationLogic();
  };

  const handleChargeBattery = () => {
    const next = Math.min(100, battPct + 10);
    setBattPct(next);
    setSystemBattery(next);
    applyAutomationLogic();
  };

  const handleTempUp = () => {
    const next = systemTemp + 1;
    setSystemTemp(next);
    handleSimEnvUpdate(next, systemHum, sysDist);
  };

  const handleTempDown = () => {
    const next = systemTemp - 1;
    setSystemTemp(next);
    handleSimEnvUpdate(next, systemHum, sysDist);
  };

  const handleHumidityUp = () => {
    const next = (systemHum + 5) % 105;
    setSystemHum(next);
    handleSimEnvUpdate(systemTemp, next, sysDist);
  };

  const activeLoadsCount = (load1On ? 1 : 0) + (load2On ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      {/* Top AppBar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <h1 className="text-base sm:text-lg font-black tracking-tight">
            A-UPS Smart Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs sm:text-sm font-extrabold text-[var(--text-muted)] bg-[var(--bg-main)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
            {clock}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--border-color)]/30 text-[var(--text-main)] transition cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 pb-24 sm:pb-28">
        {tabIndex === 0 && (
          <OverviewTab
            onUtility={onUtility}
            systemVoltage={systemVoltage}
            systemCurrent={systemCurrent}
            systemCurrent1={systemCurrent1}
            systemCurrent2={systemCurrent2}
            systemBattery={systemBattery}
            systemTemp={systemTemp}
            systemHum={systemHum}
            sysDist={sysDist}
            activeLoads={activeLoadsCount}
            lowThresh={lowThresh}
            critThresh={critThresh}
            priority={priority}
          />
        )}

        {tabIndex === 1 && (
          <LoadsTab
            supplyOn={supplyOn}
            load1On={load1On}
            load2On={load2On}
            battSupplyOn={battSupplyOn}
            chargerOn={chargerOn}
            espOnline={espOnline}
            autoLoadSheddingEnabled={autoLoadSheddingEnabled}
            onToggleAutoShedding={setAutoLoadSheddingEnabled}
            pendingRelayId={pendingRelayId}
            onSetRelayState={handleSetRelayState}
            onBatchSetLoads={handleBatchSetLoads}
            priority={priority}
            onSetPriority={handleSetPriority}
          />
        )}

        {tabIndex === 2 && (
          <ControlsTab
            onUtility={onUtility}
            lowThresh={lowThresh}
            critThresh={critThresh}
            onLowThreshChange={setLowThresh}
            onCritThreshChange={setCritThresh}
            onSyncSettings={handleSyncSettings}
            espMessage={espMessage}
            onSimulatePowerFailure={handleSimulatePowerFailure}
            onRestoreUtility={handleRestoreUtility}
            onDrainBattery={handleDrainBattery}
            onChargeBattery={handleChargeBattery}
            onTempUp={handleTempUp}
            onTempDown={handleTempDown}
            onHumidityUp={handleHumidityUp}
          />
        )}

        {tabIndex === 3 && (
          <LogsTab
            logs={logs}
            onClearLogs={() => setLogs([])}
            apiBase={primaryApi.baseUrl}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg">
        <nav className="glass-panel rounded-2xl p-1.5 shadow-2xl flex items-center justify-around border border-[var(--glass-border)]">
          {[
            { id: 0, label: 'Overview', icon: LayoutDashboard },
            { id: 1, label: 'Loads', icon: Power },
            { id: 2, label: 'Controls', icon: Sliders },
            { id: 3, label: 'Logs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = tabIndex === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabIndex(tab.id)}
                className={`flex-1 py-2 px-3 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white font-extrabold shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-blue-500/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
