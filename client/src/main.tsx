import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './state/AuthContext';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Transactions from './pages/Transactions';
import Realtime from './pages/Realtime';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<App />}> 
              <Route
                path="/"
                element={<Navigate to="/orders" replace />}
              />
              <Route
                path="/orders"
                element={<ProtectedRoute><Orders /></ProtectedRoute>}
              />
              <Route
                path="/transactions"
                element={<AdminRoute><Transactions /></AdminRoute>}
              />
              <Route
                path="/realtime"
                element={<AdminRoute><Realtime /></AdminRoute>}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);


