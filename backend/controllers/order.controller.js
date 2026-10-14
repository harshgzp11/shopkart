const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const getRazorpayConfig = require('../config/razorpay');

// Helper to validate shipping address
const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return 'Shipping address is required';
  }
  const { fullName, phone, addressLine1, city, state, pincode } = address;

  if (
    !fullName?.trim() ||
    !phone?.trim() ||
    !addressLine1?.trim() ||
    !city?.trim() ||
    !state?.trim() ||
    !pincode?.trim()
  ) {
    return 'All shipping address fields are required and cannot be whitespace only';
  }

  // Phone validation (at least 10 digits)
  const phoneClean = phone.replace(/[\s-]/g, '');
  if (!/^\+?[0-9]{10,13}$/.test(phoneClean)) {
    return 'Phone number must be a valid 10-digit number';
  }

  // Pincode validation (exactly 6 digits for Indian pincodes)
  if (!/^\d{6}$/.test(pincode.trim())) {
    return 'Pincode must contain 6 digits';
  }

  return null;
};

/**
 * POST /orders/create-payment-order
 * 1. Authenticate user
 * 2. Load user cart
 * 3. Reject if cart is empty
 * 4. Load latest product data for each item
 * 5. Verify stock
 * 6. Build purchase-time snapshot & calculate total on backend
 * 7. Create pending ShopKart order
 * 8. Create Razorpay order in paise
 * 9. Save razorpayOrderId to ShopKart order
 * 10. Return checkout info (shopKartOrderId, razorpayOrderId, amount, currency, key)
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    let razorpayConfig;
    try {
      razorpayConfig = getRazorpayConfig();
    } catch (error) {
      if (error.code === 'RAZORPAY_NOT_CONFIGURED') {
        return res.status(503).json({
          success: false,
          message: 'Payment gateway is not configured. Set Razorpay credentials on the server.'
        });
      }
      throw error;
    }

    // Validate shipping address
    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    // Load customer and cart
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Cannot checkout.'
      });
    }

    // Fetch latest product docs for all items in cart
    const orderItems = [];
    let calculatedTotal = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart are no longer available.'
        });
      }

      // Check stock
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, in cart: ${cartItem.quantity}.`
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      calculatedTotal += itemTotal;

      // Purchase-time snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });
    }

    // Create pending ShopKart order in MongoDB
    const shopKartOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      totalAmount: calculatedTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    await shopKartOrder.save();

    // Create Razorpay order in paise
    let razorpayOrderId = null;
    const amountInPaise = Math.round(calculatedTotal * 100);

    try {
      const razorpayOrder = await razorpayConfig.client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: shopKartOrder._id.toString()
      });
      razorpayOrderId = razorpayOrder.id;
      shopKartOrder.razorpayOrderId = razorpayOrderId;
      await shopKartOrder.save();
    } catch (rzpErr) {
      console.error('Razorpay order creation error:', rzpErr.message || rzpErr);
      // If Razorpay API credentials are not real or failed, we log and return error
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order with payment gateway: ' + (rzpErr.error?.description || rzpErr.message)
      });
    }

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id.toString(),
      razorpayOrderId: shopKartOrder.razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: razorpayConfig.keyId
    });
  } catch (error) {
    console.error('Error in createPaymentOrder:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /orders/verify-payment
 * 1. Authenticate user
 * 2. Receive shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature
 * 3. Verify order exists and belongs to user
 * 4. Verify HMAC SHA256 signature using razorpayOrderId from DB + razorpay_payment_id + secret
 * 5. If valid, mark paymentStatus = PAID, status = PLACED, save razorpayPaymentId
 * 6. Deduct stock for purchased items
 * 7. Clear user cart
 * 8. Return confirmed order
 */
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access to another user order is denied' });
    }

    if (
      order.paymentStatus !== 'PENDING' ||
      order.status !== 'PENDING_PAYMENT' ||
      !order.razorpayOrderId ||
      razorpay_order_id !== order.razorpayOrderId
    ) {
      return res.status(409).json({ success: false, message: 'Payment order is not pending or does not match' });
    }

    let razorpayConfig;
    try {
      razorpayConfig = getRazorpayConfig();
    } catch (error) {
      if (error.code === 'RAZORPAY_NOT_CONFIGURED') {
        return res.status(503).json({
          success: false,
          message: 'Payment gateway is not configured. Set Razorpay credentials on the server.'
        });
      }
      throw error;
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest();
    const receivedSignature = Buffer.from(razorpay_signature, 'hex');

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Successful payment
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock for purchased items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and order placed',
      order
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /orders
 * Return all orders belonging to authenticated user, sorted newest first
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /orders/:id
 * Return single order by ID with ownership check
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access to another user order is denied'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /orders/:id/status (Bonus Challenge: Order status progression)
 * PLACED -> CONFIRMED -> SHIPPED -> DELIVERED
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusTransitions = {
      PLACED: 'CONFIRMED',
      CONFIRMED: 'SHIPPED',
      SHIPPED: 'DELIVERED'
    };
    const allowedStatuses = Object.values(statusTransitions);
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'PAID' || statusTransitions[order.status] !== status) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
