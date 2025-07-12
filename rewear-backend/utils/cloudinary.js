import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load env vars so this module can be imported anywhere
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer file data
 * @param {string} folder destination folder (e.g. `rewear/items/<userId>/<itemId>`)
 * @param {string} filename file name without extension
 * @returns {Promise<string>} secure URL of the uploaded asset
 */
export const uploadBufferToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};
