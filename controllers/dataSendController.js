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
      current1,
      current2,
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
      inputVoltage: `${inputVoltage}V AC (ZMPT101B)`,
      current: `${current}A (Total JCT5052C)`,
      current1: `${current1}A (JCT5052C Sensor 1)`,
      current2: `${current2}A (JCT5052C Sensor 2)`,
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
      current,
      current1,
      current2
    });
    let savedData = normalized;

    // Sync backend memory & MongoDB state with reported hardware states from ESP32 Serial/Web commands
    const hwStates = {};
    if (typeof load1 === "boolean") hwStates.load1 = load1;
    if (typeof load2 === "boolean") hwStates.load2 = load2;
    const suppVal = typeof supply === "boolean" ? supply : (source === "MAINS" || source === true ? true : (source === "INVERTER" || source === false ? false : undefined));
    if (typeof suppVal === "boolean") {
      hwStates.supply = suppVal;
      hwStates.source = suppVal;
    }
    if (typeof req.body.battSupply === "boolean") hwStates.battSupply = req.body.battSupply;
    if (typeof req.body.charger === "boolean") hwStates.charger = req.body.charger;

    if (isDbConnected()) {
      try {
        const newData = new Sensor(normalized);
        savedData = await newData.save();
        await Relay.findOneAndUpdate(
          {},
          { ...hwStates, lastEspSeen: new Date() },
          { upsert: true }
        );
      } catch (dbErr) {
        console.error("MongoDB Save Error (Data kept in memory fallback):", dbErr.message);
      }
    }

    const currentLoads = setAllLoads(hwStates);
    const responseLoads = {
      load1: currentLoads.load1,
      load2: currentLoads.load2,
      supply: currentLoads.supply,
      source: currentLoads.supply,
      battSupply: currentLoads.battSupply,
      charger: currentLoads.charger
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