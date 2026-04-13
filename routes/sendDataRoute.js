const express = require('express');
const {sendData} = require("../controllers/dataSendController")
const router = express.Router();

router.post('/send-data', sendData);
module.exports = router;