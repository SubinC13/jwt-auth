import { useEffect, useMemo, useState } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../components/ToastProvider';

type Tx = {
  _id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  createdAt: string;
};

type Order = {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Failed';
};

export default function Transactions() {
  const { user } = useAuth();
  const { show } = useToast();
  const [tx, setTx] = useState<Tx[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  async function load() {
    try {
      setLoading(true);
      const [txRes, ordersRes] = await Promise.all([
        axios.get('/api/transactions'),
        axios.get('/api/orders', { params: { status: 'Completed' } })
      ]);
      setTx(txRes.data);
      setOrders(ordersRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function createTransactionForOrder(orderId: string, orderIdStr: string, amount: number) {
    try {
      await axios.post('/api/transactions', {
        transactionId: `TX-${Date.now()}`,
        orderId: orderId, // MongoDB _id
        amount: amount,
        paymentMethod: 'card',
        timestamp: new Date().toISOString()
      });
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create transaction');
    }
  }

  async function createDummyTransaction() {
    try {
      // Create a dummy order first
      const dummyAmount = Math.floor(Math.random() * 500) + 50; // $50-$550
      const orderRes = await axios.post('/api/orders', {
        orderId: `DUMMY-${Date.now()}`,
        items: [{ productId: 'dummy', name: 'Dummy Product', quantity: 1, price: dummyAmount }],
        totalAmount: dummyAmount
      });
      const orderId = orderRes.data._id;
      
      // Mark it as completed
      await axios.patch(`/api/orders/${orderId}`, { status: 'Completed' });
      
      // Create transaction
      const paymentMethods = ['card', 'paypal', 'bank_transfer', 'crypto'];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      await axios.post('/api/transactions', {
        transactionId: `TX-DUMMY-${Date.now()}`,
        orderId: orderId,
        amount: dummyAmount,
        paymentMethod: randomMethod,
        timestamp: new Date().toISOString()
      });
      
      show({ type: 'success', message: 'Dummy transaction created' });
      load();
    } catch (err: any) {
      show({ type: 'error', message: err?.response?.data?.error || 'Failed to create dummy transaction' });
    }
  }

  // Find completed orders without transactions
  const completedOrdersWithoutTx = useMemo(() => {
    const txOrderIds = new Set(tx.map(t => t.orderId));
    return orders.filter(o => !txOrderIds.has(o._id));
  }, [orders, tx]);

  const totalAmount = useMemo(() => tx.reduce((s,t)=>s+t.amount,0), [tx]);
  const byMethod = useMemo(() => tx.reduce((m,t)=>{ m[t.paymentMethod]=(m[t.paymentMethod]||0)+1; return m; }, {} as Record<string,number>), [tx]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Transactions</h1>
        {isAdmin && (
          <button
            onClick={createDummyTransaction}
            className="btn-primary bg-purple-600 hover:bg-purple-700"
          >
            <span className="mr-2">+</span> Create Dummy Transaction
          </button>
        )}
      </div>

      {completedOrdersWithoutTx.length > 0 && (
        <div className="card bg-yellow-500/10 border-yellow-500/30 p-4">
          <div className="font-semibold mb-3 text-yellow-400">Completed orders without transactions:</div>
          <div className="space-y-2">
            {completedOrdersWithoutTx.map(o => (
              <div key={o._id} className="flex items-center justify-between card p-3 bg-slate-800/50">
                <span className="text-slate-200">Order {o.orderId} - <span className="font-semibold">${o.totalAmount.toFixed(2)}</span></span>
                <button
                  onClick={() => createTransactionForOrder(o._id, o.orderId, o.totalAmount)}
                  className="btn-primary text-sm px-3 py-1.5"
                >
                  Create Transaction
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <div className="text-sm font-medium text-slate-400 mb-2">Total Amount</div>
          <div className="text-3xl font-bold text-blue-400">${totalAmount.toFixed(2)}</div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <div className="text-sm font-medium text-slate-400 mb-2">Transaction Count</div>
          <div className="text-3xl font-bold text-purple-400">{tx.length}</div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
          <div className="text-sm font-medium text-slate-400 mb-2">Payment Methods</div>
          <div className="flex gap-2 flex-wrap mt-2">
            {Object.entries(byMethod).map(([k,v]) => (
              <span key={k} className="px-3 py-1 rounded-full bg-slate-800/50 text-slate-200 text-xs font-medium border border-slate-700">
                {k}: {v}
              </span>
            ))}
            {Object.keys(byMethod).length === 0 && (
              <span className="text-slate-500 text-sm">No data</span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-400">Loading transactions...</p>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tx.map(t => (
                  <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">{t.transactionId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{t.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-400">${t.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30">
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-400">{new Date(t.timestamp).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tx.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                No transactions found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


