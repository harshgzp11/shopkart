const Product = require('../models/product.model');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (price <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid price. Price must be greater than 0.' });
    }

    if (stock < 0) {
      return res.status(400).json({ success: false, message: 'Invalid stock. Stock cannot be negative.' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    await product.save();
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    if (category && category !== 'All Categories') {
      query.category = category;
    }

    let productQuery = Product.find(query);

    if (sort) {
      if (sort === 'price_asc') {
        productQuery = productQuery.sort({ price: 1 });
      } else if (sort === 'price_desc') {
        productQuery = productQuery.sort({ price: -1 });
      }
    }

    const products = await productQuery;

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
