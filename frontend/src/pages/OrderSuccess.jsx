import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/api';
import {
  AlertCircle,
  CheckCircle,
  Package,
  ArrowRight,
  ShoppingBag,
  MapPin,
  CreditCard
} from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    getOrderById(id)
      .then((res) => {
        if (active && res.success) {
          setOrder(res.order);
        } else if (active) {
          setError(res.message || 'Order not found');
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Error fetching order details:', err);
          setError(err.response?.data?.message || 'Unable to retrieve order details.');
          setOrder(null);
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
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'Could not find the requested order.'}</p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              View My Orders
            </button>
          </div>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const isPaid = order.paymentStatus === 'PAID';
  const paymentFailed = order.paymentStatus === 'FAILED';
  const bannerTitle = isPaid
    ? 'Order Placed Successfully!'
    : paymentFailed
      ? 'Payment Failed'
      : 'Payment Pending';
  const bannerMessage = isPaid
    ? 'Thank you for shopping with ShopKart. Your order is confirmed.'
    : paymentFailed
      ? 'Your payment was not completed, so this order was not placed. Your cart is still available.'
      : 'Payment has not been confirmed. This order is not placed until payment succeeds.';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className={`${isPaid ? 'bg-emerald-500' : paymentFailed ? 'bg-red-600' : 'bg-amber-500'} px-6 py-8 text-center text-white`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              {isPaid ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <AlertCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {bannerTitle}
            </h1>
            <p className="text-white/90 text-sm mt-1">
              {bannerMessage}
            </p>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Order meta bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Order ID</p>
                <p className="font-semibold text-gray-900 truncate" title={order._id}>
                  #{order._id.slice(-8)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Date</p>
                <p className="font-semibold text-gray-900">{formattedDate}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Status</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-full ${
                  order.status === 'PENDING_PAYMENT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Payment</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-full ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items Purchased */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                Items Purchased ({order.items.length})
              </h2>
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                        />
                      )}
                      <div className="truncate">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-100 rounded-xl">
                <h3 className="text-xs uppercase font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Delivery Address
                </h3>
                <p className="font-semibold text-gray-900 text-sm">{order.shippingAddress.fullName}</p>
                <p className="text-xs text-gray-600 mt-0.5">{order.shippingAddress.addressLine1}</p>
                <p className="text-xs text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-xs text-gray-500 mt-1">Phone: {order.shippingAddress.phone}</p>
              </div>

              <div className="p-4 border border-gray-100 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    Payment Details
                  </h3>
                  <p className="text-xs text-gray-600">
                    Method: Razorpay{isPaid ? '' : ' checkout'}
                  </p>
                  {order.razorpayPaymentId && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      Payment ID: {order.razorpayPaymentId}
                    </p>
                  )}
                </div>
                <div className="pt-3 border-t border-gray-100 mt-2 flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">{isPaid ? 'Total Paid' : 'Amount Due'}</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                id="view-my-orders-btn"
                onClick={() => navigate(isPaid ? '/orders' : '/cart')}
                className="flex-1 py-3 px-4 bg-black text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                {isPaid ? <Package className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                {isPaid ? 'View My Orders' : 'Return to Cart'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                id="continue-shopping-btn"
                onClick={() => navigate('/products')}
                className="py-3 px-6 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
