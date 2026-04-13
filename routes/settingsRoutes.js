const express = require("express");
const {
  getSettings,
  upsertSettings
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/api/settings", getSettings);
router.post("/api/settings", upsertSettings);

module.exports = router;
