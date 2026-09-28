import mongoose from 'mongoose';

export const OUTCOMES = [
  'no_answer',
  'no_whatsapp',
  'number_deleted',
  'owner_absent',
  'call_later',
  'tell_tomorrow',
  'already_arranged',
  'has_website',
  'reason_pakistan',
  'not_interested',
  'agreed',
  'done',
];

export const DEAD_OUTCOMES = ['no_whatsapp', 'number_deleted', 'has_website', 'reason_pakistan'];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    hasWebsite: { type: Boolean, default: false, index: true },
    category: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    reviewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    country: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true, index: true },
    placeId: { type: String, default: '', trim: true },
    mapsUrl: { type: String, default: '', trim: true },
    cid: { type: String, default: '', trim: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    dayIndex: { type: Number, default: 1, index: true },
    position: { type: Number, default: 0 },
    outcomes: { type: [{ type: String, enum: OUTCOMES }], default: [], index: true },
    callCount: { type: Number, default: 0 },
    note: { type: String, default: '', trim: true },
    lastActionAt: { type: Date, default: null },
  },
  { timestamps: true }
);

leadSchema.index({ city: 1, hasWebsite: 1, dayIndex: 1, position: 1 });
leadSchema.index(
  { placeId: 1, city: 1 },
  { unique: true, partialFilterExpression: { placeId: { $type: 'string', $ne: '' } } }
);

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
