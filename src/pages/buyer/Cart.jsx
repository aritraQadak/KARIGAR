import { categoryImage } from '../../data/demoImages';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useBuyer } from '../../context/BuyerContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import Button from '../../components/Button';

export default function Cart() {
  const { t, i18n } = useTranslation();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, artisanDirectTotal } = useBuyer();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="w-full bg-surface py-space-2xl px-space-md lg:px-space-4xl min-h-[70vh]">
      <div className="max-w-[1440px] mx-auto space-y-space-2xl">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-outline-variant/40 pb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-[0.14em] mb-1">
              <Link to="/patron" className="hover:text-secondary transition-colors">
                {t('buyer.cart.home', 'Home')}
              </Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">{t('buyer.cart.title', 'Sovereign Cart')}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {t('buyer.cart.heading', 'Your Masterwork Selection')}
            </h1>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-outline hover:text-secondary transition-colors self-start md:self-auto"
            >
              {t('buyer.cart.clearCart', 'Empty Cart')}
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-10 sm:p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-xs border border-stone-200/80 dark:border-stone-800">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <ShoppingBag className="w-10 h-10 stroke-1" />
            </div>
            <h2 className="font-garamond text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-bold">
              {t('buyer.cart.emptyTitle', 'Your Cart is Currently Empty')}
            </h2>
            <p className="font-body-md text-xs text-stone-600 dark:text-stone-400 max-w-md leading-relaxed">
              {t('buyer.cart.emptyDesc', 'Discover rare GI-certified handloom silks, fine pottery, and narrative tapestries crafted by India’s master artisans.')}
            </p>
            <Button
              to="/patron"
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              fullWidthOnMobile={false}
            >
              {t('buyer.cart.exploreCrafts', 'Explore Masterworks')}
            </Button>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items List (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => {
                const p = item.product;
                const itemTotal = p.price * item.quantity;
                const itemArtisanShare = (p.artisanShareAmount || p.price * 0.9) * item.quantity;

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all"
                  >
                    {/* Item Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-stone-100 dark:bg-stone-800 flex-shrink-0 overflow-hidden border border-stone-200/60 dark:border-stone-700 shadow-xs">
                      <img
                        src={categoryImage(p)}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      {p.giCertified && (
                        <span className="absolute top-1.5 left-1.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-label-sm text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          GI
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-label-sm text-[11px] uppercase tracking-wider text-[#C2410C] font-bold">
                        {p.craftCategory || p.craft} • {p.stateName || 'Master Guild'}
                      </div>
                      <Link
                        to={`/product/${p.id}`}
                        className="font-garamond text-xl text-stone-900 dark:text-stone-100 hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors block truncate font-bold"
                      >
                        {p.name}
                      </Link>
                      <div className="font-body-sm text-xs text-stone-600 dark:text-stone-400">
                        {t('buyer.cart.artisan', 'Master Artisan')}: <span className="text-stone-900 dark:text-stone-100 font-semibold">{p.artisanName}</span>
                      </div>

                      {/* Artisan Direct Payout Badge */}
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full text-[11px] font-label-sm text-[#14532D] dark:text-emerald-300 font-bold mt-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>
                          {t('buyer.cart.directPayout', 'Direct Artisan Payout')}: {formatCurrency(itemArtisanShare, i18n.language)} ({formatNumber(p.artisanSharePercent || 90, i18n.language)}%)
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-200/60 dark:border-stone-800">
                      <div className="font-garamond text-xl text-[#14532D] dark:text-emerald-400 font-bold">
                        {formatCurrency(itemTotal, i18n.language)}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 overflow-hidden shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(p.id, item.quantity - 1)}
                            className="p-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                            aria-label={t('buyer.cart.decreaseQty', 'Decrease quantity')}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-label-sm text-xs font-bold text-stone-900 dark:text-stone-100">
                            {formatNumber(item.quantity, i18n.language)}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(p.id, item.quantity + 1)}
                            className="p-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                            aria-label={t('buyer.cart.increaseQty', 'Increase quantity')}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(p.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                          title={t('buyer.cart.remove', 'Remove Item')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 flex items-center justify-between">
                <Link
                  to="/patron"
                  className="inline-flex items-center gap-1.5 font-label-sm text-xs uppercase tracking-wider text-[#14532D] dark:text-emerald-400 font-bold hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('buyer.cart.continueShopping', 'Continue Exploring Guilds')}</span>
                </Link>
              </div>
            </div>

            {/* Right Summary Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-xs border border-stone-200/80 dark:border-stone-800 space-y-5">
                <h3 className="font-garamond text-2xl text-stone-900 dark:text-stone-100 border-b border-stone-200/60 dark:border-stone-800 pb-3 font-bold">
                  {t('buyer.cart.summaryTitle', 'Sovereign Order Summary')}
                </h3>

                <div className="space-y-2.5 font-body-sm text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex justify-between">
                    <span>{t('buyer.cart.subtotal', 'Acquisition Subtotal')}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{formatCurrency(cartTotal, i18n.language)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('buyer.cart.logistics', 'Insured Climate Courier')}</span>
                    <span className="text-[#14532D] dark:text-emerald-400 font-bold">{t('buyer.cart.complimentary', 'COMPLIMENTARY')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('buyer.cart.escrowFee', 'Sovereign Vault Protection')}</span>
                    <span className="text-[#14532D] dark:text-emerald-400 font-bold">0% ({t('buyer.cart.included', 'INCLUDED')})</span>
                  </div>
                </div>

                <div className="h-[1px] bg-stone-200/60 dark:border-stone-800"></div>

                {/* Direct Payout Box */}
                <div className="bg-[#FCFAF6] dark:bg-stone-850 rounded-xl p-4 space-y-1 border border-stone-200/60 dark:border-stone-800">
                  <div className="flex justify-between items-center text-xs font-label-sm text-[#14532D] dark:text-emerald-400 font-bold uppercase tracking-wider">
                    <span>{t('buyer.cart.directArtisanFund', 'Guaranteed Direct Artisan Fund')}</span>
                  </div>
                  <div className="font-garamond text-2xl text-[#14532D] dark:text-emerald-400 font-bold">
                    {formatCurrency(artisanDirectTotal, i18n.language)}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    {t('buyer.cart.fundDesc', 'Disbursed straight to master artisan bank accounts upon delivery confirmation.')}
                  </p>
                </div>

                <div className="h-[1px] bg-stone-200/60 dark:border-stone-800"></div>

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <span className="font-title-md text-base text-stone-900 dark:text-stone-100 font-bold">{t('buyer.cart.total', 'Total Payable')}</span>
                  <span className="font-garamond text-3xl text-[#14532D] dark:text-emerald-400 font-bold">{formatCurrency(cartTotal, i18n.language)}</span>
                </div>

                {/* Checkout CTA */}
                <Button
                  type="button"
                  onClick={handleCheckout}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {t('buyer.cart.proceedCheckout', 'Proceed to Sovereign Checkout')}
                </Button>
              </div>

              {/* Security Badges */}
              <div className="bg-[#FCFAF6] dark:bg-stone-850 rounded-2xl p-5 space-y-2 border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-2 text-[#14532D] dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('buyer.cart.escrowGuarantee', '100% Escrow Protection')}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t('buyer.cart.escrowInfo', 'Funds remain in secure escrow until you inspect the parcel and confirm authenticity.')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
