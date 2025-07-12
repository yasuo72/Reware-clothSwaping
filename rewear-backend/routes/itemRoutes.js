import express from 'express';
// multer handled inside uploadController
import { protect } from '../middleware/auth.js';
import { createItem, listApprovedItems, getItem } from '../controllers/itemController.js';
import { multerMiddleware, uploadImages } from '../controllers/uploadController.js';

const router = express.Router();


router.get('/', listApprovedItems);
router.get('/:id', getItem);
router.post('/', protect, multerMiddleware, uploadImages, createItem);

export default router;
