import express from 'express';
import { getAnalytics, getWeeklyPlan } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getAnalytics);
router.get('/weekly-plan', getWeeklyPlan);

export default router;
