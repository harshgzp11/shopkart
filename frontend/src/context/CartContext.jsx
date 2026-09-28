import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateQty, removeFromCart as apiRemoveFromCart } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived values — calculated from state, never stored separately
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Fetch cart from backend — called on mount and after mutations
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      if (data.success) {
        setCartItems(data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart — if already present, backend increments quantity
  const addToCart = async (productId) => {
    const data = await apiAddToCart(productId);
    if (data.success) {
      setCartItems(data.cart);
    }
    return data;
  };

  // Update quantity for a single item
  const updateQuantity = async (productId, quantity) => {
    const data = await apiUpdateQty(productId, quantity);
    if (data.success) {
      setCartItems(data.cart);
    }
    return data;
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    const data = await apiRemoveFromCart(productId);
    if (data.success) {
      setCartItems(data.cart);
    }
    return data;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalItems,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for consuming the context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
