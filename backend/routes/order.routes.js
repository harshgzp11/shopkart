const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

// All order routes require authentication
router.use(protectRoute);

// POST /orders and POST /orders/create-payment-order
router.post('/', createPaymentOrder);
router.post('/create-payment-order', createPaymentOrder);

// POST /orders/verify-payment
router.post('/verify-payment', verifyPayment);

// GET /orders
router.get('/', getMyOrders);

// GET /orders/:id
router.get('/:id', getOrderById);

// PATCH /orders/:id/status (Bonus challenge)
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
