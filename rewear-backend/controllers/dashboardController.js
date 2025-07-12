import User from '../models/User.js';
import Item from '../models/Item.js';
import Swap from '../models/Swap.js';

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const myItems = await Item.find({ uploader: req.user.id }).sort({ createdAt: -1 });
    const mySwaps = await Swap.find({
      $or: [{ requesterId: req.user.id }, { ownerId: req.user.id }],
    })
      .populate('itemId', 'title images status')
      .sort({ createdAt: -1 });

    res.json({ user, myItems, mySwaps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
