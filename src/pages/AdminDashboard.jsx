// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import {
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  ArrowRight,
  Truck,
  ShoppingBag,
  Tag,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard = () => {
  const { orders } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchProducts();
        if (res && res.data) {
          setProducts(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PAID').length;
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 35).length;

  const recentOrders = orders.slice(0, 5);

  return (
    <AdminLayout title="Atelier Performance Overview">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Orders</div>
            <div className="font-serif text-3xl font-semibold text-stone-900 mt-2">{totalOrders}</div>
            <div className="text-[11px] text-stone-500 mt-1">Stored in LocalStorage</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Gross Revenue</div>
            <div className="font-serif text-3xl font-semibold text-stone-900 mt-2">
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Whop Checkout Settled</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending CJ Orders */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">Pending CJ Dispatch</div>
            <div className="font-serif text-3xl font-semibold text-amber-700 mt-2">{pendingOrders}</div>
            <div className="text-[11px] text-stone-500 mt-1">Awaiting CJ API submission</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">Low Stock Products</div>
            <div className="font-serif text-3xl font-semibold text-rose-700 mt-2">{lowStockProducts}</div>
            <div className="text-[11px] text-stone-500 mt-1">CJ stock &lt; 35 units</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/orders"
          className="bg-stone-900 hover:bg-black text-white p-6 rounded-2xl transition-all shadow-sm flex items-center justify-between group"
        >
          <div>
            <span className="text-gold-400 text-[10px] uppercase font-bold tracking-widest block">Direct Action</span>
            <h4 className="font-serif text-lg font-medium text-white mt-0.5">Manage & Dispatch Orders</h4>
            <p className="text-xs text-stone-400 mt-1">Click "Place on CJ" to sync orders to factory.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/products"
          className="bg-white border border-stone-200/90 hover:border-stone-300 p-6 rounded-2xl transition-all shadow-xs flex items-center justify-between group"
        >
          <div>
            <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest block">CJ Sync Engine</span>
            <h4 className="font-serif text-lg font-medium text-stone-900 mt-0.5">Synchronize Products</h4>
            <p className="text-xs text-stone-500 mt-1">Re-fetch real-time inventory & prices.</p>
          </div>
          <ShoppingBag className="w-5 h-5 text-stone-700" />
        </Link>

        <Link
          to="/admin/coupons"
          className="bg-white border border-stone-200/90 hover:border-stone-300 p-6 rounded-2xl transition-all shadow-xs flex items-center justify-between group"
        >
          <div>
            <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest block">Promotions</span>
            <h4 className="font-serif text-lg font-medium text-stone-900 mt-0.5">Manage Discount Codes</h4>
            <p className="text-xs text-stone-500 mt-1">Create percentage or flat discount vouchers.</p>
          </div>
          <Tag className="w-5 h-5 text-stone-700" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
          <div>
            <h3 className="font-serif text-xl text-stone-900">Recent Customer Orders</h3>
            <p className="text-xs text-stone-500 mt-0.5">Orders received via Whop Checkout</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-black flex items-center space-x-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            No customer orders registered yet. Test by completing a checkout from the storefront!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {ord.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{ord.customer?.name || 'Valued Customer'}</div>
                      <div className="text-[11px] text-stone-400">{ord.customer?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.items?.length || 0} pieces
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.status === 'PLACED_ON_CJ' ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Placed on CJ ({ord.cjOrderId})
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 mr-1" />
                          Paid (Needs Dispatch)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/orders"
                        className="text-stone-900 font-semibold underline hover:text-black"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
