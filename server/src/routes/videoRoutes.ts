import express from 'express';
import { createVideo, getVideos, deleteVideo } from '../controllers/videoController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['faculty', 'admin']), upload.single('file'), createVideo);
router.get('/', authenticateToken, getVideos);
router.delete('/:id', authenticateToken, authorizeRole(['faculty', 'admin']), deleteVideo);

export default router;
