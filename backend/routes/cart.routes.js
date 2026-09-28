const express = require('express');
const { addToCart, getCart, updateCartQuantity, removeFromCart } = require('../controllers/cart.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

const router = express.Router();

// All cart routes are protected
router.post('/:productId', protectRoute, addToCart);
router.get('/', protectRoute, getCart);
router.patch('/:productId', protectRoute, updateCartQuantity);
router.delete('/:productId', protectRoute, removeFromCart);

module.exports = router;
