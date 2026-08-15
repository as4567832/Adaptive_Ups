const DEFAULT_SENSOR_DATA = {
  temperature: 25,
  humidity: 50,
  distance: 100,
  battery: 100,
  inputVoltage: 220
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
