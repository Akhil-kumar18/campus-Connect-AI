import express from 'express';
import { createCourse, getCourses } from '../controllers/courseController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['faculty', 'admin']), createCourse);
router.get('/', authenticateToken, getCourses);

export default router;
