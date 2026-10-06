import Lead from '../models/Lead.js';
import { readSetting, writeSetting } from '../models/Setting.js';

export const ENABLED_TYPES_KEY = 'enabledTypes';

export const enabledTypes = async () => {
  const value = await readSetting(ENABLED_TYPES_KEY, null);
  return Array.isArray(value) ? value : null;
};

export const getTypes = async (req, res) => {
  try {
    const { country, city } = req.query;
    const match = { category: { $nin: ['', null] } };
    if (country) match.country = country;
    if (city) match.city = city;

    const [found, enabled] = await Promise.all([
      Lead.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            sellable: { $sum: { $cond: ['$hasWebsite', 0, 1] } },
            cities: { $addToSet: '$city' },
          },
        },
        { $sort: { total: -1, _id: 1 } },
        { $project: { _id: 0, category: '$_id', total: 1, sellable: 1, cities: 1 } },
      ]),
      enabledTypes(),
    ]);

    const types = found.map((t) => ({ ...t, enabled: enabled === null ? true : enabled.includes(t.category) }));

    res.json({ success: true, types, allEnabled: enabled === null, enabled: enabled ?? types.map((t) => t.category) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const setTypes = async (req, res) => {
  try {
    const { enabled } = req.body;
    if (!Array.isArray(enabled)) {
      return res.status(400).json({ success: false, message: 'enabled must be an array' });
    }

    const clean = [...new Set(enabled.map((t) => String(t).trim()).filter(Boolean))];
    await writeSetting(ENABLED_TYPES_KEY, clean);

    const [kept, hidden] = await Promise.all([
      Lead.countDocuments({ category: { $in: clean } }),
      Lead.countDocuments({ category: { $nin: clean } }),
    ]);

    res.json({ success: true, message: 'Saved', enabled: clean, kept, hidden });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
