const express = require("express");
const cors = require("cors");

const sensorRoutes = require("./routes/sensorRoutes");
const loadRoutes = require("./routes/loadRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const sendDataRoute = require("./routes/sendDataRoute")
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(cors());

app.use(sensorRoutes);
app.use(loadRoutes);
app.use(settingsRoutes);
app.use(sendDataRoute);

app.use(errorHandler);

module.exports = app;
