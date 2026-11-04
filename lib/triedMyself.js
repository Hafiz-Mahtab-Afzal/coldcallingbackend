import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Lead from '../models/Lead.js';

// places the user already chased by hand before this app existed
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'tried-myself.txt');

export const normName = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// a 3-letter name would match half the country, so skip those
const NAMES = new Set(
  fs
    .readFileSync(FILE, 'utf8')
    .split('\n')
    .map(normName)
    .filter((n) => n.length >= 4)
);

export const isTried = (name) => NAMES.has(normName(name));
export const TRIED_TOTAL = NAMES.size;

export const markTried = async (city) => {
  const rows = await Lead.find(city ? { city } : {}, { name: 1, city: 1, outcomes: 1 }).lean();
  const hit = rows.filter((r) => isTried(r.name) && !(r.outcomes || []).includes('tried_myself'));
  if (hit.length) {
    await Lead.updateMany({ _id: { $in: hit.map((r) => r._id) } }, { $addToSet: { outcomes: 'tried_myself' } });
  }
  return hit.map((r) => `${r.name} — ${r.city}`);
};
