import { Router } from 'express';
import {
  getLeads,
  getFilters,
  getDays,
  getToday,
  getStats,
  updateLead,
  importLeads,
} from '../controllers/leadController.js';
import { getTypes, setTypes } from '../controllers/typeController.js';

const router = Router();

router.get('/types', getTypes);
router.put('/types', setTypes);
router.get('/filters', getFilters);
router.get('/days', getDays);
router.get('/today', getToday);
router.get('/stats', getStats);
router.get('/', getLeads);
router.post('/import', importLeads);
router.patch('/:id', updateLead);

export default router;
