import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const [updateLoading, setUpdateLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [error, setError] = useState('');

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const handleIncrease = async () => {
    if (quantity >= product.stock) return;
    setUpdateLoading(true);
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDecrease = async () => {
    if (quantity <= 1) return; // Use Remove instead
    setUpdateLoading(true);
    try {
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoveLoading(true);
    try {
      await removeFromCart(product._id);
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to remove item');
      setRemoveLoading(false);
    }
  };

  const lineTotal = product.price * quantity;

  return (
    <div className="cart-item">
      {/* Product Image */}
      <div className="cart-item-image">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-2"
        />
      </div>

      {/* Product Info */}
      <div className="cart-item-details">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
              {product.category}
            </span>
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate mt-0.5">
              {product.name}
            </h3>
            <p className="text-lg font-bold text-gray-900 mt-1">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
            {product.stock <= 5 && (
              <p className="text-xs text-orange-500 font-medium mt-0.5">
                Only {product.stock} left in stock
              </p>
            )}
          </div>
          <p className="text-xl font-extrabold text-gray-900 whitespace-nowrap">
            ₹{lineTotal.toLocaleString('en-IN')}
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-xs font-medium mt-1">{error}</p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 mt-3">
          {/* Quantity control */}
          <div className="quantity-control">
            <button
              id={`decrease-qty-${product._id}`}
              onClick={handleDecrease}
              disabled={updateLoading || quantity <= 1}
              className="quantity-btn"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="quantity-value" aria-label="quantity">
              {quantity}
            </span>
            <button
              id={`increase-qty-${product._id}`}
              onClick={handleIncrease}
              disabled={updateLoading || quantity >= product.stock}
              className="quantity-btn"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Remove button */}
          <button
            id={`remove-item-${product._id}`}
            onClick={handleRemove}
            disabled={removeLoading}
            className="remove-btn"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {removeLoading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
