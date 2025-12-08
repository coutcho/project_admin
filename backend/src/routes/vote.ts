import { Router } from 'express';
import { getOptions, postVote, getVote, getResults } from '../controllers/vote';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/options', authMiddleware, getOptions);
router.post('/vote', authMiddleware, postVote);
router.get('/vote', authMiddleware, getVote);
router.get('/results', authMiddleware, getResults);

export default router;
