import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { pendingItems, approveItem, rejectItem, listUsers } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

// item moderation
router.get('/items/pending', pendingItems);
router.put('/items/:id/approve', approveItem);
router.delete('/items/:id', rejectItem);

// users
router.get('/users', listUsers);

export default router;
