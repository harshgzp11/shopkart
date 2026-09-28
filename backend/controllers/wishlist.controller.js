const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// POST /wishlist/:productId — Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);

    // Prevent duplicates
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

// GET /wishlist — Get current user's wishlist (populated)
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

// DELETE /wishlist/:productId — Remove product from wishlist
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

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
