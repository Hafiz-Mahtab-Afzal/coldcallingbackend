import 'dotenv/config';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Lead from '../models/Lead.js';

const RINGS = [500, 1000];

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((raw) => {
    const [key, ...rest] = raw.replace(/^--/, '').split('=');
    args[key] = rest.join('=') || true;
  });
  return args;
};

const metres = (a, b) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const run = async () => {
  const { city } = parseArgs();
  await connectDb();

  const scope = city ? { city } : {};
  const all = await Lead.find(scope, 'name website hasWebsite mapsUrl category lat lng city').lean();
  const placed = all.filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number');
  const withSite = placed.filter((l) => l.hasWebsite && l.website);
  const targets = placed.filter((l) => !l.hasWebsite);

  console.log(`Scope        : ${city || 'every city'}`);
  console.log(`Leads        : ${all.length} (${placed.length} with coordinates)`);
  console.log(`Have a site  : ${withSite.length} (these are the candidates)`);
  console.log(`Need a sample: ${targets.length}`);
  console.log('');

  const byCity = new Map();
  withSite.forEach((l) => {
    if (!byCity.has(l.city)) byCity.set(l.city, []);
    byCity.get(l.city).push(l);
  });

  const writes = [];
  const found = { 500: 0, 1000: 0 };
  let none = 0;

  targets.forEach((lead) => {
    const pool = byCity.get(lead.city) || [];
    let best = null;

    for (const ring of RINGS) {
      pool.forEach((cand) => {
        const d = metres(lead, cand);
        if (d <= ring && (!best || d < best.d)) best = { cand, d };
      });
      if (best) {
        found[ring] += 1;
        break;
      }
    }

    if (!best) none += 1;

    writes.push({
      updateOne: {
        filter: { _id: lead._id },
        update: {
          $set: {
            neighbour: best
              ? {
                  name: best.cand.name,
                  website: best.cand.website,
                  mapsUrl: best.cand.mapsUrl || '',
                  category: best.cand.category || '',
                  distanceM: Math.round(best.d),
                }
              : { name: '', website: '', mapsUrl: '', category: '', distanceM: null },
          },
        },
      },
    });
  });

  if (writes.length) {
    for (let i = 0; i < writes.length; i += 500) {
      await Lead.bulkWrite(writes.slice(i, i + 500), { ordered: false });
    }
  }

  console.log(`Within 500m  : ${found[500]}`);
  console.log(`Within 1km   : ${found[1000]}`);
  console.log(`Nothing near : ${none} (column stays empty)`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.stack || err.message);
  await mongoose.disconnect();
  process.exit(1);
});
