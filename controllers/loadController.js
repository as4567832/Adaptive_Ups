const {
  getLoads,
  hasLoadId,
  toggleLoad,
  getSwitchState,
  toggleSwitchState
} = require("../services/fallbackService");

async function getAllLoads(req, res) {
  return res.json(getLoads());
}

async function toggleLoadById(req, res) {
  let id = req.params.id;
  if (id === "1") id = "load1";
  if (id === "2") id = "load2";
  if (id === "3" || id === "load3" || id === "source") id = "supply";

  if (!hasLoadId(id)) {
    return res.status(400).json({ error: "Invalid load ID" });
  }

  const state = toggleLoad(id);

  // 🔥 Sabhi loads ka status ek saath
  const loads = getLoads();

  console.log("==== Current Loads Status ====");

  console.table(getLoads());

  return res.json({ id, state });
}

async function getSwitch(req, res) {
  return res.json({ state: getSwitchState() });
}

async function toggleSwitch(req, res) {
  return res.json({ state: toggleSwitchState() });
}

module.exports = {
  getAllLoads,
  toggleLoadById,
  getSwitch,
  toggleSwitch
};
