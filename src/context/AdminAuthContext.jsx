// src/context/AdminAuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminAuthContext = createContext();

const ADMIN_STORAGE_KEY = 'luxury_store_admin_auth';
const ADMIN_PASSWORD = 'admin123';

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    }
    return { success: false, error: 'Incorrect administrator password.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Protected route wrapper
export const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};
