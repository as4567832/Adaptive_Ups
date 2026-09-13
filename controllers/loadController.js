const Relay = require("../models/Relay");
const { isDbConnected } = require("../config/db");
const {
  getLoads,
  hasLoadId,
  normalizeLoadId,
  toggleLoad,
  setLoad,
  setAllLoads,
  getSwitchState,
  toggleSwitchState,
  touchAppCommand
} = require("../services/fallbackService");

async function getAllLoads(req, res) {
  if (isDbConnected()) {
    try {
      const doc = await Relay.findOne().lean();
      if (doc) {
        setAllLoads({
          load1: doc.load1,
          load2: doc.load2,
          supply: doc.supply ?? doc.source,
          battSupply: doc.battSupply,
          charger: doc.charger
        });
      }
    } catch (err) {
      console.error("MongoDB Relay Read Error (using memory fallback):", err.message);
    }
  }
  return res.json(getLoads());
}

async function toggleLoadById(req, res) {
  let id = req.params.id;

  if (!hasLoadId(id)) {
    return res.status(400).json({ error: "Invalid load ID. Expected 1, 2, 3, load1, load2, or source/supply." });
  }

  const target = normalizeLoadId(id);

  // Check if an explicit boolean state was supplied in the request body (e.g. { "state": true })
  let explicitState = undefined;
  if (req.body && typeof req.body.state === "boolean") {
    explicitState = req.body.state;
  } else if (req.query && (req.query.state === "true" || req.query.state === "false")) {
    explicitState = req.query.state === "true";
  }

  touchAppCommand();
  const state = setLoad(target, explicitState);

  // Persist to MongoDB if connected
  if (isDbConnected()) {
    try {
      const updateData = {
        [target]: state,
        lastAppCommand: new Date()
      };
      if (target === "supply") {
        updateData.source = state;
      }
      await Relay.findOneAndUpdate({}, updateData, { upsert: true, new: true });
    } catch (dbErr) {
      console.error("MongoDB Relay Save Error (saved in memory):", dbErr.message);
    }
  }

  const allLoads = getLoads();
  console.log(`\n⚡ [APP COMMAND EXECUTED] Target: '${id}' (${target}) -> State: ${state ? "ON / CONNECTED" : "OFF / DISCONNECTED"}`);
  console.log("==== Current Relays Status ====");
  console.table({
    "Relay 1 (Source)": allLoads.supply ? "MAINS (HIGH)" : "INVERTER (LOW)",
    "Relay 2 (Load 1)": allLoads.load1 ? "ON (CONNECTED)" : "OFF (ISOLATED)",
    "Relay 3 (Load 2)": allLoads.load2 ? "ON (CONNECTED)" : "OFF (ISOLATED)",
    "ESP32 Hardware Online": allLoads.espOnline ? "YES (ACTIVE)" : "OFFLINE / UNREACHABLE"
  });

  return res.json({
    id,
    target,
    state,
    loads: allLoads,
    espOnline: allLoads.espOnline
  });
}

async function batchSetLoads(req, res) {
  const { load1, load2, supply, source, battSupply, charger } = req.body;
  const targetSupply = typeof supply === "boolean" ? supply : source;

  const newStates = {};
  if (typeof load1 === "boolean") newStates.load1 = load1;
  if (typeof load2 === "boolean") newStates.load2 = load2;
  if (typeof targetSupply === "boolean") {
    newStates.supply = targetSupply;
    newStates.source = targetSupply;
  }
  if (typeof battSupply === "boolean") newStates.battSupply = battSupply;
  if (typeof charger === "boolean") newStates.charger = charger;

  touchAppCommand();
  const updatedLoads = setAllLoads(newStates);

  if (isDbConnected()) {
    try {
      await Relay.findOneAndUpdate({}, { ...newStates, lastAppCommand: new Date() }, { upsert: true, new: true });
    } catch (dbErr) {
      console.error("MongoDB Batch Save Error:", dbErr.message);
    }
  }

  console.log("\n⚡ [BATCH RELAY COMMAND EXECUTED]", newStates);
  return res.json({
    success: true,
    loads: updatedLoads
  });
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
  batchSetLoads,
  getSwitch,
  toggleSwitch
};
