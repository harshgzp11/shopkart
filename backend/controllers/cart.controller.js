const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// POST /cart/:productId — Add product to cart (or increment quantity)
const addToCart = async (req, res) => {
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
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Increment quantity
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock`
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      // Add new cart item
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: 'Product is out of stock' });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    // Return populated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category description'
    });

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCustomer.cart
    });
  } catch (error) {
    console.error('Error in addToCart:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /cart — Get current user's cart (populated)
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category description'
    });

    return res.status(200).json({
      success: true,
      cart: customer.cart
    });
  } catch (error) {
    console.error('Error in getCart:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /cart/:productId — Update product quantity in cart
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a number' });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock`
      });
    }

    const customer = await Customer.findById(req.user._id);
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    cartItem.quantity = quantity;
    await customer.save();

    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category description'
    });

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCustomer.cart
    });
  } catch (error) {
    console.error('Error in updateCartQuantity:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /cart/:productId — Remove product from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);
    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category description'
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCustomer.cart
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };
