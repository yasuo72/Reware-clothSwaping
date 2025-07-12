import Item from '../models/Item.js';


export const createItem = async (req, res) => {
  try {
    const { title, description, category, type, size, condition, tags, pointsValue } = req.body;
    const item = new Item({
      title,
      description,
      category,
      type,
      size,
      condition,
      tags: tags ? tags.split(',').map(t=>t.trim()) : [],
      pointsValue: pointsValue || 10,
      uploader: req.user.id,
    });

    if (req.uploadedUrls && req.uploadedUrls.length) {
      item.images = req.uploadedUrls;
    }
    await item.save();
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error'});
  }
};

export const listApprovedItems = async (_, res) => {
  const items = await Item.find({ status: 'available' }).populate('uploader','name');
  res.json(items);
};

export const getItem = async (req,res)=>{
  const item = await Item.findById(req.params.id).populate('uploader','name');
  if(!item) return res.status(404).json({message:'Not found'});
  res.json(item);
};
