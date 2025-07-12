import express from 'express';
import { protect } from '../middleware/auth.js';
import { requestSwap, approveSwap, mySwaps } from '../controllers/swapController.js';

const router = express.Router();

router.post('/request', protect, requestSwap);
router.put('/:id/approve', protect, approveSwap);
router.get('/mine', protect, mySwaps);

export default router;
