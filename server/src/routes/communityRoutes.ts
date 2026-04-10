import express from 'express';
import { getPosts, createPost, upvotePost, createComment, upvoteComment } from '../controllers/communityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/posts', authenticateToken, getPosts);
router.post('/posts', authenticateToken, createPost);
router.post('/posts/:id/upvote', authenticateToken, upvotePost);
router.post('/posts/:id/comments', authenticateToken, createComment);
router.post('/comments/:id/upvote', authenticateToken, upvoteComment);

export default router;
