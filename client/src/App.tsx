import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext';

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex gap-8 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TPS</span>
              </div>
              <span className="font-bold text-xl text-slate-100">Transaction Processing</span>
            </div>
            <nav className="flex gap-1">
              <NavLink 
                to="/orders" 
                className={({isActive}) => 
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                Orders
              </NavLink>
              {user?.role === 'admin' && (
                <>
                  <NavLink 
                    to="/transactions" 
                    className={({isActive}) => 
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`
                    }
                  >
                    Transactions
                  </NavLink>
                  <NavLink 
                    to="/realtime" 
                    className={({isActive}) => 
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`
                    }
                  >
                    Real-Time
                  </NavLink>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-100">{user?.name}</div>
              <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
            </div>
            <button
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-sm font-medium transition-colors border border-slate-700"
              onClick={() => { logout(); navigate('/login'); }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}


