const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } = require('../controllers/wishlist.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

const router = express.Router();


router.post('/:productId', protectRoute, addToWishlist);
router.get('/', protectRoute, getWishlist);
router.delete('/:productId', protectRoute, removeFromWishlist);
router.patch('/:productId/toggle', protectRoute, toggleWishlist);

module.exports = router;
