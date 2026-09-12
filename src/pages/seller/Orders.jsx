import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, CheckCircle2 } from 'lucide-react';
import { useSeller } from '../../context/SellerContext';
import { formatNumber } from '../../utils/formatters';
import OrderTable from '../../components/OrderTable';

export default function Orders() {
  const { t, i18n } = useTranslation();
  const { orders } = useSeller();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'All' || (order.status && order.status.toLowerCase() === activeTab.toLowerCase());
    const customerName = typeof order.customer === 'string' ? order.customer : (order.customer?.name || '');
    const productName = typeof order.product === 'string' ? order.product : (order.product?.name || '');
    const orderId = order.id || '';

    const matchesSearch =
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return orders.length;
    return orders.filter((o) => o.status && o.status.toLowerCase() === status.toLowerCase()).length;
  };

  const tabs = [
    { label: t('common.all'), value: 'All' },
    { label: t('common.processing'), value: 'Processing' },
    { label: t('common.shipped'), value: 'Shipped' },
    { label: t('common.delivered'), value: 'Delivered' },
    { label: t('common.cancelled'), value: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-seller-card  p-5 sm:p-6 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900  tracking-tight">
            {t('orders.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500  mt-1">
            {t('orders.pageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('orders.escrowSecured')}</span>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-seller-card  p-4 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-seller-muted  p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.value
                    ? 'bg-seller-card  text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.value
                      ? 'bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {formatNumber(getStatusCount(tab.value), i18n.language)}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('orders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800  placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-seller-card dark:focus:bg-seller-base"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-seller-card  rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs overflow-hidden transition-colors">
        <OrderTable orders={filteredOrders} showCustomer={true} />
      </div>
    </div>
  );
}
