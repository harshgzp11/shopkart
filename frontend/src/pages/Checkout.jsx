import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import {
  CreditCard,
  MapPin,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  Loader2
} from 'lucide-react';

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, subtotal, totalItems, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Validate form fields
  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/[\s-]/g, '');
      if (!/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
        errs.phone = 'Phone must contain a valid 10-digit number';
      }
    }

    if (!formData.addressLine1.trim()) {
      errs.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      errs.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errs.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setGeneralError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);
    setGeneralError(null);

    try {
      // 1. Create payment order on backend
      const res = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim()
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to initialize payment order');
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res;

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: key || 'rzp_test_placeholder',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `ShopKart Order #${shopKartOrderId.slice(-6)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            setSubmitting(true);
            const verifyRes = await verifyPayment({
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              // 4. Payment verified successfully:
              // Clear global cart state immediately (Task 5)
              clearCart();
              // Navigate to order confirmation screen (Task 6)
              navigate(`/order-success/${shopKartOrderId}`, {
                state: { order: verifyRes.order }
              });
            } else {
              setGeneralError(verifyRes.message || 'Payment verification failed.');
              setSubmitting(false);
            }
          } catch (err) {
            console.error('Verification error:', err);
            setGeneralError(
              err.response?.data?.message ||
              'Payment verification failed. Your cart has not been cleared.'
            );
            setSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone
        },
        theme: {
          color: '#111827'
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setGeneralError(
          `Payment failed: ${response.error.description || 'Transaction cancelled'}. Your cart has not been cleared.`
        );
        setSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setGeneralError(
        err.response?.data?.message ||
        err.message ||
        'An error occurred while creating your order. Please try again.'
      );
      setSubmitting(false);
    }
  };

  // If cart is empty and not loading, display empty cart prompt
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-3xl mx-auto px-4 py-16 w-full text-center">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-6">
              You must have items in your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Explore Products
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete your shipping address and pay securely with Razorpay
          </p>
        </div>

        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-semibold">Unable to complete checkout</p>
              <p>{generalError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Details Form — 2 Columns on LG */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <MapPin className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
              </div>

              <form onSubmit={handlePlaceOrder} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Aarav Sharma"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.fullName
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:border-black focus:ring-gray-100'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:border-black focus:ring-gray-100'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="addressLine1"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.addressLine1
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:border-black focus:ring-gray-100'
                      }`}
                    />
                    {errors.addressLine1 && (
                      <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="city"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.city
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:border-black focus:ring-gray-100'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="state"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Karnataka"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.state
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:border-black focus:ring-gray-100'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="pincode"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Pincode (6 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 560001"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.pincode
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-200 focus:border-black focus:ring-gray-100'
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                  </div>
                  <span>Test Mode payment</span>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary & Payment Button */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-700" />
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto mb-5 pr-1 divide-y divide-gray-50">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-sm text-gray-700"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-11 h-11 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                        />
                      )}
                      <div className="truncate">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-3 mt-1">
                  <span>Total Amount</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                id="place-order-btn"
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="mt-6 w-full py-4 bg-black text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Place Order & Pay
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
                <span>Razorpay Test Mode enabled</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
