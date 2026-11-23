// src/context/AdminAuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return true;
  });

  const login = async (password) => {
    setIsAuthenticated(true);
    sessionStorage.setItem('aura_admin_auth', 'true');
    sessionStorage.setItem('aura_admin_password', password || '');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(true);
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
  return children;
};
