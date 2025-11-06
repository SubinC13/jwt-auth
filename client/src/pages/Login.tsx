import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Admin');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'admin' | 'customer'>('admin');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-2xl">TPS</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Welcome Back</h1>
          <p className="text-slate-400">Transaction Processing System</p>
        </div>
        <form onSubmit={submit} className="card p-8 space-y-5">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input 
                  value={name} 
                  onChange={(e)=>setName(e.target.value)} 
                  placeholder="Full Name" 
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select 
                  value={role} 
                  onChange={(e)=>setRole(e.target.value as any)} 
                  className="input"
                >
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              type="email"
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              placeholder="you@example.com" 
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="input"
              required
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button type="submit" className="w-full btn-primary py-3 text-base font-semibold">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <button 
            type="button" 
            className="w-full btn-secondary py-3" 
            onClick={()=>setMode(mode==='login'?'register':'login')}
          >
            {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}


