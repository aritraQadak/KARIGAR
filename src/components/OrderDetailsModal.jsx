import { sellerOrderImage } from '../data/sellerImages';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  ShieldCheck,
  Truck,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import { useSeller } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function OrderDetailsModal() {
  const { t, i18n } = useTranslation();
  const { selectedOrder, setSelectedOrder, addToast, profile } = useSeller();
  const { user } = useAuth();

  if (!selectedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(selectedOrder.trackingNumber || 'IP-ART-882194');
    addToast(t('orderDetails.trackingCopied'), 'info');
  };

  const timelineSteps = selectedOrder.timeline || [
    { status: t('orderDetails.timelineStep1'), time: 'Aug 09, 10:30 AM', completed: true },
    { status: t('orderDetails.timelineStep2'), time: 'Aug 09, 02:15 PM', completed: true },
    { status: t('orderDetails.timelineStep3'), time: 'Aug 10, 11:00 AM', completed: true },
    { status: t('orderDetails.timelineStep4'), time: 'Aug 10, 04:30 PM', completed: true },
    { status: t('orderDetails.timelineStep5'), time: 'Aug 12, 01:20 PM', completed: selectedOrder.status === 'Delivered' }
  ];

  const getLocalizedStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return t('common.delivered');
      case 'shipped':
        return t('common.shipped');
      case 'processing':
        return t('common.processing');
      case 'cancelled':
        return t('common.cancelled');
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in-50 duration-150">
      <div className="bg-seller-card  rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between sticky top-0 bg-seller-card/95  backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 ">
                  {t('dashboard.orderId')} {selectedOrder.id}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {getLocalizedStatus(selectedOrder.status)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('orderDetails.placedOn')} {selectedOrder.date} • {t('orderDetails.securedByEscrow')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-seller-muted dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Escrow Security Highlight */}
          <div className="bg-seller-accent-soft/70  border border-seller-accent/80 border-seller-accent rounded-xl p-4 flex items-start gap-3.5">
            <div className="p-2 bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink rounded-lg flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-seller-accent-ink text-seller-accent-ink uppercase tracking-wider">
                  {t('orderDetails.escrowVaultTitle')}
                </h4>
                <span className="text-xs font-bold text-seller-accent-ink text-seller-accent-ink">
                  {t('orderDetails.stage')}: {selectedOrder.status === 'Delivered' ? t('orderDetails.fundsReleased') : t('orderDetails.fundsSecured')}
                </span>
              </div>
              <p className="text-xs text-seller-accent-ink/90 text-seller-accent-ink/90 mt-1 leading-relaxed">
                {selectedOrder.status === 'Delivered'
                  ? t('orderDetails.escrowDescDelivered')
                  : t('orderDetails.escrowDescPending')}
              </p>
            </div>
          </div>

          {/* Product and Price Grid */}
          <div className="bg-seller-muted  rounded-xl p-4 border border-gray-200/80 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('orderDetails.craftItemDetails')}
            </h4>
            <div className="flex items-center gap-4">
              {selectedOrder.productImage && (
                <img
                  src={sellerOrderImage(selectedOrder)}
                  alt={selectedOrder.product}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-xs"
                />
              )}
              <div className="flex-1">
                <h5 className="text-base font-bold text-gray-900 ">{selectedOrder.product}</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('orderDetails.artisanLabel')}: {selectedOrder.artisanName || profile?.fullName || user?.fullName || t('profile.roleArtisan', 'Artisan')} • {t('orderDetails.giTagVerified')}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {t('orderDetails.qty')}: <strong>{formatNumber(selectedOrder.itemsCount || 1, i18n.language)}</strong>
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {t('orderDetails.unit')}: <strong>{formatCurrency(selectedOrder.amount, i18n.language)}</strong>
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                    {t('orderDetails.zeroCommission')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('orderDetails.totalPayout')}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {formatCurrency(selectedOrder.amount, i18n.language)}
                </p>
              </div>
            </div>
          </div>

          {/* 2-column info: Customer & Shipping Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-seller-card ">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{t('orderDetails.shippingAddress')}</span>
              </div>
              <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.customer}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {selectedOrder.customerLocation}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {selectedOrder.customerPhone || '+91 98450 12345'}
              </p>
            </div>

            {/* Logistics & Tracking */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-seller-card ">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <span>{t('orderDetails.logisticsTracking')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {t('orderDetails.carrier')}: <strong>{selectedOrder.carrier || 'India Post Artisan Express'}</strong>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-center justify-between">
                <span>{t('orderDetails.awbTracking')}:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white bg-seller-muted dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px]">
                  {selectedOrder.trackingNumber || 'IP-ART-882194'}
                </span>
              </p>
              <button
                type="button"
                onClick={handleCopyTracking}
                className="mt-3 text-xs text-seller-accent-ink text-seller-accent-ink font-semibold hover:text-seller-accent-ink dark:hover:text-seller-accent-ink underline cursor-pointer"
              >
                {t('orderDetails.copyTracking')}
              </button>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-seller-card ">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{t('orderDetails.timelineTitle')}</span>
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-seller-card  flex items-center justify-center ${
                      step.completed
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-gray-300 dark:border-gray-600 text-gray-300'
                    }`}
                  >
                    {step.completed && <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-white" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${step.completed ? 'text-gray-900 ' : 'text-gray-400 dark:text-gray-500'}`}>
                      {step.status}
                    </p>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-seller-muted  border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-seller-card  hover:bg-seller-muted dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('orderDetails.printInvoice')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="px-5 py-2 bg-seller-accent hover:bg-seller-accent text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {t('orderDetails.closeDetails')}
          </button>
        </div>
      </div>
    </div>
  );
}
