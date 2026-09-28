const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

const router = express.Router();

// All wishlist routes are protected
router.post('/:productId', protectRoute, addToWishlist);
router.get('/', protectRoute, getWishlist);
router.delete('/:productId', protectRoute, removeFromWishlist);

module.exports = router;
