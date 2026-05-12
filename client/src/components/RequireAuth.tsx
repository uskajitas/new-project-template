import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppUser } from '../context/UserContext';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { user, isLoading: userLoading } = useAppUser();

  if (authLoading || userLoading) {
    return <div style={{ padding: 40, opacity: 0.6 }}>Loading…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Email allowlist: if the server refused the login (returned 403), `user`
  // will be null. Bounce to /login with a flag.
  if (!user) {
    return <Navigate to="/login?denied=1" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
