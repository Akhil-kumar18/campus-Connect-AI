import express from 'express';
import { getDashboardStats } from '../controllers/statsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboardStats);

export default router;
