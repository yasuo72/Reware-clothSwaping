import multer from 'multer';
import path from 'path';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

// In-memory storage; we'll upload buffers directly to Cloudinary
const upload = multer();

export const multerMiddleware = upload.array('images', 5);

export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

        const folder = `rewear/items/${req.user?.id || 'anonymous'}`;
    const urls = await Promise.all(
      req.files.map(async (f) => {
        const filename = path.parse(f.originalname).name;
        return uploadBufferToCloudinary(f.buffer, folder, `${Date.now()}-${filename}`);
      })
    );

    req.uploadedUrls = urls;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};
