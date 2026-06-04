const mongoose = require("mongoose");

// Single document config store — use AppConfig.getSingleton() everywhere
const appConfigSchema = new mongoose.Schema({
  rentDueDay: { type: Number, default: 1, min: 1, max: 28 }, // day of month
}, { timestamps: true });

appConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne();
  if (!config) config = await this.create({});
  return config;
};

module.exports = mongoose.model("AppConfig", appConfigSchema);
