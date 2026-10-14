const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  resumePayment,
  cancelPendingOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protectRoute } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

// All order routes require authentication
router.use(protectRoute);

// POST /orders and POST /orders/create-payment-order
router.post('/', createPaymentOrder);
router.post('/create-payment-order', createPaymentOrder);
router.post('/:id/resume-payment', resumePayment);
router.patch('/:id/cancel', cancelPendingOrder);

// POST /orders/verify-payment
router.post('/verify-payment', verifyPayment);

// GET /orders
router.get('/', getMyOrders);

// GET /orders/admin/all
router.get('/admin/all', requireAdmin, getAllOrders);

// GET /orders/:id
router.get('/:id', getOrderById);

// PATCH /orders/:id/status (Bonus challenge)
router.patch('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
