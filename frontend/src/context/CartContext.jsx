import React, { useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateQty, removeFromCart as apiRemoveFromCart } from '../services/api';
import { CartContext } from './cart-context';

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
      const data = await getCart();
      if (data.success) {
        setCartItems(data.cart);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    let active = true;

    getCart()
      .then((data) => {
        if (active && data.success) {
          setCartItems(data.cart);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          if (err.response?.status === 401) {
            setCartItems([]);
            setError(null);
          } else {
            console.error('Failed to load cart:', err);
            setError('Unable to load your cart.');
          }
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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

  // Clear cart after verified checkout
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalItems,
        subtotal,
        fetchCart: refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
