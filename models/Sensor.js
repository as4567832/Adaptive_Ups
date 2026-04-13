const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
  temperature: { type: Number, default: 0 },
  humidity: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  battery: { type: Number, default: 0 },
  inputVoltage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Sensor", SensorSchema);
