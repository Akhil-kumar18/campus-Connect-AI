import express from 'express';
import { createExam, getExams } from '../controllers/examController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['faculty', 'admin']), createExam);
router.get('/', authenticateToken, getExams);

export default router;
