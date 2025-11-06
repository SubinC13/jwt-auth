import { useEffect, useMemo, useState } from 'react';
import axios from '../utils/axios';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../state/AuthContext';

type Order = {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: string;
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const { show } = useToast();
  const isAdmin = user?.role === 'admin';

  const filtered = useMemo(() => orders.filter(o => !statusFilter || o.status === statusFilter), [orders, statusFilter]);

  async function load() {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders', { params: { status: statusFilter || undefined } });
      setOrders(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function createOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const orderId = String(form.get('orderId'));
    const totalAmount = Number(form.get('totalAmount'));
    try {
      await axios.post('/api/orders', {
        orderId,
        totalAmount,
        items: [{ productId: 'sku-1', name: 'Sample', quantity: 1, price: totalAmount }]
      });
      setShowModal(false);
      show({ type: 'success', message: `Order ${orderId} created` });
      load();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        show({ type: 'error', message: `Order ID "${orderId}" already exists` });
      } else {
        show({ type: 'error', message: err?.response?.data?.error || 'Failed to create order' });
      }
    }
  }

  async function updateStatus(id: string, status: Order['status']) {
    await axios.patch(`/api/orders/${id}`, { status });
    // Auto-create transaction when order is completed
    if (status === 'Completed') {
      const order = orders.find(o => o._id === id);
      if (order) {
        try {
          await axios.post('/api/transactions', {
            transactionId: `TX-${Date.now()}`,
            orderId: id, // Use MongoDB _id
            amount: order.totalAmount,
            paymentMethod: 'card',
            timestamp: new Date().toISOString()
          });
        } catch (err: any) {
          console.error('Failed to create transaction:', err?.response?.data?.error);
        }
      }
    }
    load();
  }

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      Failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Orders</h1>
        <div className="flex items-center gap-4 flex-shrink-0">
          <select 
            value={statusFilter} 
            onChange={(e)=>setStatusFilter(e.target.value)} 
            className="input px-4 py-2.5 text-sm h-[42px]"
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>Failed</option>
          </select>
          <button onClick={()=>setShowModal(true)} className="btn-primary whitespace-nowrap h-[42px]">
            <span className="mr-2">+</span> Create Order
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-400">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="card p-6 bg-red-500/10 border-red-500/50">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Created</th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(o => (
                  <tr key={o._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">{o.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-100">${o.totalAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(o.status)}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-400">{new Date(o.createdAt).toLocaleString()}</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-xs font-medium transition-colors border border-green-600/30"
                            onClick={()=>updateStatus(o._id, 'Completed')}
                          >
                            Complete
                          </button>
                          <button 
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium transition-colors border border-red-600/30"
                            onClick={()=>updateStatus(o._id, 'Failed')}
                          >
                            Fail
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                No orders found
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-50 p-4 !m-0">
          <form onSubmit={createOrder} className="card p-6 space-y-4 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-100">Create New Order</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Order ID</label>
              <input name="orderId" placeholder="ORD-001" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <input type="number" name="totalAmount" placeholder="0.00" step="0.01" className="input" required />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Order</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


