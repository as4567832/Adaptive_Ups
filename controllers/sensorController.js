const Sensor = require("../models/Sensor");
const { isDbConnected } = require("../config/db");
const {
  getLatestSensorData,
  setLatestSensorData
} = require("../services/fallbackService");
const { DEFAULT_SENSOR_DATA } = require("../utils/constants");

function toNumberOrDefault(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

async function getHealth(req, res) {
  return res.json({ ok: true, dbConnected: isDbConnected() });
}

async function getLatestSensor(req, res, next) {
  if (!isDbConnected()) {
    return res.json(getLatestSensorData());
  }

  try {
    const data = await Sensor.findOne().sort({ createdAt: -1, _id: -1 }).lean();

    if (!data) {
      return res.json(DEFAULT_SENSOR_DATA);
    }

    return res.json({
      temperature: toNumberOrDefault(data.temperature, DEFAULT_SENSOR_DATA.temperature),
      humidity: toNumberOrDefault(data.humidity, DEFAULT_SENSOR_DATA.humidity),
      distance: toNumberOrDefault(data.distance, DEFAULT_SENSOR_DATA.distance),
      battery: toNumberOrDefault(data.battery, DEFAULT_SENSOR_DATA.battery),
      inputVoltage: toNumberOrDefault(data.inputVoltage, DEFAULT_SENSOR_DATA.inputVoltage),
      createdAt: data.createdAt || null
    });
  } catch (err) {
    return next(err);
  }
}

async function createSensorData(req, res, next) {
  try {
    const { temperature, humidity, distance, battery, inputVoltage } = req.body;

    if (temperature === undefined || humidity === undefined || distance === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const normalized = setLatestSensorData({ temperature, humidity, distance, battery, inputVoltage });

    if (!isDbConnected()) {
      return res.status(200).json({
        message: "Data saved in memory (MongoDB unavailable)",
        data: normalized
      });
    }

    const newData = new Sensor(normalized);
    await newData.save();

    return res.status(200).json({
      message: "Data saved",
      data: newData
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getHealth,
  getLatestSensor,
  createSensorData
};
