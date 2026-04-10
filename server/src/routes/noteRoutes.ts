import express from 'express';
import { createNote, getNotes, deleteNote, summarizeNotes } from '../controllers/noteController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['faculty', 'admin']), upload.single('file'), createNote);
router.get('/', authenticateToken, getNotes);
router.delete('/:id', authenticateToken, authorizeRole(['faculty', 'admin']), deleteNote);
router.post('/summarize', authenticateToken, summarizeNotes);

export default router;
