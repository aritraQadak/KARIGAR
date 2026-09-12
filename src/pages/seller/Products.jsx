import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter } from 'lucide-react';
import { useSeller } from '../../context/SellerContext';
import { CRAFT_CATEGORIES,normalizeCraftCategory } from '../../constants/craftCategories.js';
import { formatNumber } from '../../utils/formatters';
import { translateCategory } from '../../utils/localizedDisplay';
import ProductTable from '../../components/ProductTable';

export default function Products() {
  const { t, i18n } = useTranslation();
  const {products,productsLoading:loading,productsError:loadError}=useSeller();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const catTrans = translateCategory(p.category, i18n.language).toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) ||
      catTrans.includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'All' || normalizeCraftCategory(p.category) === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryOptions = [
    { value: 'All', label: t('common.all') },
    ...CRAFT_CATEGORIES.map(value => ({ value, label: translateCategory(value, i18n.language) }))
  ];

  const statusOptions = [
    { value: 'All', label: t('common.all') },
    { value: 'Active', label: t('common.active') },
    { value: 'Out of Stock', label: t('common.outOfStock') },
    { value: 'Draft', label: t('common.draft') }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-seller-card  p-5 sm:p-6 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900  tracking-tight">
            {t('nav.myProducts')} ({formatNumber(products.length, i18n.language)})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500  mt-1">
            {t('products.pageSubtitle')}
          </p>
        </div>

        <Link
          to="/seller/add-product"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-seller-accent hover:bg-seller-accent text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('nav.addProduct')}</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-seller-card  p-4 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800  placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-seller-card dark:focus:bg-seller-base"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>{t('common.category')}:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-800  focus:outline-none"
            >
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
            <span>{t('common.status')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-800  focus:outline-none"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading&&<p role="status">Loading your products...</p>}
      {loadError&&<p role="alert">{loadError}</p>}
      {/* Product Table Container */}
      <div className="bg-seller-card  rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs overflow-hidden transition-colors">
        <ProductTable
          products={filteredProducts}
        />
      </div>
    </div>
  );
}
