import 'dotenv/config';
import fs from 'node:fs';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Lead, { OUTCOMES } from '../models/Lead.js';

const DAILY_TARGET = Number(process.env.DAILY_TARGET || 50);

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((raw) => {
    const [key, ...rest] = raw.replace(/^--/, '').split('=');
    args[key] = rest.join('=');
  });
  return args;
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift().map((h) => h.replace(/^﻿/, '').trim());
  return rows
    .filter((r) => r.some((c) => c.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
};

const run = async () => {
  const { file, city, country } = parseArgs();

  if (!file || !city || !country) {
    console.error('Usage: npm run import -- --file="path.csv" --city="Odemira" --country="Portugal"');
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  await connectDb();

  const records = parseCsv(fs.readFileSync(file, 'utf8'));
  const mapped = records
    .map((r) => ({
      name: r.title || r.name || '',
      phone: r.phone || '',
      website: r.website || '',
      category: r.category || '',
      address: r.address || '',
      reviewCount: Number(r.review_count || r.reviewCount || 0) || 0,
      rating: Number(r.review_rating || r.rating || 0) || 0,
      placeId: r.place_id || r.placeId || '',
    }))
    .filter((r) => r.name);

  const seen = new Set();
  const unique = mapped.filter((r) => {
    const key = r.placeId || `${r.name}|${r.address}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => b.reviewCount - a.reviewCount);

  let callable = 0;
  const ops = unique.map((row, idx) => {
    const hasWebsite = Boolean(row.website);
    const doc = {
      ...row,
      hasWebsite,
      country,
      city,
      position: idx,
      dayIndex: hasWebsite ? 0 : Math.floor(callable++ / DAILY_TARGET) + 1,
    };
    const filter = doc.placeId ? { placeId: doc.placeId, city } : { name: doc.name, city, address: doc.address };
    return {
      updateOne: {
        filter,
        update: {
          $set: doc,
          $setOnInsert: { outcomes: [], callCount: 0, note: '' },
          $unset: { status: '', whatsappSent: '' },
        },
        upsert: true,
      },
    };
  });

  const result = await Lead.bulkWrite(ops, { ordered: false });
  const backfilled = await Lead.updateMany(
    { city, $or: [{ outcomes: { $exists: false } }, { callCount: { $exists: false } }] },
    { $set: { outcomes: [], callCount: 0 } }
  );
  const pruned = await Lead.updateMany({ city }, { $pull: { outcomes: { $nin: OUTCOMES } } });
  const withoutSite = unique.filter((r) => !r.website).length;

  console.log(`City         : ${city}, ${country}`);
  console.log(`Parsed       : ${records.length}`);
  console.log(`Unique       : ${unique.length}`);
  console.log(`No website   : ${withoutSite}`);
  console.log(`Inserted     : ${result.upsertedCount}`);
  console.log(`Updated      : ${result.modifiedCount}`);
  console.log(`Backfilled   : ${backfilled.modifiedCount}`);
  console.log(`Pruned       : ${pruned.modifiedCount} (retired outcomes removed)`);
  console.log(`Call days    : ${Math.ceil(withoutSite / DAILY_TARGET)} (${DAILY_TARGET} calls per day)`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
