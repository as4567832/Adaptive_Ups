const Sensor = require('../models/Sensor');
const {getSwitchState, toggleLoad, getLoads} = require("../services/fallbackService");
const sendData = async(req,res)=>{
    try{
        const {temperature,humidity,distance,battery,inputVoltage} = req.body;
        console.log("Received data:", {temperature, humidity, distance, battery, inputVoltage});
        if(temperature === undefined || humidity === undefined || distance === undefined){
            return res.status(400).json({error:"Missing required fields"});
        }
        const newData = new Sensor({
            temperature: Number(temperature),
            humidity: Number(humidity),
            distance: Number(distance),
            battery: battery === undefined ? undefined : Number(battery),
            inputVoltage: inputVoltage === undefined ? undefined : Number(inputVoltage)
        });
        await newData.save();

        const switchState = getSwitchState();
        const toggleLoadResult = getLoads();
        console.log("Current switch state:", toggleLoadResult);
        return res.status(200).json({
            message:"Data saved",
            data:newData,
            toggleLoad: toggleLoadResult,
        });

    }catch(error){
        console.error("Error saving data:", error);
        return res.status(500).json({error:"Internal server error"});
    }
}


module.exports = {
    sendData
}