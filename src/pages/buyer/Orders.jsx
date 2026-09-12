import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Truck, ShieldCheck, Award, ArrowRight, ExternalLink } from 'lucide-react';
import { formatCurrency, formatNumber, toLocaleDigits } from '../../utils/formatters';
import { translateCraftType, translateState, translatePersonName, translateCollectionTitle } from '../../utils/localizedDisplay';

export default function Orders() {
  const { t, i18n } = useTranslation();

  const mockOrders = [
    {
      id: 'KGR-849201',
      date: '12 Oct 2024',
      status: 'In Transit',
      statusColor: 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300',
      artisanName: 'Smt. Ananya Devi',
      productName: 'Radha-Krishna Narrative Nakshi Kantha Tapestry',
      craft: 'Nakshi Kantha',
      state: 'West Bengal',
      price: 48000,
      artisanPayout: 43200,
      giTag: '#WB-082',
      image: '/images/demo/embroidery.jpg'
    },
    {
      id: 'KGR-710293',
      date: '28 Aug 2024',
      status: 'Delivered & Escrow Released',
      statusColor: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300',
      artisanName: 'Ustad Ramdas Ansari',
      productName: 'Imperial Gold Zari Chanderi Dupatta',
      craft: 'Banarasi / Chanderi',
      state: 'Madhya Pradesh',
      price: 34500,
      artisanPayout: 31050,
      giTag: '#MP-104',
      image: '/images/demo/handloom-textiles.jpg'
    }
  ];

  return (
    <div className="w-full bg-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-stone-200 dark:border-stone-800 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-500 font-label-sm text-xs uppercase tracking-wider mb-1.5">
              <Link to="/patron" className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors">
                {t('buyer.orders.home', 'Home')}
              </Link>
              <span>/</span>
              <span className="text-stone-900 dark:text-stone-100 font-semibold">{t('buyer.orders.title', 'My Collection & Orders')}</span>
            </div>
            <h1 className="font-garamond text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-bold">
              {t('buyer.orders.heading', 'Patron Consignments & Escrow Ledger')}
            </h1>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {mockOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 dark:border-stone-800 space-y-5 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/60 dark:border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="font-title-md text-base font-bold text-stone-900 dark:text-stone-100">
                    {t('buyer.orders.orderNo', 'Ledger No')}: {toLocaleDigits(order.id, i18n.language)}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-body-sm">({toLocaleDigits(order.date, i18n.language)})</span>
                </div>
                <span className={`px-3.5 py-1 rounded-full font-label-sm text-xs uppercase tracking-wider font-bold shadow-xs ${order.statusColor}`}>
                  {order.status === 'In Transit' ? t('orderTable.inTransit', 'In Transit') : order.status === 'Delivered & Escrow Released' ? t('orderTable.delivered', 'Delivered') : order.status}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={order.image}
                    alt={order.productName}
                    className="w-20 h-20 rounded-xl object-cover bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 shadow-xs flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#C2410C] font-bold">
                      {translateCraftType(order.craft, i18n.language)} • {translateState(order.state, i18n.language)}
                    </span>
                    <h3 className="font-garamond text-xl text-stone-900 dark:text-stone-100 font-bold">
                      {translateCollectionTitle(order.productName, i18n.language)}
                    </h3>
                    <div className="text-body-sm text-xs text-stone-600 dark:text-stone-400">
                      {t('buyer.orders.artisan', 'Master Artisan')}: <span className="font-semibold text-stone-900 dark:text-stone-100">{translatePersonName(order.artisanName, i18n.language)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 space-y-1 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-200/60 dark:border-stone-800">
                  <div className="font-garamond text-2xl text-[#14532D] dark:text-emerald-400 font-bold">
                    {formatCurrency(order.price, i18n.language)}
                  </div>
                  <div className="font-label-sm text-xs text-[#C2410C] font-bold">
                    {t('buyer.orders.artisanPayout', 'Artisan Direct Payout')}: {formatCurrency(order.artisanPayout, i18n.language)} ({formatNumber(90, i18n.language)}%)
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-label-sm">
                    <Award className="w-3.5 h-3.5 text-[#14532D] dark:text-emerald-400" />
                    <span>{t('buyer.orders.giMark', 'GI Certificate')}: {toLocaleDigits(order.giTag, i18n.language)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FCFAF6] dark:bg-stone-850 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 border border-stone-200/60 dark:border-stone-800">
                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 font-body-sm">
                  <ShieldCheck className="w-4 h-4 text-[#14532D] dark:text-emerald-400 shrink-0" />
                  <span>{t('buyer.orders.escrowNote', 'Escrow Vault release locked until physical receipt & QR scan.')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/buyer/certificates"
                    className="inline-flex items-center gap-1 font-label-sm text-xs uppercase tracking-wider text-[#14532D] dark:text-emerald-400 font-bold hover:underline"
                  >
                    <span>{t('buyer.orders.viewCertificate', 'View Provenance Ledger')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
