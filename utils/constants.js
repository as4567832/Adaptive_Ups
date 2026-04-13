const DEFAULT_SENSOR_DATA = {
  temperature: 0,
  humidity: 0,
  distance: 0,
  battery: 0,
  inputVoltage: 0
};
const DEFAULT_SETTINGS = {
  lowBatteryThreshold: 20,
  criticalThreshold: 10,
  priorityLoad: "load1"
};

module.exports = {
  DEFAULT_SENSOR_DATA,
  DEFAULT_SETTINGS
};
