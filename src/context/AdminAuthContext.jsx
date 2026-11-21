// src/context/AdminAuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ADMIN_PASSWORD } from '../config/constants';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('aura_admin_auth') === 'true';
  });

  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('aura_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, error: 'Incorrect password. Please try again.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aura_admin_auth');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};
