import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BadgeCheck,
  ZoomIn,
  Leaf,
  Hand,
  Droplet,
  Image as ImageIcon,
  Star,
  StarHalf,
  ArrowRight,
  PackageCheck,
  Truck,
  ShoppingBag,
  Award,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Play,
  X,
  FileCheck
} from 'lucide-react';
import { getProductById, PRODUCTS } from '../../data/products';
import { useBuyer } from '../../context/BuyerContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function ProductDetail() {
  const { productId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useBuyer();

  const product = getProductById(productId) || PRODUCTS[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('story');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const handleAcquire = () => {
    addToCart(product, 1);
    navigate('/cart');
  };

  return (
    <div className="flex flex-col w-full bg-surface text-on-surface">
      {/* BREADCRUMB STRIP */}
      <section className="w-full bg-surface-container-low px-space-md sm:px-space-xl py-space-sm border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <nav className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
            <Link className="hover:text-secondary transition-colors" to="/patron">{t('buyer.product.homeNav', 'Home')}</Link>
            <span className="text-outline-variant">/</span>
            <Link className="hover:text-secondary transition-colors" to={`/explore/${product.stateSlug}`}>
              {product.stateName}
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-outline">{product.craftLineage}</span>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-semibold">{product.id.toUpperCase()}</span>
          </nav>

          <div className="hidden md:flex items-center gap-space-xs font-label-sm text-[11px] text-outline uppercase tracking-[0.16em]">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>Registered Archival Specimen • One-of-a-Kind Heirloom</span>
          </div>
        </div>
      </section>

      {/* TOP PRODUCT SECTION: TWO-COLUMN EDITORIAL GRID */}
      <section className="w-full bg-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: CRAFT GALLERY & VISUAL INSPECTION */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Large Hero Frame */}
            <div className="relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-xs aspect-[5/4] flex items-center justify-center group cursor-crosshair border border-stone-200/80 dark:border-stone-800">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Discreet Embossed GI Seal Mark */}
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs border border-stone-200/60 dark:border-stone-700">
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/70 flex items-center justify-center text-[#14532D] dark:text-emerald-400">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col pr-1">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#14532D] dark:text-emerald-400 font-bold">
                    {product.giTagStatus}
                  </span>
                  <span className="font-label-sm text-[9px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {product.giTagNumber}
                  </span>
                </div>
              </div>

              {/* Zoom Loupe Interactive Hint */}
              <div className="absolute bottom-4 right-4 bg-stone-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none shadow-xs">
                <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-label-sm text-[11px] uppercase tracking-wider font-medium">
                  {t('buyer.product.magnifyHint', '180 Stitches/Inch Density • Magnify')}
                </span>
              </div>
            </div>

            {/* Thumbnail Reel (5 Curated Angles) */}
            <div className="grid grid-cols-5 gap-3">
              {product.images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`thumb-btn relative aspect-square rounded-xl overflow-hidden transition-all border cursor-pointer ${
                    selectedImageIndex === idx ? 'ring-2 ring-[#14532D] dark:ring-emerald-400 border-transparent opacity-100 shadow-xs' : 'opacity-70 hover:opacity-100 border-stone-200/80 dark:border-stone-800'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-stone-900/75 text-white text-[9px] uppercase tracking-wider text-center py-0.5 font-label-sm font-medium">
                    {idx === 0 ? 'Full Piece' : idx === 1 ? 'Macro View' : idx === 2 ? 'Materials' : idx === 3 ? 'Artisan Mark' : 'Living Space'}
                  </span>
                </button>
              ))}
            </div>

            {/* Quiet Provenance Strip Below Gallery */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-stone-600 dark:text-stone-400 font-label-sm text-xs tracking-wider border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#14532D] dark:text-emerald-400" />
                <span className="text-xs font-medium">{product.specs?.material || '100% Pure Natural Fibres'}</span>
              </div>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <div className="flex items-center gap-1.5">
                <Hand className="w-4 h-4 text-[#14532D] dark:text-emerald-400" />
                <span className="text-xs font-medium">{t('buyer.product.zeroAutomation', 'Zero Machine Automation')}</span>
              </div>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <div className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-[#14532D] dark:text-emerald-400" />
                <span className="text-xs font-medium">{product.specs?.dyeType || 'Organic Mineral Dyes'}</span>
              </div>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <div className="flex items-center gap-1.5 text-[#14532D] dark:text-emerald-400 font-bold">
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs">{t('buyer.product.certifiedArchival', 'Certified Sovereign Archival')}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CRAFT DETAILS, PRICING & ESCROW */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Origin Pill & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-label-sm text-xs uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                {product.district}
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-[#14532D] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-label-sm text-xs uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                {t('buyer.product.archivalBatch', 'Archival Batch 2026')}
              </span>
            </div>

            {/* Master Title */}
            <div className="flex flex-col gap-1">
              <h1 className="font-garamond text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 leading-tight font-bold">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-title-md text-base text-[#C2410C] italic font-semibold">
                  By {product.artisanName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
                <span className="font-label-sm text-xs uppercase tracking-wider text-[#14532D] dark:text-emerald-400 font-bold">
                  {product.artisanTitle}
                </span>
              </div>
            </div>

            {/* Trust Score Seal */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 flex items-center justify-between border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center font-bold text-[#14532D] dark:text-emerald-400 font-garamond text-lg border border-emerald-200/60 dark:border-emerald-800/40">
                  {product.rating ? (product.rating * 20).toFixed(1) : '99.4'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <StarHalf className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="font-label-sm text-xs text-stone-900 dark:text-stone-100 ml-1 font-bold">{t('buyer.product.giIntegrityScore', 'GI Integrity Score')}</span>
                  </div>
                  <span className="font-body-sm text-[11px] text-stone-500 dark:text-stone-400">Validated by {product.reviewsCount || 42} Connoisseurs & Curators</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="font-label-sm text-xs uppercase tracking-wider text-[#14532D] dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>{t('buyer.product.viewLedger', 'View Ledger')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pricing Block */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-xs flex flex-col gap-4 border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-garamond text-3xl sm:text-4xl text-[#14532D] dark:text-emerald-400 font-bold">
                    {formatCurrency(product.price, i18n.language)}
                  </span>
                  <span className="font-body-sm text-xs text-stone-500 dark:text-stone-400 font-medium">INR</span>
                </div>
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-label-sm text-[11px] uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                  {t('buyer.product.uniqueMasterpiece', '1/1 Unique Masterpiece')}
                </span>
              </div>

              {/* Transparent Revenue Allocation */}
              <div className="bg-[#FCFAF6] dark:bg-stone-850 p-4 rounded-xl flex flex-col gap-2 border border-stone-200/60 dark:border-stone-800">
                <div className="flex items-center justify-between font-label-sm text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  <span className="font-semibold">{t('buyer.product.fairTradeAllocation', 'Fair-Trade Revenue Allocation')}</span>
                  <span className="text-[#14532D] dark:text-emerald-400 font-bold">{t('buyer.product.transparentLedger', '100% Transparent')}</span>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 flex overflow-hidden rounded-full">
                  <div className="bg-[#14532D] dark:bg-emerald-500 h-full" style={{ width: `${product.artisanSharePercent}%` }} />
                  <div className="bg-[#C2410C] h-full" style={{ width: '5%' }} />
                  <div className="bg-stone-400 dark:bg-stone-500 h-full" style={{ width: '5%' }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="font-bold text-[#14532D] dark:text-emerald-400">{formatCurrency(product.artisanShareAmount, i18n.language)} ({formatNumber(product.artisanSharePercent, i18n.language)}%)</span>
                    <span className="block text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">{t('buyer.product.directToArtisan', 'Direct to')} {product.artisanName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#C2410C]">{formatCurrency(product.clusterFundAmount || 2400, i18n.language)} ({formatNumber(5, i18n.language)}%)</span>
                    <span className="block text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">{t('buyer.product.clusterFund', 'Cluster Fund')}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700 dark:text-stone-300">{formatCurrency(product.platformFeeAmount || 2400, i18n.language)} ({formatNumber(5, i18n.language)}%)</span>
                    <span className="block text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">{t('buyer.product.registryEscrow', 'Registry & Vault Escrow')}</span>
                  </div>
                </div>
              </div>

              {/* Shipping & Packaging info */}
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-body-sm text-xs pt-1">
                <PackageCheck className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                <span>{t('buyer.product.keepsakePackaging', 'Includes Hand-Carved Teak Keepsake Chest & Climate Seal Bag')}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-body-sm text-xs">
                <Truck className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                <span>{t('buyer.product.freeLogistics', 'Free Insured Air Courier via National Handloom Logistics (5-7 Days)')}</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleAcquire}
                className="flex-1 bg-[#14532D] hover:bg-[#0E3D20] text-white font-label-md text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl text-center transition-all flex items-center justify-center gap-2 font-bold shadow-xs hover:shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('buyer.product.acquireBtn', 'Acquire Masterwork')}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="flex-1 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 font-label-md text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl text-center transition-colors flex items-center justify-center gap-2 font-semibold border border-stone-300 dark:border-stone-700 cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#14532D] dark:text-emerald-400" />
                <span>{t('buyer.product.inspectBtn', 'Inspect Provenance')}</span>
              </button>
            </div>

            {/* Sovereign Escrow Vault Card */}
            <div className="bg-[#FCFAF6] dark:bg-stone-850 rounded-2xl p-5 flex items-start gap-4 border border-stone-200/80 dark:border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#14532D] dark:text-emerald-400 flex-shrink-0 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100">
                  {t('buyer.product.escrowVaultProtected', 'Protected by Sovereign Escrow Vault')}
                </span>
                <p className="font-body-sm text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t('buyer.product.escrowSafelyImpounded', 'Your payment of {{amount}} remains safely impounded in the GI Artisan Escrow. Funds are released directly to {{artisan}} only after you physically receive, inspect, and verify the craft and embedded cryptotag.', { amount: formatCurrency(product.price, i18n.language), artisan: product.artisanName })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IN-DEPTH TABBED DOSSIER SECTION */}
      <section className="w-full bg-[#F8F4EC] dark:bg-stone-900/60 py-12 px-4 sm:px-6 lg:px-8 border-t border-[#E7DECB]/80 dark:border-stone-800">
        <div className="max-w-[1440px] mx-auto">
          {/* Tabs Bar */}
          <div className="flex flex-wrap border-b border-stone-200 dark:border-stone-800 gap-6 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('story')}
              className={`font-label-md text-xs uppercase tracking-wider pb-3 font-bold transition-colors cursor-pointer ${
                activeTab === 'story' ? 'text-[#14532D] dark:text-emerald-400 border-b-2 border-[#14532D] dark:border-emerald-400' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {t('buyer.product.tabCraftNarrative', '01. Craft Narrative & Story')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('artisan')}
              className={`font-label-md text-xs uppercase tracking-wider pb-3 font-bold transition-colors cursor-pointer ${
                activeTab === 'artisan' ? 'text-[#14532D] dark:text-emerald-400 border-b-2 border-[#14532D] dark:border-emerald-400' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {t('buyer.product.tabArtisanDossier', '02. Artisan Dossier & Documentary')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certificate')}
              className={`font-label-md text-xs uppercase tracking-wider pb-3 font-bold transition-colors cursor-pointer ${
                activeTab === 'certificate' ? 'text-[#14532D] dark:text-emerald-400 border-b-2 border-[#14532D] dark:border-emerald-400' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {t('buyer.product.tabGiCertificate', '03. Sovereign GI Certificate & Ledger')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`font-label-md text-xs uppercase tracking-wider pb-3 font-bold transition-colors cursor-pointer ${
                activeTab === 'reviews' ? 'text-[#14532D] dark:text-emerald-400 border-b-2 border-[#14532D] dark:border-emerald-400' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {t('buyer.product.tabPatronAppraisals', '04. Patron Appraisals')} ({formatNumber(product.reviewsCount || 42, i18n.language)})
            </button>
          </div>

          {/* TAB 1: STORY */}
          {activeTab === 'story' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 dark:border-stone-800">
                  {/* English Story */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-[11px] uppercase tracking-wider text-stone-400 font-bold">{t('buyer.product.englishEditorial', 'English Editorial')}</span>
                      <span className="h-[1px] flex-1 bg-stone-200 dark:bg-stone-800" />
                    </div>
                    <h3 className="font-garamond text-xl text-stone-900 dark:text-stone-100 font-bold">
                      {product.longStory?.englishTitle || 'The Song of the Loom'}
                    </h3>
                    <p className="font-body-md text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {product.longStory?.englishText || product.description}
                    </p>
                  </div>

                  {/* Native Language Story */}
                  <div className="flex flex-col gap-3 bg-[#FCFAF6] dark:bg-stone-850 p-5 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#C2410C] font-bold">বাংলা আদি রূপ</span>
                      <span className="h-[1px] flex-1 bg-stone-200 dark:bg-stone-700" />
                    </div>
                    <h3 className="font-garamond text-2xl text-[#C2410C] font-bold">
                      {product.longStory?.bengaliTitle || 'কদমতলার অমর প্রেমগাথা'}
                    </h3>
                    <p className="font-body-md text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                      {product.longStory?.bengaliText || 'বাংলার শতাব্দীপ্রাচীন সুজনী ভরাট ও সুক্ষ্ম কাঁথাস্টিচের বুননে সৃষ্ট প্রতিটি নকশা যেন পল্লীপ্রকৃতির এক নিবিড় উচ্চারণ।'}
                    </p>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-4 border border-stone-200/80 dark:border-stone-800">
                  <h4 className="font-garamond text-xl text-stone-900 dark:text-stone-100 font-bold">{t('buyer.product.curatorialSpecs', 'Curatorial Specifications')}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col bg-[#FCFAF6] dark:bg-stone-850 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800">
                      <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">{t('buyer.product.dimensions', 'Dimensions')}</span>
                      <span className="font-title-md text-sm text-stone-900 dark:text-stone-100 mt-1 font-bold">{product.specs?.dimensions || '60" × 40" Inches'}</span>
                    </div>
                    <div className="flex flex-col bg-[#FCFAF6] dark:bg-stone-850 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800">
                      <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">{t('buyer.product.baseMaterial', 'Base Material')}</span>
                      <span className="font-title-md text-sm text-stone-900 dark:text-stone-100 mt-1 font-bold">{product.specs?.material || 'Wild Tussar Silk'}</span>
                    </div>
                    <div className="flex flex-col bg-[#FCFAF6] dark:bg-stone-850 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800">
                      <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">{t('buyer.product.density', 'Density')}</span>
                      <span className="font-title-md text-sm text-stone-900 dark:text-stone-100 mt-1 font-bold">{product.specs?.stitchDensity || '180 Stitches/In²'}</span>
                    </div>
                    <div className="flex flex-col bg-[#FCFAF6] dark:bg-stone-850 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800">
                      <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">{t('buyer.product.craftTime', 'Crafting Time')}</span>
                      <span className="font-title-md text-sm text-stone-900 dark:text-stone-100 mt-1 font-bold">{product.specs?.embroideryTime || '180 Days'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Care */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 flex flex-col gap-3 border border-stone-200/80 dark:border-stone-800 shadow-xs">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#14532D] dark:text-emerald-400 font-bold">{t('buyer.product.archivalPreservation', 'Archival Preservation')}</span>
                  <h4 className="font-garamond text-xl text-stone-900 dark:text-stone-100 font-bold">{t('buyer.product.museumCare', 'Museum-Grade Care & Longevity')}</h4>
                  <ul className="flex flex-col gap-2.5 font-body-sm text-xs text-stone-600 dark:text-stone-400 pt-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14532D] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t('buyer.product.sunExposure', 'Avoid direct unfiltered southern sun exposure.')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14532D] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t('buyer.product.dryClean', 'Dry clean exclusively by heritage textile conservators.')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14532D] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t('buyer.product.neemPacking', 'Supplied with pure neem-leaf parchment for seasonal packing.')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTISAN */}
          {activeTab === 'artisan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 dark:border-stone-800 items-center">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                  <img
                    src={product.artisanAvatar || product.images[0]}
                    alt={product.artisanName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900/90 to-transparent p-5 text-white">
                    <span className="font-label-sm text-[10px] uppercase tracking-wider text-emerald-300 font-bold">{t('buyer.product.masterArtisan', 'Master Artisan')}</span>
                    <div className="font-garamond text-2xl font-bold">{product.artisanName}</div>
                    <div className="text-xs opacity-90">{product.district}</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#14532D] text-white font-label-sm text-xs uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                    {product.artisanTitle}
                  </span>
                </div>
                <h3 className="font-garamond text-2xl text-stone-900 dark:text-stone-100 italic font-bold leading-relaxed">
                  "The needle does not pierce the silk to wound it, but to awaken the song sleeping in its threads."
                </h3>
                <p className="font-body-md text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t('buyer.product.artisanBio', 'Dedicated to preserving and passing on centuries-old indigenous weaving and embroidery traditions to future generations. Every piece represents hundreds of hours of focused mastery.')}
                </p>
                <div className="bg-[#FCFAF6] dark:bg-stone-850 rounded-xl p-4 flex items-center gap-4 border border-stone-200/60 dark:border-stone-800">
                  <div className="w-11 h-11 rounded-full bg-[#14532D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Play className="w-4 h-4 ml-0.5 fill-white" />
                  </div>
                  <div>
                    <h5 className="font-title-md text-sm text-stone-900 dark:text-stone-100 font-bold">{t('buyer.product.miniDocTitle', 'Mini Documentary: Voices of the Loom')}</h5>
                    <p className="font-body-sm text-[11px] text-stone-500 dark:text-stone-400">Inside the sunlit courtyard in {product.district}.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="max-w-3xl mx-auto bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-10 shadow-xs border border-stone-200/80 dark:border-stone-800 relative">
              <div className="p-6 sm:p-8 bg-[#FCFAF6] dark:bg-stone-850 rounded-xl flex flex-col gap-6 border border-stone-200/60 dark:border-stone-800">
                <div className="flex flex-col items-center text-center gap-1">
                  <BadgeCheck className="w-12 h-12 text-[#14532D] dark:text-emerald-400 mb-1" />
                  <span className="font-label-sm text-[11px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
                    {t('buyer.product.nationalRegistry', 'National Geographical Indications Registry')}
                  </span>
                  <h3 className="font-garamond text-2xl text-stone-900 dark:text-stone-100 font-bold">
                    {t('buyer.product.certTitle', 'Certificate of Sovereign Provenance')}
                  </h3>
                  <p className="font-label-sm text-xs uppercase tracking-wider text-[#C2410C] font-semibold">
                    {t('buyer.product.actInfo', 'Government of India GI Protection Act')} • Specimen #{product.giTagNumber}
                  </p>
                </div>
                <div className="h-[1px] w-full bg-stone-200 dark:bg-stone-700" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-body-sm text-xs">
                  <div>
                    <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block">{t('buyer.product.regMasterwork', 'Registered Masterwork')}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{product.name}</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block">{t('buyer.product.clusterOrigin', 'Cluster of Origin')}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{product.district}</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block">{t('buyer.product.masterArtisan', 'Master Artisan')}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{product.artisanName}</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block">{t('buyer.product.materialPurity', 'Material Purity')}</span>
                    <span className="font-bold text-[#14532D] dark:text-emerald-400 text-sm">100% Certified Natural (Pass)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 dark:border-stone-800 space-y-4">
              <h3 className="font-garamond text-2xl text-stone-900 dark:text-stone-100 font-bold">Patron Appraisals & Verification Logs</h3>
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-[#FCFAF6] dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-title-md text-sm font-bold text-stone-900 dark:text-stone-100">{t('buyer.product.inspectorName', 'Dr. Suniti Banerjee')}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">Verified Patron • Mumbai</span>
                  </div>
                  <div className="flex text-amber-500 mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    "An exquisite piece of living history. The tactile stitch density and color richness far exceed gallery photographs."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CERTIFICATE MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 max-w-xl w-full p-6 sm:p-8 rounded-2xl relative shadow-2xl border border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsCertModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-3">
              <FileCheck className="w-12 h-12 text-[#14532D] dark:text-emerald-400 mx-auto" />
              <h3 className="font-garamond text-2xl text-stone-900 dark:text-stone-100 font-bold">{t('buyer.product.provenanceLedger', 'Sovereign Provenance Ledger')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Certificate Specimen #{product.giTagNumber} issued for {product.name} crafted by {product.artisanName}.
              </p>
              <div className="p-4 bg-[#FCFAF6] dark:bg-stone-850 rounded-xl text-left font-mono text-[11px] space-y-1.5 text-stone-800 dark:text-stone-200 border border-stone-200/60 dark:border-stone-800">
                <div>{t('buyer.product.ledgerHash', 'HASH: 0x8F92A1...921C')}</div>
                <div>ORIGIN: {product.district}</div>
                <div className="text-[#14532D] dark:text-emerald-400 font-semibold">{t('buyer.product.escrowStatus', 'ESCROW STATUS: IMPOUNDED UNTIL DELIVERY')}</div>
              </div>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="w-full py-3 bg-[#14532D] hover:bg-[#0E3D20] text-white rounded-xl font-label-sm text-xs uppercase tracking-wider font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                {t('buyer.product.closeCertificate', 'Close Certificate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
