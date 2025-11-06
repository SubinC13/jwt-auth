import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import React from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/orders" replace />;
  return <>{children}</>;
}


