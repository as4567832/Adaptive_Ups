const { DEFAULT_SENSOR_DATA, DEFAULT_SETTINGS } = require("../utils/constants");

let switchState = false;
let loads = {
  load1: true,
  load2: true,
  supply: true
};

let lastEspSeen = null;
let latestSensorData = { ...DEFAULT_SENSOR_DATA };
let settingsFallback = { ...DEFAULT_SETTINGS };

function toggleSwitchState() {
  switchState = !switchState;
  return switchState;
}

function getSwitchState() {
  return switchState;
}

function isEspOnline() {
  if (!lastEspSeen) return false;
  // Consider ESP online if seen within the last 15 seconds (ESP reports every 3s)
  return Date.now() - new Date(lastEspSeen).getTime() < 15000;
}

function updateEspHeartbeat() {
  lastEspSeen = new Date();
  return lastEspSeen;
}

function getLoads() {
  return {
    ...loads,
    source: loads.supply,
    espOnline: isEspOnline(),
    lastEspSeen
  };
}

function hasLoadId(id) {
  if (id === 'source' || id === '3' || id === 3 || id === 'supply') return true;
  if (id === '1' || id === 1 || id === 'load1') return true;
  if (id === '2' || id === 2 || id === 'load2') return true;
  return Object.prototype.hasOwnProperty.call(loads, id);
}

function normalizeLoadId(id) {
  if (id === 'source' || id === '3' || id === 3 || id === 'supply') return 'supply';
  if (id === '1' || id === 1 || id === 'load1') return 'load1';
  if (id === '2' || id === 2 || id === 'load2') return 'load2';
  return id;
}

function toggleLoad(id) {
  const target = normalizeLoadId(id);
  if (Object.prototype.hasOwnProperty.call(loads, target)) {
    loads[target] = !loads[target];
    return loads[target];
  }
  return false;
}

function setLoad(id, explicitState) {
  const target = normalizeLoadId(id);
  if (Object.prototype.hasOwnProperty.call(loads, target)) {
    if (typeof explicitState === "boolean") {
      loads[target] = explicitState;
    } else {
      loads[target] = !loads[target];
    }
    return loads[target];
  }
  return false;
}

function setAllLoads(newLoads) {
  if (typeof newLoads.load1 === "boolean") loads.load1 = newLoads.load1;
  if (typeof newLoads.load2 === "boolean") loads.load2 = newLoads.load2;
  if (typeof newLoads.supply === "boolean") loads.supply = newLoads.supply;
  if (typeof newLoads.source === "boolean") loads.supply = newLoads.source;
  return getLoads();
}

function setLatestSensorData(data) {
  latestSensorData = {
    temperature: Number(data.temperature),
    humidity: Number(data.humidity),
    distance: Number(data.distance),
    battery: data.battery === undefined ? latestSensorData.battery : Number(data.battery),
    inputVoltage: data.inputVoltage === undefined ? latestSensorData.inputVoltage : Number(data.inputVoltage),
    current: data.current === undefined ? (latestSensorData.current || 0) : Number(data.current)
  };

  return latestSensorData;
}

function getLatestSensorData() {
  return latestSensorData;
}

function getSettingsFallback() {
  return settingsFallback;
}

function updateSettingsFallback(data) {
  settingsFallback = { ...settingsFallback, ...data };
  return settingsFallback;
}

module.exports = {
  toggleSwitchState,
  getSwitchState,
  getLoads,
  hasLoadId,
  normalizeLoadId,
  toggleLoad,
  setLoad,
  setAllLoads,
  isEspOnline,
  updateEspHeartbeat,
  setLatestSensorData,
  getLatestSensorData,
  getSettingsFallback,
  updateSettingsFallback
};
