import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Addresses whose locality is not in the parish map used to be dropped. Asking
// OpenStreetMap which municipality a point sits in is slower but always right,
// and the answers are cached so a place is only ever looked up once.
const CACHE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'geocache.json');
const UA = 'lead-caller/1.0 (restaurant lead tool, contact via repository)';
const GAP = 1100; // nominatim allows one request per second

let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
} catch {
  cache = {};
}

let dirty = false;
export const saveCache = () => {
  if (!dirty) return;
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0));
  dirty = false;
};

let last = 0;
const wait = async () => {
  const gap = Date.now() - last;
  if (gap < GAP) await new Promise((r) => setTimeout(r, GAP - gap));
  last = Date.now();
};

// geocodejson spells the admin levels out: in Portugal level7 is the concelho
const pick = (admin = {}) => admin.level7 || admin.level8 || admin.level6 || null;

export const municipalityAt = async (lat, lon) => {
  if (!lat || !lon) return null;
  const key = `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
  if (key in cache) return cache[key];

  await wait();
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=geocodejson&zoom=10&addressdetails=1&lat=${lat}&lon=${lon}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt' } });
    if (!res.ok) return null;
    const body = await res.json();
    const name = pick(body?.features?.[0]?.properties?.geocoding?.admin);
    cache[key] = name;
    dirty = true;
    return name;
  } catch {
    return null;
  }
};
