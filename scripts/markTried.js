import 'dotenv/config';
import mongoose from 'mongoose';
import { markTried, TRIED_TOTAL } from '../lib/triedMyself.js';

const city = process.argv.find((a) => a.startsWith('--city='))?.slice(7);

await mongoose.connect(process.env.MONGO_URI);
const hits = await markTried(city);
console.log(`List         : ${TRIED_TOTAL} names tried by hand`);
console.log(`Scope        : ${city || 'every city'}`);
console.log(`Newly marked : ${hits.length}`);
hits.forEach((h) => console.log(`  ${h}`));
await mongoose.disconnect();
