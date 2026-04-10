import express from 'express';
import { handleChatRequest } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth'; // Assuming you have auth middleware

const router = express.Router();

router.post('/', authenticateToken, handleChatRequest);

export default router;
