import Item from '../models/Item.js';
import Swap from '../models/Swap.js';
import User from '../models/User.js';

// POST /api/swaps/request
export const requestSwap = async (req, res) => {
  try {
    const { itemId, method } = req.body;
    if (!['swap', 'redeem'].includes(method))
      return res.status(400).json({ message: 'Invalid method' });

    const item = await Item.findById(itemId).populate('uploader');
    if (!item || item.status !== 'available')
      return res.status(400).json({ message: 'Item not available' });

    if (item.uploader._id.equals(req.user.id))
      return res.status(400).json({ message: 'Cannot request own item' });

    // Points check for redeem
    if (method === 'redeem') {
      const user = await User.findById(req.user.id);
      if (user.points < item.pointsValue)
        return res.status(400).json({ message: 'Insufficient points' });
    }

    const swap = await Swap.create({
      itemId: item._id,
      ownerId: item.uploader._id,
      requesterId: req.user.id,
      method,
    });

    res.status(201).json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/swaps/:id/approve
export const approveSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap || swap.status !== 'pending')
      return res.status(404).json({ message: 'Swap not pending' });

    if (!swap.ownerId.equals(req.user.id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not allowed' });

    const item = await Item.findById(swap.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Process redemption points
    if (swap.method === 'redeem') {
      const requester = await User.findById(swap.requesterId);
      if (requester.points < item.pointsValue)
        return res.status(400).json({ message: 'Requester lacks points' });
      requester.points -= item.pointsValue;
      await requester.save();
    }

    swap.status = 'approved';
    await swap.save();

    item.status = 'swapped';
    await item.save();

    res.json({ message: 'Swap approved', swap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/swaps/mine
export const mySwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requesterId: req.user.id }, { ownerId: req.user.id }],
    })
      .populate('itemId', 'title images')
      .sort({ createdAt: -1 });
    res.json(swaps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
