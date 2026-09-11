import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SellerSidebar from '../components/SellerSidebar';
import SellerHeader from '../components/SellerHeader';
import OrderDetailsModal from '../components/OrderDetailsModal';
import ToastContainer from '../components/ToastContainer';

export default function SellerLayout() {
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Pages that render their own complete 5-column Footer
  const hasFullFooter =
    location.pathname === '/about' ||
    location.pathname === '/seller/about' ||
    location.pathname === '/contact' ||
    location.pathname === '/seller/contact';

  return (
    <div className="seller-theme min-h-screen bg-seller-base flex text-gray-800  transition-colors">
      {/* Sidebar */}
      <SellerSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main wrapper offset by desktop sidebar width */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-60">
        {/* Top Header */}
        <SellerHeader
          onToggleMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Compact Footer for dashboard pages (hidden on pages with full 5-column footer) */}
        {!hasFullFooter && (
          <footer className="py-4 px-6 border-t border-gray-200/70 dark:border-gray-800 text-center text-xs text-gray-400 dark:text-gray-500 bg-seller-card  transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>{t('footer.compactDesc', 'Karigar Direct Artisan Marketplace © 2026. Empowering Indian Craftsmanship.')}</span>
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {t('footer.compactEscrow', 'Escrow Protected Direct Trade')}
                </span>
                <span>•</span>
                <span>{t('footer.compactSupport', 'Artisan Support: 1800-KARIGAR')}</span>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      <OrderDetailsModal />

      {/* Interactive Toasts */}
      <ToastContainer />
    </div>
  );
}
