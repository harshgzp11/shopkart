import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  createProduct,
  getAllOrders,
  getCurrentUser,
  getProducts,
  updateOrderStatus
} from '../services/api';

const STATUS_TRANSITIONS = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED'
};

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  stock: ''
};

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshDashboard = useCallback(async () => {
    const [productData, orderData] = await Promise.all([getProducts(), getAllOrders()]);
    if (!productData.success || !orderData.success) {
      throw new Error('Unable to load admin data.');
    }
    setProducts(productData.products);
    setOrders(orderData.orders);
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const user = await getCurrentUser();
        if (user.role !== 'ADMIN') {
          navigate('/home', { replace: true });
          return;
        }

        const [productData, orderData] = await Promise.all([getProducts(), getAllOrders()]);
        if (active) {
          setProducts(productData.products || []);
          setOrders(orderData.orders || []);
        }
      } catch (err) {
        if (active) {
          if (err.response?.status === 401) {
            navigate('/login', { replace: true });
          } else {
            console.error('Failed to load admin dashboard:', err);
            setError(err.response?.data?.message || 'Unable to load admin dashboard.');
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initialize();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await createProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock)
      });
      if (!response.success) {
        throw new Error(response.message || 'Unable to create product.');
      }
      setForm(EMPTY_PRODUCT);
      setNotice('Product created successfully.');
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to create product:', err);
      setError(err.response?.data?.message || err.message || 'Unable to create product.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (order) => {
    const status = STATUS_TRANSITIONS[order.status];
    if (!status) return;

    setUpdatingOrderId(order._id);
    setError('');
    try {
      const response = await updateOrderStatus(order._id, status);
      setOrders((current) =>
        current.map((item) => item._id === order._id ? response.order : item)
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err.response?.data?.message || 'Unable to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Admin dashboard</h1>
          <p className="mt-1 text-gray-600">Manage the product catalogue and customer orders.</p>
        </header>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {notice}
          </div>
        )}

        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Add a product</h2>
          <form onSubmit={handleProductSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Product name
              <input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Category
              <input required maxLength={80} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              Description
              <textarea required maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Image URL
              <input required type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Price (₹)
                <input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Stock
                <input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            </div>
            <button disabled={saving} className="rounded-lg bg-black px-5 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-60 md:col-span-2">
              {saving ? 'Saving…' : 'Add product'}
            </button>
          </form>
        </section>

        {loading ? (
          <p className="py-10 text-center text-gray-600">Loading dashboard…</p>
        ) : (
          <>
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Products ({products.length})</h2>
              {products.length === 0 ? (
                <p className="mt-4 text-gray-600">No products have been added yet.</p>
              ) : (
                <div className="mt-4 divide-y divide-gray-100">
                  {products.map((product) => (
                    <div key={product._id} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category} · {product.stock} in stock</p>
                        </div>
                      </div>
                      <p className="whitespace-nowrap font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Recent orders ({orders.length})</h2>
              {orders.length === 0 ? (
                <p className="mt-4 text-gray-600">No orders have been placed yet.</p>
              ) : (
                <div className="mt-4 divide-y divide-gray-100">
                  {orders.map((order) => {
                    const nextStatus = STATUS_TRANSITIONS[order.status];
                    return (
                      <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user?.fullName || 'Customer'} · ₹{order.totalAmount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user?.email || 'Unknown email'} · {order.paymentStatus} · {order.status}
                          </p>
                        </div>
                        {nextStatus && order.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => handleStatusUpdate(order)}
                            disabled={updatingOrderId === order._id}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:border-black disabled:opacity-60"
                          >
                            {updatingOrderId === order._id ? 'Updating…' : `Advance to ${nextStatus}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
