import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingSchema);

export const readSetting = async (key, fallback = null) => {
  const doc = await Setting.findOne({ key }).lean();
  return doc ? doc.value : fallback;
};

export const writeSetting = async (key, value) => {
  const doc = await Setting.findOneAndUpdate({ key }, { $set: { value } }, { upsert: true, new: true }).lean();
  return doc.value;
};

export default Setting;
