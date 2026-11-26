// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Customer Facing Store Pages
import { Home } from './pages/store/Home';
import { ProductPage } from './pages/store/ProductPage';
import { Cart } from './pages/store/Cart';
import { Checkout } from './pages/store/Checkout';
import { Contact } from './pages/store/Contact';
import { PrivacyPolicy } from './pages/store/PrivacyPolicy';
import { CollectionPage } from './pages/store/CollectionPage';
import { MaintenancePage } from './pages/store/MaintenancePage';

// Admin Portal Pages & Protection
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCollections } from './pages/admin/AdminCollections';
import { AdminShipping } from './pages/admin/AdminShipping';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminSecurity } from './pages/admin/AdminSecurity';
import { AdminInquiries } from './pages/admin/AdminInquiries';
import { AdminRoute } from './context/AdminAuthContext';
import { fetchStoreSettings } from './services/api';

// Maintenance Guard — wraps all store routes
const MaintenanceGuard = ({ children }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('aura_maintenance_unlocked') === 'true'
  );
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetchStoreSettings()
      .then((s) => {
        setMaintenanceMode(Boolean(s.maintenanceMode));
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  if (!checked) return null; // Wait for settings load

  if (maintenanceMode && !unlocked) {
    return (
      <MaintenancePage
        onUnlock={() => setUnlocked(true)}
      />
    );
  }

  return children;
};

export const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#faf8f5]">
      {/* Hide customer Navbar and Footer in Admin Panel */}
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Customer Facing Routes — all wrapped in MaintenanceGuard */}
          <Route path="/" element={<MaintenanceGuard><Home /></MaintenanceGuard>} />
          <Route path="/product/:id" element={<MaintenanceGuard><ProductPage /></MaintenanceGuard>} />
          <Route path="/cart" element={<MaintenanceGuard><Cart /></MaintenanceGuard>} />
          <Route path="/checkout" element={<MaintenanceGuard><Checkout /></MaintenanceGuard>} />
          <Route path="/contact" element={<MaintenanceGuard><Contact /></MaintenanceGuard>} />
          <Route path="/privacy-policy" element={<MaintenanceGuard><PrivacyPolicy /></MaintenanceGuard>} />
          <Route path="/collection/:slug" element={<MaintenanceGuard><CollectionPage /></MaintenanceGuard>} />

          {/* Admin routes are NOT behind MaintenanceGuard */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/collections"
            element={
              <AdminRoute>
                <AdminCollections />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/shipping"
            element={
              <AdminRoute>
                <AdminShipping />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminRoute>
                <AdminCoupons />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/security"
            element={
              <AdminRoute>
                <AdminSecurity />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <AdminRoute>
                <AdminInquiries />
              </AdminRoute>
            }
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<MaintenanceGuard><Home /></MaintenanceGuard>} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
