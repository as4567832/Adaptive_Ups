const express = require("express");
const {
  getAllLoads,
  toggleLoadById,
  batchSetLoads,
  getSwitch,
  toggleSwitch
} = require("../controllers/loadController");

const router = express.Router();

router.get("/toggle", toggleSwitch);
router.get("/state", getSwitch);
router.get("/loads", getAllLoads);
router.post("/load/:id", toggleLoadById);
router.post("/loads/set", batchSetLoads);
router.post("/loads", batchSetLoads);

module.exports = router;
