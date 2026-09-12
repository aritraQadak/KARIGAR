import { formatEvidenceScore } from '../utils/evidenceFormat.js';
import { categoryImage } from '../data/demoImages';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit3, Trash2, Award, CheckCircle2 } from 'lucide-react';
import { useSeller } from '../context/SellerContext';
import { formatCurrency, formatNumber, toLocaleDigits } from '../utils/formatters';
import { translateCategory, translateCraftType, translateState, translateCollectionTitle } from '../utils/localizedDisplay';

export default function ProductTable({ products, onViewProduct, onEditProduct }) {
  const { t, i18n } = useTranslation();
  const { deleteProduct } = useSeller();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            {t('common.active')}
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-seller-muted dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {t('common.draft')}
          </span>
        );
      case 'under review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink border border-seller-accent border-seller-accent">
            {t('verification.underReview')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            {t('common.cancelled')}
          </span>
        );
      case 'out of stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            {t('common.outOfStock')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-seller-muted dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {status}
          </span>
        );
    }
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-seller-muted/70  text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">{t('productTable.productHeader')}</th>
            <th className="py-3 px-4">{t('productTable.categoryHeader')}</th>
            <th className="py-3 px-4">{t('productTable.priceHeader')}</th>
            <th className="py-3 px-4">{t('productTable.stockHeader')}</th>
            <th className="py-3 px-4">{t('productTable.statusHeader')}</th>
            <th className="py-3 px-4">{t('dashboard.meterFeedback')}</th>
            <th className="py-3 px-4">{t('nav.orders')}</th>
            <th className="py-3 px-4 text-right">{t('productTable.actionsHeader')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
          {products.map((item) => (
            <tr key={item.id} className="hover:bg-seller-muted/80 dark:hover:bg-seller-card transition-colors duration-150">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={item.persisted?item.image:categoryImage(item)}
                      alt={item.name}
                      className="w-11 h-11 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-xs flex-shrink-0"
                    />
                    {item.authenticityScore && (
                      <span
                        title={`${t('dashboard.meterAuthenticity')}: ${item.authenticityScore}%`}
                        className="absolute -bottom-1 -right-1 bg-seller-card  rounded-full p-0.5 shadow-xs border border-emerald-200 dark:border-emerald-700"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900  leading-tight">{translateCollectionTitle(item.name, i18n.language)}</p>
                    {item.persisted&&<p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1">{t('verification.evidenceScore')}: {formatEvidenceScore(item.evidence.score)} / {formatNumber(100, i18n.language)}</p>}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.giTag && (
                        <span className="text-[10px] bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink border border-seller-accent border-seller-accent px-1.5 py-0.2 rounded font-medium inline-flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" /> {item.persisted ? t('addProduct.certificationSupplied', 'Certification supplied') : t('nav.giAuthorized')}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {item.origin ? translateState(item.origin, i18n.language) : (item.persisted ? t('profile.notProvided', 'Region not provided') : translateState('West Bengal', i18n.language))}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                <span className="inline-block bg-seller-muted  px-2 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300 border border-transparent dark:border-gray-700">
                  {translateCategory(item.category, i18n.language) || translateCraftType(item.craftType, i18n.language) || item.category}
                </span>
              </td>

              <td className="py-3.5 px-4 font-bold text-gray-900 ">
                {formatCurrency(item.price, i18n.language)}
              </td>

              <td className="py-3.5 px-4">
                <span className={`text-xs font-semibold ${item.stock < 5 ? 'text-seller-accent-ink text-seller-accent-ink font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                  {formatNumber(item.stock, i18n.language)} {t('common.inStock')}
                </span>
              </td>

              <td className="py-3.5 px-4">
                {getStatusBadge(item.status)}
              </td>

              <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium">
                {formatNumber(item.views || 0, i18n.language)}
              </td>

              <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 text-xs font-medium">
                {formatNumber(item.orders || 0, i18n.language)}
              </td>

              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    disabled={!onViewProduct}
                    onClick={() => onViewProduct && onViewProduct(item)}
                    title={t('common.view')}
                    className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-seller-muted dark:hover:bg-seller-card rounded-md transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={item.persisted||!onEditProduct}
                    onClick={() => onEditProduct && onEditProduct(item)}
                    title={t('common.edit')}
                    className="p-1.5 text-gray-500 hover:text-emerald-700 dark:text-gray-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-[11px] bg-red-600 text-white px-2 py-1 rounded font-semibold hover:bg-red-700"
                      >
                        {t('common.confirmed')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={item.persisted}
                      onClick={() => setDeleteConfirmId(item.id)}
                      title={t('common.delete')}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                {t('productTable.noProductsFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
