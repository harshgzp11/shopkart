import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { addToWishlist } from '../services/api';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState('idle'); // 'idle' | 'added' | 'error'

  const isInCart = cartItems.some(
    (item) => item.product._id === product._id
  );

  const handleAddToCart = async () => {
    if (product.stock === 0) return;
    setCartLoading(true);
    setCartError('');
    try {
      await addToCart(product._id);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add to cart';
      setCartError(msg);
      setTimeout(() => setCartError(''), 3000);
    } finally {
      setCartLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    setWishlistLoading(true);
    try {
      const { toggleWishlist } = await import('../services/api');
      const res = await toggleWishlist(product._id);
      if (res.saved) {
        setWishlistStatus('added');
      } else {
        setWishlistStatus('idle');
      }
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      if (err?.response?.status === 409) {
        // Already in wishlist — treat as success
        setWishlistStatus('added');
      } else {
        setWishlistStatus('error');
        setTimeout(() => setWishlistStatus('idle'), 3000);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="product-card glass-panel group">
      {/* Image */}
      <div className="product-image-wrapper">
        <img src={product.image} alt={product.name} className="product-image" />

        {/* Wishlist button overlay */}
        <button
          id={`wishlist-btn-${product._id}`}
          onClick={handleAddToWishlist}
          disabled={wishlistLoading}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md border transition-all duration-200
            ${wishlistStatus === 'added'
              ? 'bg-rose-500 border-rose-500 text-white scale-110'
              : 'bg-white/90 border-gray-200 text-gray-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-300'
            }
          `}
          title={wishlistStatus === 'added' ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${
              wishlistStatus === 'added' ? 'fill-white scale-110' : ''
            }`}
          />
        </button>

        {product.stock <= 5 && product.stock > 0 && (
          <span className="stock-badge low-stock">Only {product.stock} left!</span>
        )}
        {product.stock === 0 && (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
      </div>

      {/* Info */}
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>

        {cartError && (
          <p className="text-red-500 text-xs mb-2 font-medium">{cartError}</p>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          {/* View Details */}
          <button
            id={`view-btn-${product._id}`}
            className="btn-secondary view-details-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            View Details
          </button>

          {/* Add to Cart */}
          <button
            id={`cart-btn-${product._id}`}
            className={`btn-primary cart-btn ${
              isInCart ? 'cart-btn-in-cart' : ''
            }`}
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            {cartLoading
              ? 'Adding...'
              : product.stock === 0
              ? 'Out of Stock'
              : isInCart
              ? 'Add Another'
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
