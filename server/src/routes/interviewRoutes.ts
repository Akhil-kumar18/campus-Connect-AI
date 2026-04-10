import express from 'express';
import { analyzeInterview, getInterviewStats } from '../controllers/interviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/analyze', authenticateToken, analyzeInterview);
router.get('/stats', authenticateToken, getInterviewStats);

export default router;
