const { DEFAULT_SENSOR_DATA, DEFAULT_SETTINGS } = require("../utils/constants");

let switchState = false;
let loads = {
  load1: true,
  load2: true,
  supply: true
};
let latestSensorData = { ...DEFAULT_SENSOR_DATA };
let settingsFallback = { ...DEFAULT_SETTINGS };

function toggleSwitchState() {
  switchState = !switchState;
  return switchState;
}

function getSwitchState() {
  return switchState;
}

function getLoads() {
  return {
    ...loads,
    source: loads.supply
  };
}

function hasLoadId(id) {
  if (id === 'source' || id === '3' || id === 3) return true;
  return Object.prototype.hasOwnProperty.call(loads, id);
}

function toggleLoad(id) {
  let target = id;
  if (id === 'source' || id === '3' || id === 3) target = 'supply';
  if (id === '1' || id === 1) target = 'load1';
  if (id === '2' || id === 2) target = 'load2';

  if (Object.prototype.hasOwnProperty.call(loads, target)) {
    loads[target] = !loads[target];
    return loads[target];
  }
  return false;
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
  toggleLoad,
  setLatestSensorData,
  getLatestSensorData,
  getSettingsFallback,
  updateSettingsFallback
};
