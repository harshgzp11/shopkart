import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, RefreshCw, ArrowRight, Tag } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, totalItems, subtotal, fetchCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-0.5">
                {totalItems === 0
                  ? 'Your cart is empty'
                  : `${totalItems} item${totalItems !== 1 ? 's' : ''} in cart`}
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            <span className="text-gray-500 font-medium">Loading your cart...</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-2xl border border-red-100 shadow-sm">
            <div className="text-5xl">😕</div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">Unable to load your cart</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
            <button
              id="cart-retry-btn"
              onClick={fetchCart}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-72 gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-gray-300" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">Your cart is empty 🛒</h2>
              <p className="text-gray-500 text-sm mt-1">
                Looks like you haven't added anything yet.
              </p>
            </div>
            <button
              id="cart-browse-btn"
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </button>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items — 2 columns on large screens */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  {/* Per-item breakdown */}
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate flex-1 mr-2">
                        {item.product.name}
                        <span className="text-gray-400 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-3 mt-1">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  id="checkout-btn"
                  disabled
                  className="mt-6 w-full py-4 bg-black text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  title="Coming in Lab-06"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-xs text-center text-gray-400 mt-2">
                  Checkout coming in Lab-06 🚀
                </p>

                <button
                  onClick={() => navigate('/products')}
                  className="mt-3 w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
