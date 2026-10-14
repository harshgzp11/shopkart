const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const connectToDatabase = require('./config/database');

const app = express();

app.use((req, res, next) => {
  if (req.url === '/api' || req.url.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api(?=\/|$)/, '') || '/';
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(503).json({
        success: false,
        message: 'The server is missing a valid JWT_SECRET configuration.'
      });
    }

    await connectToDatabase();
    return next();
  } catch (error) {
    console.error('Unable to prepare API request:', error);
    return res.status(503).json({
      success: false,
      message: 'The API or database is temporarily unavailable.'
    });
  }
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('ShopKart Authentication API is running...');
});

module.exports = app;
