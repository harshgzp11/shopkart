import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProductById } from '../services/api';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProductById(id);
        if (data.success) {
          setProduct(data.product);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
          setError('Product not found.');
        } else {
          setError('Something went wrong while loading the product.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <button 
          onClick={() => navigate('/products')}
          className="inline-flex items-center text-gray-600 hover:text-black mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-3 text-lg text-gray-600">Loading details...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100">
            <p>{error}</p>
          </div>
        ) : product ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 flex justify-center items-center bg-gray-50">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-w-full max-h-[500px] object-contain drop-shadow-xl rounded-xl transition-transform hover:scale-105 duration-500" 
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-2">
                  <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <p className="text-3xl font-semibold text-gray-900 mb-6">₹{product.price.toLocaleString('en-IN')}</p>
                
                <div className="prose prose-sm text-gray-600 mb-8">
                  <p>{product.description}</p>
                </div>
                
                <div className="mb-8">
                  <p className="text-sm font-medium text-gray-500 mb-1">Availability</p>
                  {product.stock > 10 ? (
                    <span className="text-green-600 font-medium flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      In Stock ({product.stock} units)
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="text-orange-600 font-medium flex items-center">
                      <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                      Low Stock (Only {product.stock} left)
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <button 
                  className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-900 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:shadow-lg duration-200"
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
