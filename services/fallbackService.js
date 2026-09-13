const { DEFAULT_SENSOR_DATA, DEFAULT_SETTINGS } = require("../utils/constants");

let switchState = false;
let loads = {
  load1: true,
  load2: true,
  supply: true,
  battSupply: true,
  charger: true
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

let lastAppCommandTimestamp = 0;

function touchAppCommand() {
  lastAppCommandTimestamp = Date.now();
}

function getLastAppCommandTimestamp() {
  return lastAppCommandTimestamp;
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
  if (id === '4' || id === 4 || id === 'battSupply' || id === 'battsupply' || id === 'battery') return true;
  if (id === '5' || id === 5 || id === 'charger' || id === 'charge') return true;
  return Object.prototype.hasOwnProperty.call(loads, id);
}

function normalizeLoadId(id) {
  if (id === 'source' || id === '3' || id === 3 || id === 'supply') return 'supply';
  if (id === '1' || id === 1 || id === 'load1') return 'load1';
  if (id === '2' || id === 2 || id === 'load2') return 'load2';
  if (id === '4' || id === 4 || id === 'battSupply' || id === 'battsupply' || id === 'battery') return 'battSupply';
  if (id === '5' || id === 5 || id === 'charger' || id === 'charge') return 'charger';
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
  if (typeof newLoads.battSupply === "boolean") loads.battSupply = newLoads.battSupply;
  if (typeof newLoads.charger === "boolean") loads.charger = newLoads.charger;
  return getLoads();
}

function setLatestSensorData(data) {
  const currentLoads = getLoads();

  let c1 = data.current1 !== undefined ? Number(data.current1) : (latestSensorData.current1 || 0);
  let c2 = data.current2 !== undefined ? Number(data.current2) : (latestSensorData.current2 || 0);

  if (!currentLoads.load1) c1 = 0;
  if (!currentLoads.load2) c2 = 0;

  let totalC = 0;
  if (currentLoads.load1 || currentLoads.load2) {
    totalC = data.current !== undefined ? Number(data.current) : (c1 + c2);
  }

  latestSensorData = {
    temperature: Number(data.temperature),
    humidity: Number(data.humidity),
    distance: Number(data.distance),
    battery: data.battery === undefined ? latestSensorData.battery : Number(data.battery),
    inputVoltage: data.inputVoltage === undefined ? latestSensorData.inputVoltage : Number(data.inputVoltage),
    current: totalC,
    current1: c1,
    current2: c2
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
  updateSettingsFallback,
  touchAppCommand,
  getLastAppCommandTimestamp
};
