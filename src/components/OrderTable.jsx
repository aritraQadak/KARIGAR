import { sellerOrderImage } from '../data/sellerImages';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, ShieldCheck } from 'lucide-react';
import { useSeller } from '../context/SellerContext';
import { formatCurrency } from '../utils/formatters';

export default function OrderTable({ orders, showCustomer = false, limit, onViewOrder }) {
  const { t, i18n } = useTranslation();
  const { setSelectedOrder } = useSeller();

  const displayedOrders = limit ? orders.slice(0, limit) : orders;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {t('common.delivered')}
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {t('common.shipped')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {t('common.processing')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            {t('common.cancelled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {status}
          </span>
        );
    }
  };

  const handleView = (order) => {
    if (onViewOrder) {
      onViewOrder(order);
    } else {
      setSelectedOrder(order);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-[#0F172A]/70 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">{t('orders.orderId')}</th>
            <th className="py-3 px-4">{t('dashboard.product')}</th>
            {showCustomer && <th className="py-3 px-4">{t('orders.buyer')}</th>}
            <th className="py-3 px-4">{t('dashboard.amount')}</th>
            <th className="py-3 px-4">{t('dashboard.status')}</th>
            <th className="py-3 px-4">{t('dashboard.date')}</th>
            <th className="py-3 px-4 text-right">{t('dashboard.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
          {displayedOrders.map((order) => (
            <tr
              key={order.id}
              onClick={() => handleView(order)}
              className="hover:bg-gray-50/80 dark:hover:bg-[#243244] transition-colors duration-150 cursor-pointer group"
            >
              <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-[#F9FAFB] flex items-center gap-1.5">
                <span>{order.id}</span>
                {order.escrowStage === 'Payment Secured' && (
                  <span title={t('orderTable.escrowSecured')}>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  </span>
                )}
              </td>

              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  {order.productImage ? (
                    <img
                      src={sellerOrderImage(order)}
                      alt={order.product}
                      className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                      {order.product.slice(0, 2)}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-[#F9FAFB] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {order.product}
                  </span>
                </div>
              </td>

              {showCustomer && (
                <td className="py-3.5 px-4">
                  <div className="font-medium text-gray-900 dark:text-[#F9FAFB]">{order.customer}</div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[140px]">{order.customerLocation}</div>
                </td>
              )}

              <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-[#F9FAFB]">
                {formatCurrency(order.amount, i18n.language)}
              </td>

              <td className="py-3.5 px-4">
                {getStatusBadge(order.status)}
              </td>

              <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {order.date}
              </td>

              <td className="py-3.5 px-4 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(order);
                  }}
                  className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2.5 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('common.view')}</span>
                </button>
              </td>
            </tr>
          ))}

          {displayedOrders.length === 0 && (
            <tr>
              <td colSpan={showCustomer ? 7 : 6} className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                {t('orderTable.noOrdersFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
