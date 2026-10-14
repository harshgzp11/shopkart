import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById, resumePayment, verifyPayment } from '../services/api';
import { useCart } from '../context/useCart';
import {
  AlertCircle,
  CheckCircle,
  Package,
  ArrowRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Loader2
} from 'lucide-react';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [resumingPayment, setResumingPayment] = useState(false);

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
  const isCancelled = order.status === 'CANCELLED';
  const amountLabel = isPaid ? 'Total Paid' : isCancelled ? 'Order Total' : 'Amount Due';
  const bannerTitle = isPaid
    ? 'Order Placed Successfully!'
    : isCancelled
      ? 'Order Cancelled'
      : paymentFailed
        ? 'Payment Failed'
        : 'Payment Pending';
  const bannerMessage = isPaid
    ? 'Thank you for shopping with ShopKart. Your order is confirmed.'
    : isCancelled
      ? 'This order was cancelled. If you completed a payment, refresh your orders or contact support.'
      : paymentFailed
        ? 'Your payment was not completed, so this order was not placed. Your cart is still available.'
        : 'Payment has not been confirmed. This order is not placed until payment succeeds.';

  const continuePayment = async () => {
    setResumingPayment(true);
    setPaymentError('');

    try {
      const checkout = await resumePayment(order._id);
      if (!checkout.success) {
        throw new Error(checkout.message || 'Unable to resume payment.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay Checkout. Check your internet connection and try again.');
      }

      const razorpay = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        name: 'ShopKart',
        description: `ShopKart Order #${order._id.slice(-6)}`,
        order_id: checkout.razorpayOrderId,
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              shopKartOrderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (!result.success) {
              throw new Error(result.message || 'Payment verification failed.');
            }

            setOrder(result.order);
            clearCart();
            setPaymentError('');
          } catch (err) {
            console.error('Payment verification failed:', err);
            setPaymentError(
              err.response?.data?.message || err.message || 'Payment verification failed. Contact support if you were charged.'
            );
          } finally {
            setResumingPayment(false);
          }
        },
        modal: {
          ondismiss: () => setResumingPayment(false)
        },
        theme: { color: '#111827' }
      });

      razorpay.on('payment.failed', (response) => {
        setPaymentError(response.error?.description || 'Payment failed. You can try again.');
        setResumingPayment(false);
      });
      razorpay.open();
    } catch (err) {
      console.error('Unable to resume payment:', err);
      setPaymentError(
        err.response?.status === 404
          ? 'Payment recovery is not available on the connected server yet. Restart the backend locally or deploy the latest backend code, then try again.'
          : err.response?.data?.message || err.message || 'Unable to resume payment.'
      );
      setResumingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className={`${isPaid ? 'bg-emerald-500' : isCancelled ? 'bg-gray-600' : 'bg-red-600'} px-6 py-8 text-center text-white`}>
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
                    ? 'bg-red-100 text-red-800'
                    : order.status === 'CANCELLED'
                      ? 'bg-gray-100 text-gray-700'
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
                      : 'bg-red-100 text-red-800'
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
                  <span className="text-xs text-gray-500">{amountLabel}</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {paymentError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {paymentError}
              </p>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              {!isPaid && !paymentFailed && !isCancelled && (
                <button
                  id="continue-payment-btn"
                  onClick={continuePayment}
                  disabled={resumingPayment}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {resumingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {resumingPayment ? 'Opening payment...' : 'Continue with payment'}
                </button>
              )}
              <button
                id="view-my-orders-btn"
                onClick={() => navigate('/orders')}
                className="flex-1 py-3 px-4 bg-black text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <Package className="h-4 w-4" />
                View My Orders
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
