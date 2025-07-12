import Item from '../models/Item.js';
import User from '../models/User.js';

// ----- Item moderation -----
export const pendingItems = async (_, res) => {
  const items = await Item.find({ status: 'pending' }).populate('uploader', 'name email');
  res.json(items);
};

export const approveItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  item.status = 'available';
  await item.save();
  res.json({ message: 'Item approved', item });
};

export const rejectItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  await item.deleteOne();
  res.json({ message: 'Item deleted' });
};

// ----- Users -----
export const listUsers = async (_, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};
