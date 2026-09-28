import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { LogOut, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition-colors px-1 py-1 ${
      isActive(path)
        ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black after:rounded-full'
        : 'text-gray-500 hover:text-black'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                ShopKart
              </span>
            </button>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-6">
              <button onClick={() => navigate('/home')} className={navLinkClass('/home')}>
                Home
              </button>
              <button onClick={() => navigate('/products')} className={navLinkClass('/products')}>
                Products
              </button>
              <button onClick={() => navigate('/wishlist')} className={`${navLinkClass('/wishlist')} flex items-center gap-1`}>
                <Heart className="h-3.5 w-3.5" />
                Wishlist
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart button with count badge */}
            <button
              id="nav-cart-btn"
              onClick={() => navigate('/cart')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/cart')
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                    isActive('/cart')
                      ? 'bg-white text-black'
                      : 'bg-black text-white'
                  } transition-all`}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              id="nav-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
