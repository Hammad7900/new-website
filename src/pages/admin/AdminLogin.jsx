// src/pages/admin/AdminLogin.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin', { replace: true });
  }, []);

  return null;
};

export default AdminLogin;
