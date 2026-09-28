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

const router = Router();

router.get('/filters', getFilters);
router.get('/days', getDays);
router.get('/today', getToday);
router.get('/stats', getStats);
router.get('/', getLeads);
router.post('/import', importLeads);
router.patch('/:id', updateLead);

export default router;
