// src/context/AdminAuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyAdminPassword } from '../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('aura_admin_auth') === 'true';
  });

  const login = async (password) => {
    try {
      await verifyAdminPassword(password);
      setIsAuthenticated(true);
      sessionStorage.setItem('aura_admin_auth', 'true');
      sessionStorage.setItem('aura_admin_password', password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Incorrect password. Please try again.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aura_admin_auth');
    sessionStorage.removeItem('aura_admin_password');
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
