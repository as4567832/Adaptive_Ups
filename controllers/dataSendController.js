const Sensor = require('../models/Sensor');
const { isDbConnected } = require("../config/db");
const { getSwitchState, toggleLoad, getLoads, setLatestSensorData } = require("../services/fallbackService");

const sendData = async (req, res) => {
    try {
        const { temperature, humidity, distance, battery, inputVoltage, current } = req.body;
        console.log("Received ESP32 data:", { temperature, humidity, distance, battery, inputVoltage, current });

        if (temperature === undefined || humidity === undefined || distance === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const normalized = setLatestSensorData({ temperature, humidity, distance, battery, inputVoltage, current });
        let savedData = normalized;

        if (isDbConnected()) {
            try {
                const newData = new Sensor(normalized);
                savedData = await newData.save();
                console.log("Data successfully saved to MongoDB Database! Doc ID:", savedData._id);
            } catch (dbErr) {
                console.error("MongoDB Save Error (Data kept in memory fallback):", dbErr.message);
            }
        } else {
            console.log("MongoDB not connected. Data saved in memory fallback.");
        }

        const switchState = getSwitchState();
        const toggleLoadResult = getLoads();
        const responseLoads = {
            ...toggleLoadResult,
            source: toggleLoadResult.supply
        };
        console.log("Current load/source state:", responseLoads);

        return res.status(200).json({
            message: "Data saved",
            data: savedData,
            toggleLoad: responseLoads,
        });

    } catch (error) {
        console.error("Error saving data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = {
    sendData
}