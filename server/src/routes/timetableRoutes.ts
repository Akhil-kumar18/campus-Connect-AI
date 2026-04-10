import express from 'express';
import { getTimetables, createTimetable, updateTimetable, deleteTimetable } from '../controllers/timetableController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getTimetables);
router.post('/', authenticateToken, authorizeRole(['faculty', 'admin']), createTimetable);
router.put('/:id', authenticateToken, authorizeRole(['faculty', 'admin']), updateTimetable);
router.delete('/:id', authenticateToken, authorizeRole(['faculty', 'admin']), deleteTimetable);

export default router;
