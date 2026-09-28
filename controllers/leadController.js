import Lead, { OUTCOMES } from '../models/Lead.js';

const DAILY_TARGET = Number(process.env.DAILY_TARGET || 50);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildQuery = ({ country, city, category, outcome, day, website, search }) => {
  const query = {};
  if (country) query.country = country;
  if (city) query.city = city;
  if (category) query.category = category;
  if (outcome === 'none') query.$expr = { $eq: [{ $size: { $ifNull: ['$outcomes', []] } }, 0] };
  else if (outcome && OUTCOMES.includes(outcome)) query.outcomes = outcome;
  if (day) query.dayIndex = Number(day);
  if (website === 'yes') query.hasWebsite = true;
  if (website === 'no') query.hasWebsite = false;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    query.$or = [{ name: rx }, { phone: rx }, { category: rx }, { address: rx }];
  }
  return query;
};

export const getLeads = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const query = buildQuery(req.query);
    const scope = buildQuery({ ...req.query, outcome: undefined });

    const [rows, total, tally, scopeTotal] = await Promise.all([
      Lead.find(query)
        .sort({ hasWebsite: 1, dayIndex: 1, position: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
      Lead.aggregate([
        { $match: scope },
        {
          $facet: {
            perOutcome: [
              { $unwind: { path: '$outcomes', preserveNullAndEmptyArrays: false } },
              { $group: { _id: '$outcomes', count: { $sum: 1 } } },
            ],
            none: [
              { $match: { $expr: { $eq: [{ $size: { $ifNull: ['$outcomes', []] } }, 0] } } },
              { $count: 'count' },
            ],
          },
        },
      ]),
      Lead.countDocuments(scope),
    ]);

    const counts = Object.fromEntries(OUTCOMES.map((o) => [o, 0]));
    (tally[0]?.perOutcome || []).forEach((r) => {
      counts[r._id] = r.count;
    });
    counts.none = tally[0]?.none?.[0]?.count || 0;

    res.json({ success: true, rows, total, page, limit, counts, scopeTotal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFilters = async (req, res) => {
  try {
    const { country, city } = req.query;
    const scope = {};
    if (country) scope.country = country;
    if (city) scope.city = city;

    const [grouped, categories] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: { country: '$country', city: '$city' }, total: { $sum: 1 } } },
        { $sort: { '_id.country': 1, '_id.city': 1 } },
      ]),
      Lead.aggregate([
        { $match: { ...scope, category: { $nin: ['', null] } } },
        { $group: { _id: '$category', total: { $sum: 1 }, sellable: { $sum: { $cond: ['$hasWebsite', 0, 1] } } } },
        { $sort: { total: -1, _id: 1 } },
        { $project: { _id: 0, category: '$_id', total: 1, sellable: 1 } },
      ]),
    ]);

    const countries = [...new Set(grouped.map((g) => g._id.country))];
    const cities = grouped.map((g) => ({ country: g._id.country, city: g._id.city, total: g.total }));

    res.json({ success: true, countries, cities, categories, outcomes: OUTCOMES, dailyTarget: DAILY_TARGET });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDays = async (req, res) => {
  try {
    const { city, since } = req.query;
    if (!city) return res.status(400).json({ success: false, message: 'city is required' });

    const dayStart = since && !Number.isNaN(Date.parse(since)) ? new Date(since) : new Date(new Date().setHours(0, 0, 0, 0));

    const [days, touchedToday] = await Promise.all([
      Lead.aggregate([
        { $match: { city, hasWebsite: false } },
        {
          $group: {
            _id: '$dayIndex',
            total: { $sum: 1 },
            actioned: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$outcomes', []] } }, 0] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, day: '$_id', total: 1, actioned: 1 } },
      ]),
      Lead.countDocuments({ city, hasWebsite: false, lastActionAt: { $gte: dayStart } }),
    ]);

    res.json({ success: true, days, todayDone: touchedToday, dailyTarget: DAILY_TARGET });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { outcomes, note, callCount } = req.body;
    const patch = {};

    if (outcomes !== undefined) {
      if (!Array.isArray(outcomes)) {
        return res.status(400).json({ success: false, message: 'outcomes must be an array' });
      }
      const clean = [...new Set(outcomes)];
      const bad = clean.filter((o) => !OUTCOMES.includes(o));
      if (bad.length) {
        return res.status(400).json({ success: false, message: `Unknown outcome: ${bad.join(', ')}` });
      }
      patch.outcomes = clean;
      patch.lastActionAt = clean.length ? new Date() : null;
    }
    if (note !== undefined) patch.note = String(note).slice(0, 500);
    if (callCount !== undefined) patch.callCount = Math.max(0, Number(callCount) || 0);

    if (!Object.keys(patch).length) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (lead.hasWebsite && patch.outcomes) {
      return res.status(409).json({ success: false, message: 'This lead already has a website' });
    }

    Object.assign(lead, patch);
    await lead.save();

    res.json({ success: true, message: 'Saved', lead: lead.toObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const { city, country, month } = req.query;
    const match = { hasWebsite: false };
    if (city) match.city = city;
    if (country) match.country = country;

    if (month) {
      const [y, m] = month.split('-').map(Number);
      if (y && m) match.lastActionAt = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
    }

    const [tally, totals, months] = await Promise.all([
      Lead.aggregate([
        { $match: match },
        {
          $facet: {
            perOutcome: [
              { $unwind: { path: '$outcomes', preserveNullAndEmptyArrays: false } },
              { $group: { _id: '$outcomes', count: { $sum: 1 } } },
            ],
            contacted: [{ $match: { 'outcomes.0': { $exists: true } } }, { $count: 'count' }],
            none: [
              { $match: { $expr: { $eq: [{ $size: { $ifNull: ['$outcomes', []] } }, 0] } } },
              { $count: 'count' },
            ],
          },
        },
      ]),
      Lead.aggregate([
        { $match: city ? { city } : country ? { country } : {} },
        {
          $group: {
            _id: null,
            all: { $sum: 1 },
            withWebsite: { $sum: { $cond: ['$hasWebsite', 1, 0] } },
            withoutWebsite: { $sum: { $cond: ['$hasWebsite', 0, 1] } },
          },
        },
      ]),
      Lead.aggregate([
        { $match: { lastActionAt: { $ne: null } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$lastActionAt' } } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const counts = Object.fromEntries(OUTCOMES.map((o) => [o, 0]));
    (tally[0]?.perOutcome || []).forEach((r) => {
      counts[r._id] = r.count;
    });

    const contacted = tally[0]?.contacted?.[0]?.count || 0;
    const notCalled = tally[0]?.none?.[0]?.count || 0;

    const breakdown = OUTCOMES.map((o) => ({
      outcome: o,
      count: counts[o],
      percent: contacted ? Math.round((counts[o] / contacted) * 1000) / 10 : 0,
    }));

    res.json({
      success: true,
      totals: totals[0] || { all: 0, withWebsite: 0, withoutWebsite: 0 },
      notCalled,
      contacted,
      breakdown,
      availableMonths: months.map((m) => m._id),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const importLeads = async (req, res) => {
  try {
    const { country, city, rows } = req.body;
    if (!country || !city || !Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ success: false, message: 'country, city and rows are required' });
    }

    const sorted = [...rows].sort((a, b) => (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0));

    let callable = 0;
    const ops = sorted.map((row, idx) => {
      const website = (row.website || '').trim();
      const hasWebsite = Boolean(website);
      const doc = {
        name: (row.name || '').trim(),
        phone: (row.phone || '').trim(),
        website,
        hasWebsite,
        category: (row.category || '').trim(),
        address: (row.address || '').trim(),
        reviewCount: Number(row.reviewCount) || 0,
        rating: Number(row.rating) || 0,
        country,
        city,
        placeId: (row.placeId || '').trim(),
        mapsUrl: (row.mapsUrl || '').trim(),
        cid: (row.cid || '').trim(),
        lat: Number(row.lat) || null,
        lng: Number(row.lng) || null,
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

    res.json({
      success: true,
      message: 'Import complete',
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      city,
      country,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
