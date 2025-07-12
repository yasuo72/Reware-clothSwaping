import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import Grid from 'gridfs-stream';


// Get underlying mongoose connection
const conn = mongoose.connection;
let gfs;

// Initialize stream once Mongo connected
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads'); // set collection name to lookup
});

export const getGfs = () => gfs;
