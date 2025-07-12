import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/files/:id -> stream file from GridFS using ObjectId
router.get('/:id', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });
    const objectId = new mongoose.Types.ObjectId(req.params.id);

    // Fetch file metadata to set headers
    const [fileData] = await bucket.find({ _id: objectId }).toArray();
    if (!fileData) return res.status(404).send('File not found');

    res.set('Content-Type', fileData.contentType || 'application/octet-stream');
    bucket.openDownloadStream(objectId).pipe(res).on('error', () => res.status(500).end());
  } catch (err) {
    res.status(500).send('Server error');
  }
});

export default router;
