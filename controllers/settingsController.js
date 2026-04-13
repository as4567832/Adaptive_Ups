const Settings = require("../models/Settings");
const { isDbConnected } = require("../config/db");
const {
  getSettingsFallback,
  updateSettingsFallback
} = require("../services/fallbackService");

async function getSettings(req, res, next) {
  if (!isDbConnected()) {
    return res.json(getSettingsFallback());
  }

  try {
    const settings = await Settings.findOne();
    return res.json(settings || {});
  } catch (err) {
    return next(err);
  }
}

async function upsertSettings(req, res, next) {
  if (!isDbConnected()) {
    return res.json(updateSettingsFallback(req.body));
  }

  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, {
      upsert: true,
      new: true
    });

    return res.json(settings);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getSettings,
  upsertSettings
};
