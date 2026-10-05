import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrders, updateOrderStatus } from '../services/api';
import {
  Package,
  Calendar,
  MapPin,
  ChevronRight,
  ShoppingBag,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  Sparkles
} from 'lucide-react';

const STATUS_PROGRESSION = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrders();
      if (res.success) {
        setOrders(res.orders || []);
      } else {
        setError(res.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Bonus progression simulation
  const handleProgressStatus = async (orderId, currentStatus) => {
    const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= STATUS_PROGRESSION.length - 1) {
      return;
    }
    const nextStatus = STATUS_PROGRESSION[currentIndex + 1];

    try {
      setUpdatingId(orderId);
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: nextStatus } : ord))
        );
      }
    } catch (err) {
      console.error('Failed to advance order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PLACED':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Track your recent orders, payments, and shipment status
              </p>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            <span className="text-gray-500 font-medium text-sm">Loading your orders...</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <div className="text-4xl">⚠️</div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">Unable to load orders</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State (Task 8 requirement) */
          <div className="flex flex-col items-center justify-center h-80 gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">You have not placed any orders yet.</h2>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                Browse our catalogue and purchase your favorite products to see them here!
              </p>
            </div>
            <button
              id="start-shopping-btn"
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              const isDelivered = order.status === 'DELIVERED';
              const nextStatusIndex = STATUS_PROGRESSION.indexOf(order.status) + 1;
              const nextStatus =
                nextStatusIndex < STATUS_PROGRESSION.length
                  ? STATUS_PROGRESSION[nextStatusIndex]
                  : null;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs uppercase block font-medium">Order ID</span>
                        <span className="font-bold text-gray-900">#{order._id.slice(-8)}</span>
                      </div>
                      <div className="border-l border-gray-200 pl-4">
                        <span className="text-gray-400 text-xs uppercase block font-medium">Placed On</span>
                        <span className="text-gray-700 font-medium">{orderDate}</span>
                      </div>
                      <div className="border-l border-gray-200 pl-4">
                        <span className="text-gray-400 text-xs uppercase block font-medium">Total</span>
                        <span className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <button
                        onClick={() => navigate(`/order-success/${order._id}`, { state: { order } })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black hover:underline ml-2"
                      >
                        View Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Items */}
                  <div className="p-4 sm:p-5 divide-y divide-gray-50">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                            />
                          )}
                          <div className="truncate">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Quantity: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <p className="font-bold text-gray-900 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer: Delivery info & Bonus status stepper */}
                  <div className="px-4 sm:px-5 py-3.5 bg-gray-50/40 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        Delivering to {order.shippingAddress.fullName}, {order.shippingAddress.city} ({order.shippingAddress.pincode})
                      </span>
                    </div>

                    {/* Bonus Feature: Interactive status progression */}
                    {nextStatus && (
                      <button
                        onClick={() => handleProgressStatus(order._id, order.status)}
                        disabled={updatingId === order._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-700 hover:border-black rounded-lg text-xs font-semibold transition-all shadow-2xs hover:shadow-xs"
                        title="Simulate order milestone progression"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {updatingId === order._id ? 'Updating...' : `Advance to ${nextStatus}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
