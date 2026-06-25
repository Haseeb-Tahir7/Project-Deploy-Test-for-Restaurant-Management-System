import MenuItem from '../models/MenuItem.js';

export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { name, emoji, price, category } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const item = await MenuItem.create({
      name,
      emoji: emoji || '🍽️',
      price: Number(price),
      category: category || 'General',
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { name, emoji, price, category } = req.body;
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, emoji, price: Number(price), category },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Menu item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Menu item not found.' });
    res.json({ message: 'Item removed from menu.', item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
