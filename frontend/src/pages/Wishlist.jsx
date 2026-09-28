import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWishlist, removeFromWishlist } from '../services/api';
import { Heart, ShoppingBag, Trash2, Eye, RefreshCw } from 'lucide-react';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load your wishlist.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-0.5">
                {wishlist.length === 0
                  ? 'No products saved yet'
                  : `${wishlist.length} product${wishlist.length !== 1 ? 's' : ''} saved`}
              </p>
            )}
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
            <span className="text-gray-500 font-medium">Loading your wishlist...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-2xl border border-red-100 shadow-sm">
            <div className="text-5xl">😕</div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">Something went wrong</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchWishlist}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
              <Heart className="h-10 w-10 text-rose-300" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">Your wishlist is empty</h2>
              <p className="text-gray-500 text-sm mt-1">
                Save products you love and find them here later.
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="wishlist-card bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full border border-orange-200">
                      Only {product.stock} left!
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full border border-red-200">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-xl font-extrabold text-gray-900 mb-1">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                  </p>

                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      id={`wishlist-view-${product._id}`}
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button
                      id={`wishlist-remove-${product._id}`}
                      onClick={() => handleRemove(product._id)}
                      disabled={removingId === product._id}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-medium hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      {removingId === product._id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
