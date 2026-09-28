const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);

    const alreadyInWishlist = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadyInWishlist) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error in addToWishlist:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description'
    });

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist
    });
  } catch (error) {
    console.error('Error in getWishlist:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist' });
    }

    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved = false;
    if (index === -1) {
      customer.wishlist.push(productId);
      saved = true;
    } else {
      customer.wishlist.splice(index, 1);
      saved = false;
    }

    await customer.save();
    return res.status(200).json({ success: true, saved, message: saved ? 'Product added to wishlist' : 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error in toggleWishlist:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist };
