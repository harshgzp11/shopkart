const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protectRoute } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

router.post('/', protectRoute, requireAdmin, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
