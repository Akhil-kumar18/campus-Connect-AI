import { Router } from 'express';
import { getUsers, deleteUser, createUser } from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['admin']), getUsers);
router.post('/', authenticateToken, authorizeRole(['admin']), createUser);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteUser);

export default router;
