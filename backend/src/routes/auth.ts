import { Router } from 'express';
import { login, getUser } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, getUser); // For checkSession compatibility

export default router;
