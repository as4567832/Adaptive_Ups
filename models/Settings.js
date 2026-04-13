const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    lowBatteryThreshold: { type: Number, default: 20 },
    criticalThreshold: { type: Number, default: 10 },
    priorityLoad: { type: String, default: "load1" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
