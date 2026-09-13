const Sensor = require("../models/Sensor");
const Relay = require("../models/Relay");
const { isDbConnected } = require("../config/db");
const {
  getLoads,
  setLatestSensorData,
  updateEspHeartbeat
} = require("../services/fallbackService");

const sendData = async (req, res) => {
  try {
    const {
      temperature,
      humidity,
      distance,
      battery,
      inputVoltage,
      current,
      load1,
      load2,
      source,
      supply
    } = req.body;

    // Register ESP32 Heartbeat timestamp
    updateEspHeartbeat();

    console.log("\n📡 [ESP32 HEARTBEAT & SENSOR DATA]");
    console.log({
      temperature: `${temperature}°C`,
      humidity: `${humidity}%`,
      battery: `${battery}%`,
      inputVoltage: `${inputVoltage}V AC`,
      current: `${current}A`,
      hardwareStates: {
        source: source || (supply ? "MAINS" : "INVERTER"),
        load1: load1,
        load2: load2
      }
    });

    if (temperature === undefined || humidity === undefined || distance === undefined) {
      return res.status(400).json({ error: "Missing required sensor fields" });
    }

    const normalized = setLatestSensorData({
      temperature,
      humidity,
      distance,
      battery,
      inputVoltage,
      current
    });
    let savedData = normalized;

    if (isDbConnected()) {
      try {
        const newData = new Sensor(normalized);
        savedData = await newData.save();
        await Relay.findOneAndUpdate(
          {},
          { lastEspSeen: new Date() },
          { upsert: true }
        );
      } catch (dbErr) {
        console.error("MongoDB Save Error (Data kept in memory fallback):", dbErr.message);
      }
    }

    const currentLoads = getLoads();
    const responseLoads = {
      load1: currentLoads.load1,
      load2: currentLoads.load2,
      supply: currentLoads.supply,
      source: currentLoads.supply
    };

    return res.status(200).json({
      message: "Data saved",
      data: savedData,
      toggleLoad: responseLoads,
      espOnline: true
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendData
};