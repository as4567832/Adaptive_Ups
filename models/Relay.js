const mongoose = require("mongoose");

const RelaySchema = new mongoose.Schema(
  {
    load1: { type: Boolean, default: true },
    load2: { type: Boolean, default: true },
    supply: { type: Boolean, default: true }, // true = Mains, false = Inverter
    source: { type: Boolean, default: true },
    battSupply: { type: Boolean, default: true }, // Relay 4: Controls battery voltage supply to inverter
    charger: { type: Boolean, default: true }, // Relay 5: Controls inverter battery charger
    lastEspSeen: { type: Date, default: null },
    lastAppCommand: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Relay", RelaySchema);
