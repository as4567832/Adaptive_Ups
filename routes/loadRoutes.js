const express = require("express");
const {
  getAllLoads,
  toggleLoadById,
  getSwitch,
  toggleSwitch
} = require("../controllers/loadController");

const router = express.Router();

router.get("/toggle", toggleSwitch);
router.get("/state", getSwitch);
router.get("/loads", getAllLoads);
router.post("/load/:id", toggleLoadById);

module.exports = router;
