import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LogOut, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always redirect to login even if API fails
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 text-black" />
            <span className="ml-2 text-xl font-semibold text-gray-900 tracking-tight cursor-pointer" onClick={() => navigate('/home')}>
              ShopKart
            </span>
            <div className="ml-10 flex space-x-4">
              <button onClick={() => navigate('/home')} className="text-gray-700 hover:text-black font-medium transition-colors">Home</button>
              <button onClick={() => navigate('/products')} className="text-gray-700 hover:text-black font-medium transition-colors">Products</button>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
