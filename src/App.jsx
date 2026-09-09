import RouteScroll from './components/RouteScroll';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SellerProvider } from './context/SellerContext';
import { BuyerProvider } from './context/BuyerContext';
import SellerLayout from './layouts/SellerLayout';
import BuyerLayout from './layouts/BuyerLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';

// Seller Pages
import Dashboard from './pages/seller/Dashboard';
import AddProduct from './pages/seller/AddProduct';
import Products from './pages/seller/Products';
import Orders from './pages/seller/Orders';
import Earnings from './pages/seller/Earnings';
import Customers from './pages/seller/Customers';
import Verification from './pages/seller/Verification';
import Messages from './pages/seller/Messages';
import Settings from './pages/seller/Settings';
import Profile from './pages/seller/Profile';

// Buyer Pages
import Home from './pages/buyer/Home';
import Browse from './pages/buyer/Browse';
import StateExplore from './pages/buyer/StateExplore';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import BuyerOrders from './pages/buyer/Orders';
import Certificates from './pages/buyer/Certificates';
import Saved from './pages/buyer/Saved';
import Wallet from './pages/buyer/Wallet';
import BuyerProfile from './pages/buyer/Profile';
import BuyerSettings from './pages/buyer/Settings';

// Shared Pages
import About from './pages/About';
import Contact from './pages/Contact';

/**
 * Smart Route for "/profile":
 * - Shows loading state during auth check
 * - Directs ARTISAN to /seller/profile
 * - Directs PATRON to /buyer/profile
 * - Redirects unauthenticated users to /login
 */
function RoleProfileRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#111827]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent dark:border-emerald-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('common.loading', 'Loading Karigar...')}
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ARTISAN') {
    return <Navigate to="/seller/profile" replace />;
  }

  return <Navigate to="/buyer/profile" replace />;
}

/**
 * Smart Fallback Route:
 * - Redirects authenticated ARTISAN to /seller/dashboard
 * - Redirects authenticated PATRON to /patron
 * - Redirects unauthenticated guests to /login
 */
function FallbackRoute() {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user?.role === 'ARTISAN') {
    return <Navigate to="/seller/dashboard" replace />;
  }
  if (isAuthenticated && user?.role === 'PATRON') {
    return <Navigate to="/patron" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BuyerProvider>
          <SellerProvider>
            <BrowserRouter>
              <RouteScroll />
              <Routes>
                {/* Root URL strictly displays Login page */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Public Authentication Route */}
                <Route path="/login" element={<Login />} />
                <Route path="/auth" element={<Navigate to="/login" replace />} />

                {/* Smart Unified Profile Route */}
                <Route path="/profile" element={<RoleProfileRoute />} />

                {/* Buyer / Patron Application Routes - Strictly Protected for PATRON role */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['PATRON']}>
                      <BuyerLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Existing Patron Home Interface */}
                  <Route path="/patron" element={<Home />} />
                  <Route path="/collections" element={<Browse key="collections" />} />
                  <Route path="/artisans" element={<Browse key="artisans" makers />} />
                  <Route path="/patron/dashboard" element={<Home />} />
                  <Route path="/user" element={<Home />} />
                  <Route path="/marketplace" element={<Home />} />

                  {/* Patron Marketplace Exploration & Info */}
                  <Route path="/explore/:stateSlug" element={<StateExplore />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Strictly Protected Patron Cart & Checkout */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />

                  {/* Strictly Protected Patron Profile & Management */}
                  <Route path="/buyer/orders" element={<BuyerOrders />} />
                  <Route path="/buyer/certificates" element={<Certificates />} />
                  <Route path="/buyer/saved" element={<Saved />} />
                  <Route path="/buyer/wallet" element={<Wallet />} />
                  <Route path="/buyer/settings" element={<BuyerSettings />} />
                  <Route path="/buyer/profile" element={<BuyerProfile />} />
                  <Route path="/patron/profile" element={<BuyerProfile />} />
                  <Route path="/user/profile" element={<BuyerProfile />} />
                </Route>

                {/* Protected Seller Application Routes (requires ARTISAN role) */}
                <Route
                  path="/seller"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <SellerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="add-product" element={<AddProduct />} />
                  <Route path="products" element={<Products />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="earnings" element={<Earnings />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="verification" element={<Verification />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                {/* Legacy seller direct route aliases for backwards compatibility */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/dashboard" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/products" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-product"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/add-product" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/orders" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/earnings"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/earnings" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/customers" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/verification"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/verification" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/messages" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredRole="ARTISAN">
                      <Navigate to="/seller/settings" replace />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<FallbackRoute />} />
              </Routes>
            </BrowserRouter>
          </SellerProvider>
        </BuyerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

