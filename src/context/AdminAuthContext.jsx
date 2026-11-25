// src/context/AdminAuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAdminSecurityStatus } from '../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('aura_admin_auth') === 'true';
  });
  const [authRequired, setAuthRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const res = await getAdminSecurityStatus();
      const required = Boolean(res.passwordRequired || res.authRequired);
      setAuthRequired(required);
      if (!required) {
        setIsAuthenticated(true);
      } else {
        const storedAuth = sessionStorage.getItem('aura_admin_auth') === 'true';
        setIsAuthenticated(storedAuth);
      }
    } catch {
      // In case of offline/fetch issue, rely on session
      const storedAuth = sessionStorage.getItem('aura_admin_auth') === 'true';
      setIsAuthenticated(storedAuth);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (password) => {
    setIsAuthenticated(true);
    sessionStorage.setItem('aura_admin_auth', 'true');
    sessionStorage.setItem('aura_admin_password', password || '');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aura_admin_auth');
    sessionStorage.removeItem('aura_admin_password');
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, authRequired, loading, login, logout, checkAuthStatus }}
    >
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
  const { isAuthenticated, authRequired, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Verifying administrative authorization...</span>
        </div>
      </div>
    );
  }

  // If password protection is active and user is not authenticated, redirect to login
  if (authRequired && !isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};
