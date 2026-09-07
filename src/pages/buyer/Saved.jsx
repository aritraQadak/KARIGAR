import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useBuyer } from '../../context/BuyerContext';
import { PRODUCTS } from '../../data/products';
import { formatCurrency } from '../../utils/formatters';

export default function Saved() {
  const { t, i18n } = useTranslation();
  const { savedItemIds, toggleSaveItem, addToCart } = useBuyer();

  const savedProducts = PRODUCTS.filter(p => savedItemIds.includes(p.id));

  return (
    <div className="w-full bg-surface py-space-2xl px-space-md lg:px-space-4xl min-h-[80vh]">
      <div className="max-w-[1440px] mx-auto space-y-space-2xl">
        <div className="border-b border-outline-variant/40 pb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-[0.14em] mb-1">
              <Link to="/patron" className="hover:text-secondary transition-colors">
                {t('buyer.saved.home', 'Home')}
              </Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">{t('buyer.saved.title', 'Saved Crafts & Artisans')}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {t('buyer.saved.heading', 'Your Bookmarked Heritage Collection')}
            </h1>
          </div>
        </div>

        {savedProducts.length === 0 ? (
          <div className="bg-surface-container-lowest p-space-4xl text-center flex flex-col items-center justify-center space-y-space-md shadow-sm border border-outline-variant/30">
            <Bookmark className="w-12 h-12 text-outline stroke-1" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {t('buyer.saved.emptyTitle', 'No Saved Masterworks Yet')}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              {t('buyer.saved.emptyDesc', 'Bookmark your favorite handcrafted silk sarees, wood carvings, and authentic pottery while exploring.')}
            </p>
            <Link
              to="/explore/west-bengal"
              className="inline-flex items-center gap-space-xs px-space-2xl py-space-md bg-secondary text-on-secondary font-label-md text-label-md uppercase tracking-[0.18em]"
            >
              <span>{t('buyer.saved.exploreGuilds', 'Explore Guilds')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-xl">
            {savedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-surface-container-lowest shadow-md border border-outline-variant/30 flex flex-col group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
                  <img
                    src={p.images?.[0] || p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSaveItem(p.id)}
                    className="absolute top-3 right-3 bg-surface/80 p-2 text-secondary hover:bg-surface shadow-sm"
                    title={t('buyer.saved.removeBookmark', 'Remove Bookmark')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-space-md flex-1 flex flex-col justify-between space-y-space-md">
                  <div>
                    <div className="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-1">
                      {p.craftCategory} • {p.stateName}
                    </div>
                    <Link
                      to={`/product/${p.id}`}
                      className="font-title-lg text-title-lg text-on-surface hover:text-secondary transition-colors block font-semibold"
                    >
                      {p.name}
                    </Link>
                    <div className="text-body-sm text-on-surface-variant mt-1">
                      {t('buyer.saved.byArtisan', 'By')} {p.artisanName}
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-space-sm space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {formatCurrency(p.price, i18n.language)}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary font-bold">
                        {t('buyer.saved.artisanShare', 'Artisan')}: {formatCurrency(p.artisanShareAmount || p.price * 0.9, i18n.language)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(p, 1)}
                    className="w-full py-space-sm bg-on-surface text-surface hover:bg-secondary hover:text-on-secondary font-label-sm text-label-sm uppercase tracking-[0.16em] font-semibold transition-colors flex items-center justify-center gap-space-xs shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('buyer.saved.addToCart', 'Acquire Masterwork')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
