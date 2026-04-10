import express from 'express';
import { createAssignment, getAssignments, submitAssignment, getSubmissions, getPendingSubmissions, deleteAssignment, updateAssignment } from '../controllers/assignmentController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['faculty', 'admin']), createAssignment);
router.get('/', authenticateToken, getAssignments);
router.post('/:id/submit', authenticateToken, authorizeRole(['student']), upload.single('file'), submitAssignment);
router.get('/submissions', authenticateToken, authorizeRole(['faculty', 'admin']), getSubmissions);
router.get('/:id/pending', authenticateToken, authorizeRole(['faculty', 'admin']), getPendingSubmissions);
router.delete('/:id', authenticateToken, authorizeRole(['faculty', 'admin']), deleteAssignment);
router.patch('/:id', authenticateToken, authorizeRole(['faculty', 'admin']), updateAssignment);

export default router;
