// src/pages/admin/AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCart } from '../../context/CartContext';
import { placeOrderOnCJ } from '../../services/api';
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  AlertCircle,
  X,
  Send,
  Loader2,
} from 'lucide-react';

export const AdminOrders = () => {
  const { orders, updateOrderStatus, refreshOrders } = useCart();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    refreshOrders().catch((error) => setNotification({ type: 'error', message: error.message }));
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === 'PAID' && order.status !== 'PAID') return false;
    if (filter === 'PAYMENT_REVIEW' && order.status !== 'PAYMENT_REVIEW') return false;
    if (filter === 'PLACED_ON_CJ' && order.status !== 'PLACED_ON_CJ' && order.status !== 'DISPATCHED') return false;
    if (search) {
      const q = search.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchCustomer = (order.customer?.name || '').toLowerCase().includes(q);
      const matchEmail = (order.customer?.email || '').toLowerCase().includes(q);
      const matchCj = (order.cjOrderId || '').toLowerCase().includes(q);
      return matchId || matchCustomer || matchEmail || matchCj;
    }
    return true;
  });

  const handlePlaceOrder = async (order) => {
    setLoadingOrderId(order.id);
    setNotification(null);

    try {
      const payload = {
        orderId: order.id,
        customer: order.customer,
        shippingAddress: order.shippingAddress || {
          street: order.customer?.street,
          city: order.customer?.city,
          state: order.customer?.state,
          zip: order.customer?.postalCode,
          country: order.customer?.country,
          countryCode: order.customer?.countryCode || 'US',
        },
        items: (order.items || []).map((it) => ({
          sku: it.sku,
          vid: it.vid,
          quantity: it.quantity,
        })),
        payType: 3,
      };

      const result = await placeOrderOnCJ(payload);

      if (result.success) {
        await updateOrderStatus(order.id, 'PLACED_ON_CJ', result.cjOrderId);
        setNotification({
          type: 'success',
          message: `Order ${order.id} was created in CJ and is awaiting CJ payment. Reference: ${result.cjOrderId}`,
        });
      } else {
        setNotification({
          type: 'error',
          message: `Dispatch failed: ${result.error || 'Check supplier connection'}`,
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to place order: ${err.message}`,
      });
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <AdminLayout title="Customer Orders Management">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-700 ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === 'ALL'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button type="button" onClick={() => setFilter('PAYMENT_REVIEW')} className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider ${filter === 'PAYMENT_REVIEW' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800'}`}>
            Verify Payment ({orders.filter((o) => o.status === 'PAYMENT_REVIEW').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PAID')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === 'PAID'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            Pending Dispatch ({orders.filter((o) => o.status === 'PAID').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PLACED_ON_CJ')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === 'PLACED_ON_CJ'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            Dispatched ({orders.filter((o) => o.status === 'PLACED_ON_CJ' || o.status === 'DISPATCHED').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search Order ID, Name, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            No customer orders matching current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-100">
                <tr>
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items / SKUs</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status & Reference</th>
                  <th className="py-3.5 px-5 text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredOrders.map((order) => {
                  const isProcessing = loadingOrderId === order.id;
                  const isPlaced = order.status === 'PLACED_ON_CJ' || order.status === 'DISPATCHED';

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono font-bold text-stone-900 hover:underline flex items-center space-x-1"
                        >
                          <span>{order.id}</span>
                          <Eye className="w-3 h-3 text-stone-400" />
                        </button>
                        <div className="text-[10px] text-stone-400 mt-0.5">{order.paymentMethod || 'Online Payment'}</div>
                      </td>

                      <td className="py-4 px-4 text-stone-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()} <br />
                        <span className="text-[10px] text-stone-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-stone-900">{order.customer?.name}</div>
                        <div className="text-[11px] text-stone-400">{order.customer?.email}</div>
                        <div className="text-[10px] text-stone-500 truncate max-w-xs">
                          {order.customer?.city}, {order.customer?.country}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-stone-900">
                          {order.items?.length || 0} items
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5 max-w-[12rem] truncate">
                          {order.items?.map((it) => it.sku).join(', ')}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-stone-900 font-serif text-sm">
                          ${order.total.toFixed(2)}
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Saved ${order.discountAmount.toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {isPlaced ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Dispatched
                            </span>
                            <div className="text-[10px] font-mono text-stone-500 font-semibold pl-1">
                              ID: {order.cjOrderId}
                            </div>
                          </div>
                        ) : order.status === 'PAYMENT_REVIEW' ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full"><Clock className="w-3 h-3 mr-1" />Payment verification needed</span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 mr-1 text-amber-600" />
                            Paid (Ready to Dispatch)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {isPlaced ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                          >
                            Inspect Details
                          </button>
                        ) : order.status === 'PAYMENT_REVIEW' ? (
                          <button type="button" onClick={() => { updateOrderStatus(order.id, 'PAID'); setSelectedOrder({ ...order, status: 'PAID' }); }} className="px-3 py-2 rounded-xl bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wide">Mark Whop payment verified</button>
                        ) : (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handlePlaceOrder(order)}
                            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow flex items-center space-x-1.5 ml-auto disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Dispatching...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5 text-amber-400" />
                                <span>Dispatch to Factory</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Order Inspection</span>
                <h3 className="font-serif text-2xl text-stone-900 font-medium">Order {selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-stone-700">
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Fulfillment Status</span>
                  <span className="font-semibold text-stone-900">
                    {selectedOrder.status === 'PLACED_ON_CJ' || selectedOrder.status === 'DISPATCHED'
                      ? `Dispatched to Production (Reference: ${selectedOrder.cjOrderId})`
                      : selectedOrder.status === 'PAYMENT_REVIEW' ? 'Payment must be verified in Whop before dispatch.' : 'Paid and ready for dispatch.'}
                  </span>
                </div>
                {selectedOrder.status !== 'PLACED_ON_CJ' && selectedOrder.status !== 'DISPATCHED' && (
                  selectedOrder.status === 'PAYMENT_REVIEW' ? (
                    <button type="button" onClick={() => { updateOrderStatus(selectedOrder.id, 'PAID'); setSelectedOrder({ ...selectedOrder, status: 'PAID' }); }} className="px-4 py-2 bg-rose-700 text-white text-xs font-semibold rounded-xl">Mark payment verified</button>
                  ) : <button type="button" onClick={() => { handlePlaceOrder(selectedOrder); setSelectedOrder(null); }} className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl">Dispatch Now</button>
                )}
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-stone-200/80">
                  <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-2">Customer Profile</h4>
                  <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
                </div>

                <div className="p-4 rounded-2xl border border-stone-200/80">
                  <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-2">Destination Address</h4>
                  <p>{selectedOrder.customer?.street}</p>
                  <p>{selectedOrder.customer?.city}, {selectedOrder.customer?.state} {selectedOrder.customer?.postalCode}</p>
                  <p>{selectedOrder.customer?.country}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-stone-200/80 rounded-2xl p-4">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-3">Order Items ({selectedOrder.items?.length})</h4>
                <div className="space-y-3 divide-y divide-stone-100">
                  {selectedOrder.items?.map((it, i) => (
                    <div key={i} className="pt-2 first:pt-0 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {it.image && (
                          <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100" />
                        )}
                        <div>
                          <div className="font-medium text-stone-900">{it.name}</div>
                          <div className="text-[10px] font-mono text-stone-400">SKU: {it.sku} {it.vid ? `• VID: ${it.vid}` : ''}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-stone-900">${(it.price * it.quantity).toFixed(2)}</div>
                        <div className="text-[10px] text-stone-400">Qty: {it.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial summary */}
              <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({selectedOrder.couponCode || 'Voucher'})</span>
                    <span>-${selectedOrder.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{selectedOrder.shippingTotal === 0 || selectedOrder.shipping === 0 ? 'Free' : `$${(selectedOrder.shipping || selectedOrder.shippingTotal || 12.99).toFixed(2)}`}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-serif font-bold text-base text-stone-950">
                  <span>Total Amount</span>
                  <span>${selectedOrder.total?.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
