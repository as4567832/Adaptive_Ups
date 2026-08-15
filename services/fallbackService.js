const { DEFAULT_SENSOR_DATA, DEFAULT_SETTINGS } = require("../utils/constants");

let switchState = false;
let loads = {
  load1: true,
  load2: true
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
  return loads;
}

function hasLoadId(id) {
  return Object.prototype.hasOwnProperty.call(loads, id);
}

function toggleLoad(id) {
  loads[id] = !loads[id];
  return loads[id];
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
