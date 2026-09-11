import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Mic,
  TrendingUp,
  Package,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useSeller } from '../../context/SellerContext';
import StatCard from '../../components/StatCard';
import OrderTable from '../../components/OrderTable';
import TrustBadge from '../../components/TrustBadge';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { profile, orders, products } = useSeller();

  return (
    <div className="space-y-6">
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-seller-card  rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900  tracking-tight">
              {t('dashboard.welcomeTitle')} {profile.name}!
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {t('nav.verifiedBadge')}
            </span>
          </div>
          <p className="text-sm text-gray-500  mt-1">
            {t('dashboard.welcomeSubtitle')}
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/add-product"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-seller-accent hover:bg-seller-accent text-white text-xs font-semibold rounded-xl shadow-xs transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t('nav.addProduct')}</span>
          </Link>
          <Link
            to="/verification"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-seller-card  hover:bg-seller-muted dark:hover:bg-seller-card text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.verification')}</span>
          </Link>
        </div>
      </div>

      {/* Four Horizontal Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Total Products (Green) */}
        <StatCard
          type="products"
          value={formatNumber(products.length, i18n.language)}
          label={t('dashboard.totalProducts')}
          onClick={() => navigate('/seller/products')}
        />

        {/* CARD 2: Total Orders (Blue) */}
        <StatCard
          type="orders"
          value={formatNumber(orders.length, i18n.language)}
          label={t('dashboard.totalOrders')}
          onClick={() => navigate('/seller/orders')}
        />

        {/* CARD 3: Total Earnings (Light red/pink) */}
        <StatCard
          type="earnings"
          value={formatCurrency(profile.totalEarnings, i18n.language)}
          label={t('dashboard.totalEarnings')}
          growth={formatCurrency(7850, i18n.language)}
          onClick={() => navigate('/seller/earnings')}
        />

        {/* CARD 4: Seller Rating / Trust Score (Purple) */}
        <StatCard
          type="rating"
          value={profile.trustScore || '4.8'}
          label={t('dashboard.sellerRating')}
          subtext={t('nav.trustScore')}
          onClick={() => navigate('/seller/verification')}
        />
      </div>

      {/* Main Grid: Recent Orders (primary) + Artisan Trust & AI Assistant Side Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Section (Col span 2) */}
        <div className="lg:col-span-2 bg-seller-card  rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs overflow-hidden flex flex-col justify-between transition-colors">
          <div>
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 ">
                  {t('dashboard.recentOrders')}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  {t('dashboard.recentOrdersDesc')}
                </p>
              </div>

              <Link
                to="/orders"
                className="text-xs font-semibold text-seller-accent-ink text-seller-accent-ink hover:text-seller-accent-ink dark:hover:text-seller-accent-ink inline-flex items-center gap-1 group transition-colors"
              >
                <span>{t('common.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Table with Recent Orders */}
            <OrderTable orders={orders} limit={4} />
          </div>

          <div className="p-3 bg-seller-muted/70  border-t border-gray-100 dark:border-gray-700/80 px-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {t('dashboard.dispatchNotice')}
            </span>
            <Link to="/orders" className="text-gray-700 dark:text-gray-300 hover:underline font-medium">
              {t('common.viewAll')} ({orders.length})
            </Link>
          </div>
        </div>

        {/* Side Panel: Artisan Trust & AI Assistant */}
        <div className="space-y-4">
          {/* Artisan Trust Score Widget */}
          <div className="bg-seller-card  rounded-2xl p-5 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900  flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('verification.trustScoreTitle')}</span>
              </h3>
              <span className="text-xs font-bold text-seller-accent-ink text-seller-accent-ink bg-seller-accent-soft  px-2 py-0.5 rounded-full border border-seller-accent border-seller-accent">
                {t('dashboard.topTier')}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-black text-gray-900 ">4.8</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">/ 5.0 {t('dashboard.rating')}</span>
            </div>

            {/* Breakdown meters */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t('dashboard.meterIdentity')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                </div>
                <div className="w-full h-1.5 bg-seller-muted dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t('dashboard.meterAuthenticity')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                </div>
                <div className="w-full h-1.5 bg-seller-muted dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t('dashboard.meterOrders')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">95%</span>
                </div>
                <div className="w-full h-1.5 bg-seller-muted dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t('dashboard.meterFeedback')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">94%</span>
                </div>
                <div className="w-full h-1.5 bg-seller-muted dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t('dashboard.meterCluster')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">88%</span>
                </div>
                <div className="w-full h-1.5 bg-seller-muted dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            {/* Badges preview */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/80 flex flex-wrap gap-1.5">
              <TrustBadge type="verified_artisan" label={t('nav.verifiedBadge')} size="sm" />
              <TrustBadge type="gi_verified" label={t('dashboard.giTerracottaBadge')} size="sm" />
              <TrustBadge type="trusted_seller" label={t('dashboard.escrowBadge')} size="sm" />
            </div>

            <Link
              to="/verification"
              className="mt-3 block text-center text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-seller-accent/60 transition-colors"
            >
              {t('verification.pageTitle')} →
            </Link>
          </div>

          {/* Quick AI Voice Listing Prompt */}
          <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/60 dark:from-orange-950/30 dark:to-amber-950/20 rounded-2xl p-4 sm:p-5 border border-seller-accent/80 border-seller-accent/60 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900  uppercase tracking-wider">
                {t('addProduct.voiceAssistantTitle')}
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              {t('addProduct.voiceAssistantDesc')}
            </p>
            <Link
              to="/add-product"
              className="w-full inline-flex items-center justify-center gap-2 py-2 bg-seller-accent hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('addProduct.startSpeaking')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
