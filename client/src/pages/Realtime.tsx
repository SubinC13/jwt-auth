import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from '../utils/axios';

type LiveTx = {
  transactionId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
};

export default function Realtime() {
  const [events, setEvents] = useState<LiveTx[]>([]);
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const socket: Socket = io('http://localhost:5001', { transports: ['websocket'] });
    
    socket.on('connect', () => {
      setConnected(true);
    });
    
    socket.on('disconnect', () => {
      setConnected(false);
    });
    
    function onNewTx(payload: LiveTx) {
      setEvents((prev) => [payload, ...prev].slice(0, 50));
    }
    socket.on('transaction:new', onNewTx);
    return () => { 
      socket.off('transaction:new', onNewTx); 
      socket.disconnect(); 
    };
  }, []);

  async function createTestTransaction() {
    try {
      setTesting(true);
      // Create a dummy order first
      const dummyAmount = Math.floor(Math.random() * 500) + 50;
      const orderRes = await axios.post('/api/orders', {
        orderId: `TEST-${Date.now()}`,
        items: [{ productId: 'test', name: 'Test Product', quantity: 1, price: dummyAmount }],
        totalAmount: dummyAmount
      });
      const orderId = orderRes.data._id;
      
      // Mark as completed
      await axios.patch(`/api/orders/${orderId}`, { status: 'Completed' });
      
      // Create transaction (this will trigger Socket.IO event)
      const paymentMethods = ['card', 'paypal', 'bank_transfer', 'crypto'];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      await axios.post('/api/transactions', {
        transactionId: `TX-TEST-${Date.now()}`,
        orderId: orderId,
        amount: dummyAmount,
        paymentMethod: randomMethod,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Failed to create test transaction:', err);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Real-Time Monitor</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-slate-400">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <button
            onClick={createTestTransaction}
            disabled={testing || !connected}
            className="btn-primary bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Creating...' : '⚡ Test Transaction'}
          </button>
        </div>
      </div>

      {!events.length ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-slate-400 mb-2">Waiting for live transactions...</p>
          <p className="text-sm text-slate-500">New transactions will appear here in real-time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e, idx) => (
            <div 
              key={idx} 
              className="card p-4 hover:bg-slate-800/50 transition-all animate-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-semibold text-slate-100">{e.transactionId}</div>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30">
                      {e.paymentMethod}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">Order: {e.orderId}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400 mb-1">${e.amount.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


