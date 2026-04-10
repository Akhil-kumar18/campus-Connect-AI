import express from 'express';
import { getModules, createModule } from '../controllers/moduleController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['faculty', 'admin']), createModule);
router.get('/', authenticateToken, getModules);

export default router;
