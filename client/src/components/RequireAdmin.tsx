import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppUser } from '../context/UserContext';

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAppUser();
  if (isLoading) return <div style={{ padding: 40, opacity: 0.6 }}>Loading…</div>;
  if (!isAdmin)  return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default RequireAdmin;
