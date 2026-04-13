const express = require("express");
const {
  getHealth,
  getLatestSensor,
  createSensorData
} = require("../controllers/sensorController");

const router = express.Router();

router.get("/health", getHealth);
router.get("/data", getLatestSensor);
router.post("/data", createSensorData);

module.exports = router;
