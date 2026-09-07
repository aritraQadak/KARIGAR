import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  ShieldCheck,
  Award,
  ZoomIn,
  Wallet,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  Star
} from 'lucide-react';
import { getStateBySlug, STATES_CRAFTS, REGIONS } from '../../data/statesCrafts';
import { getProductsByState, PRODUCTS } from '../../data/products';
import { useBuyer } from '../../context/BuyerContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function StateExplore() {
  const { stateSlug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useBuyer();

  const currentState = getStateBySlug(stateSlug) || STATES_CRAFTS.find(s => s.slug === 'west-bengal');
  const rawProducts = getProductsByState(currentState.slug);
  // Fallback to all products if state has fewer mock items
  const stateProducts = rawProducts.length > 0 ? rawProducts : PRODUCTS;

  // Filter States
  const [selectedCrafts, setSelectedCrafts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [onlyAwardees, setOnlyAwardees] = useState(false);
  const [maxPrice, setMaxPrice] = useState(85000);
  const [sortBy, setSortBy] = useState('heirloom');
  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = useState(false);

  // Quick switch grouped state dropdown
  const groupedStates = useMemo(() => {
    const res = {};
    REGIONS.forEach(reg => {
      res[reg] = STATES_CRAFTS.filter(s => s.region === reg);
    });
    return res;
  }, []);

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return stateProducts.filter(p => {
      if (selectedCrafts.length > 0 && !selectedCrafts.includes(p.craftLineage)) {
        return false;
      }
      if (selectedDistricts.length > 0 && !selectedDistricts.some(d => p.district?.includes(d))) {
        return false;
      }
      if (onlyAwardees && !p.artisanTitle?.includes('Award')) {
        return false;
      }
      if (p.price > maxPrice) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'wage-desc') return b.artisanSharePercent - a.artisanSharePercent;
      return b.rating - a.rating;
    });
  }, [stateProducts, selectedCrafts, selectedDistricts, onlyAwardees, maxPrice, sortBy]);

  const toggleCraftFilter = (craft) => {
    setSelectedCrafts(prev =>
      prev.includes(craft) ? prev.filter(c => c !== craft) : [...prev, craft]
    );
  };

  const toggleDistrictFilter = (district) => {
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const resetFilters = () => {
    setSelectedCrafts([]);
    setSelectedDistricts([]);
    setOnlyAwardees(false);
    setMaxPrice(85000);
    setSortBy('heirloom');
  };

  const handleAcquire = (product) => {
    addToCart(product, 1);
    navigate('/cart');
  };

  // Available unique crafts and districts for sidebar
  const availableCrafts = Array.from(new Set(stateProducts.map(p => p.craftLineage)));
  const availableDistricts = ['Bolpur', 'Shantipur', 'Murshidabad', 'Bishnupur', 'Panchmura', 'Jaipur', 'Varanasi', 'Srinagar'];

  return (
    <div className="flex flex-col w-full bg-surface text-on-surface">
      {/* Navigational Breadcrumb & State Context Header */}
      <section className="w-full bg-surface-container-low py-space-sm px-space-md lg:px-space-xl shadow-xs border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-[0.14em] text-outline">
            <Link className="hover:text-secondary transition-colors" to="/patron">{t('buyer.stateExplore.homeNav', 'Home')}</Link>
            <span className="text-outline-variant">/</span>
            <span className="text-outline">{t('buyer.stateExplore.statesOfHeritage', 'States of Heritage')}</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold">{currentState.name}</span>
          </nav>

          {/* Quick {t('buyer.stateExplore.switchStateBtn', 'Switch State')} Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuickSwitchOpen(!isQuickSwitchOpen)}
              className="inline-flex items-center gap-space-xs bg-surface px-space-md py-1.5 shadow-xs border border-outline-variant/50 text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-sm text-[11px] uppercase tracking-[0.12em] font-semibold text-on-surface">
                Viewing: {currentState.name}
              </span>
              <span className="font-label-sm text-[11px] text-secondary font-medium tracking-[0.08em]">
                {t('buyer.stateExplore.switchStateBtn', 'Switch State')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-outline transition-transform duration-200 ${isQuickSwitchOpen ? 'rotate-180 text-secondary' : ''}`} />
            </button>

            {isQuickSwitchOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 max-h-96 overflow-y-auto bg-surface-container-lowest border border-outline-variant shadow-2xl py-space-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-space-md py-1 font-label-sm text-[10px] uppercase tracking-[0.16em] text-outline bg-surface-container-low font-bold">
                  All 36 States & Union Territories
                </div>
                {REGIONS.map(region => (
                  <div key={region} className="py-1 border-b border-outline-variant/30 last:border-0">
                    <div className="px-space-md py-0.5 font-label-sm text-[10px] uppercase tracking-[0.14em] text-secondary font-bold">
                      {region}
                    </div>
                    {groupedStates[region]?.map(st => (
                      <button
                        key={st.slug}
                        type="button"
                        onClick={() => {
                          setIsQuickSwitchOpen(false);
                          navigate(`/explore/${st.slug}`);
                        }}
                        className={`w-full text-left px-space-md py-1 font-label-sm text-[11px] uppercase tracking-[0.12em] flex items-center justify-between transition-colors ${
                          st.slug === currentState.slug ? 'bg-surface-container text-secondary font-bold' : 'text-on-surface hover:bg-surface-container hover:text-secondary'
                        }`}
                      >
                        <span>{st.name}</span>
                        {st.slug === currentState.slug && <span className="text-[10px] text-secondary">(Active)</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* State Hero Banner */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low py-space-3xl px-space-md lg:px-space-xl shadow-sm border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
          <div className="lg:col-span-8 space-y-space-md">
            <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-1 shadow-xs border border-outline-variant/40">
              <BadgeCheck className="w-4 h-4 text-secondary" />
              <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] font-semibold text-secondary">
                {t('buyer.stateExplore.sovereignRegister', 'Ministry of Textiles Sovereign Register')}
              </span>
            </div>
            <h1 className="font-garamond text-headline-lg lg:text-[3.5rem] lg:leading-[4rem] text-on-surface font-bold">
              {currentState.name}: <span className="italic text-secondary font-normal">{t('buyer.stateExplore.sacredNeedles', 'Sacred Needles')}</span> & Whisper Weaves
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
              {currentState.description} Protected under the Sovereign Artisan Escrow Mandate.
            </p>

            {/* Badges */}
            <div className="pt-space-sm flex flex-wrap gap-space-sm">
              <div className="bg-surface-container-lowest px-space-md py-space-xs shadow-xs border border-outline-variant/40 flex items-center gap-space-xs">
                <span className="font-label-sm text-[11px] uppercase tracking-[0.14em] text-outline">{t('buyer.stateExplore.giRegister', 'GI Register')}</span>
                <span className="font-label-sm text-[11px] uppercase tracking-[0.16em] font-bold text-on-surface">#082</span>
              </div>
              <div className="bg-surface-container-lowest px-space-md py-space-xs shadow-xs border border-outline-variant/40 flex items-center gap-space-xs">
                <span className="font-label-sm text-[11px] uppercase tracking-[0.14em] text-outline">{t('buyer.stateExplore.activeWeavers', 'Active Weavers')}</span>
                <span className="font-label-sm text-[11px] tracking-[0.1em] font-bold text-secondary">3,420 Certified</span>
              </div>
              <div className="bg-surface-container-lowest px-space-md py-space-xs shadow-xs border border-outline-variant/40 flex items-center gap-space-xs">
                <span className="font-label-sm text-[11px] uppercase tracking-[0.14em] text-outline">{t('buyer.stateExplore.handloomClusters', 'Handloom Clusters')}</span>
                <span className="font-label-sm text-[11px] tracking-[0.1em] font-bold text-on-surface">14 Verified</span>
              </div>
              <div className="bg-secondary text-on-secondary px-space-md py-space-xs shadow-xs flex items-center gap-space-xs">
                <Wallet className="w-3.5 h-3.5 text-primary-fixed" />
                <span className="font-label-sm text-[11px] uppercase tracking-[0.14em] font-bold">Direct Escrow Payout: 91.4%</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-4 relative">
            <div className="relative bg-surface shadow-xl p-space-sm border border-outline-variant/40">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-highest">
                <img
                  src={stateProducts[0]?.images[0] || 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80'}
                  alt={currentState.name}
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent p-space-md text-on-primary">
                  <span className="font-label-sm text-[10px] uppercase tracking-[0.18em] text-primary-fixed block">{t('buyer.stateExplore.masterpieceSpotlight', 'Masterpiece Spotlight')}</span>
                  <span className="font-garamond text-title-md font-semibold text-on-primary block">{stateProducts[0]?.name || 'Heirloom Tapestry'}</span>
                  <span className="block font-body-sm text-[11px] text-surface-container-highest opacity-90 mt-0.5">{currentState.name} Cluster • Certified Heritage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body: Grid + Filter Sidebar */}
      <section className="max-w-[1440px] mx-auto w-full py-space-2xl px-space-md lg:px-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Filter Sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-space-lg">
            <div className="bg-surface-container-low p-space-lg shadow-xs border border-outline-variant/40">
              <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/40">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-secondary" />
                  <h2 className="font-label-lg text-label-lg uppercase tracking-[0.16em] font-bold text-on-surface">{t('buyer.stateExplore.curatedFilters', 'Curated Filters')}</h2>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-label-sm text-[11px] uppercase tracking-[0.14em] text-secondary hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> {t('buyer.stateExplore.reset', 'Reset')}
                </button>
              </div>

              {/* {t('buyer.stateExplore.craftLineage', 'Craft Lineage')} Filter */}
              <div className="py-space-md border-b border-outline-variant/30 space-y-space-xs">
                <div className="flex justify-between items-center mb-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-[0.16em] font-semibold text-on-surface">{t('buyer.stateExplore.craftLineage', 'Craft Lineage')}</span>
                </div>
                {availableCrafts.map(craft => (
                  <label key={craft} className="flex items-center gap-space-xs text-body-sm text-on-surface cursor-pointer py-1 hover:text-secondary">
                    <input
                      type="checkbox"
                      checked={selectedCrafts.includes(craft)}
                      onChange={() => toggleCraftFilter(craft)}
                      className="w-4 h-4 text-secondary accent-secondary cursor-pointer"
                    />
                    <span className="flex-1 text-xs">{craft}</span>
                    <span className="bg-surface px-1 py-0.5 text-[9px] font-semibold text-secondary border border-outline-variant/40">{t('buyer.stateExplore.giTagLabel', 'GI TAG')}</span>
                  </label>
                ))}
              </div>

              {/* {t('buyer.stateExplore.originDistrict', 'Origin District')} Filter */}
              <div className="py-space-md border-b border-outline-variant/30 space-y-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.16em] font-semibold text-on-surface block mb-space-xs">{t('buyer.stateExplore.originDistrict', 'Origin District')}</span>
                {availableDistricts.slice(0, 4).map(district => (
                  <label key={district} className="flex items-center gap-space-xs text-body-sm text-on-surface cursor-pointer py-1 hover:text-secondary">
                    <input
                      type="checkbox"
                      checked={selectedDistricts.includes(district)}
                      onChange={() => toggleDistrictFilter(district)}
                      className="w-4 h-4 accent-secondary cursor-pointer"
                    />
                    <span className="text-xs">{district}</span>
                  </label>
                ))}
              </div>

              {/* {t('buyer.stateExplore.artisanVerification', 'Artisan Verification')} Filter */}
              <div className="py-space-md border-b border-outline-variant/30 space-y-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.16em] font-semibold text-on-surface block mb-space-xs">{t('buyer.stateExplore.artisanVerification', 'Artisan Verification')}</span>
                <label className="flex items-center justify-between text-body-sm text-on-surface cursor-pointer py-1">
                  <span className="text-xs">{t('buyer.stateExplore.nationalAwardeesOnly', 'National Awardees Only')}</span>
                  <input
                    type="checkbox"
                    checked={onlyAwardees}
                    onChange={(e) => setOnlyAwardees(e.target.checked)}
                    className="w-4 h-4 accent-secondary cursor-pointer"
                  />
                </label>
              </div>

              {/* {t('buyer.stateExplore.priceSpectrum', 'Price Spectrum')} */}
              <div className="py-space-md space-y-space-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-[0.16em] font-semibold text-on-surface">{t('buyer.stateExplore.maxPrice', 'Max Price')}</span>
                  <span className="font-label-sm text-label-sm font-bold text-secondary">{formatCurrency(maxPrice, i18n.language)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-secondary h-1.5 bg-surface-container-highest cursor-pointer"
                />
                <div className="flex justify-between text-outline font-label-sm text-[10px] uppercase tracking-wider pt-1">
                  <span>{formatCurrency(5000, i18n.language)}</span>
                  <span>{formatCurrency(100000, i18n.language)}</span>
                </div>
              </div>
            </div>

            {/* {t('buyer.stateExplore.directEscrowPromise', 'Direct Escrow Promise')} Card */}
            <div className="bg-secondary-container/20 p-space-md shadow-xs space-y-space-xs border border-secondary/30">
              <div className="flex items-center gap-space-xs text-secondary font-bold">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-label-sm text-label-sm uppercase tracking-[0.16em]">{t('buyer.stateExplore.directEscrowPromise', 'Direct Escrow Promise')}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {t('buyer.stateExplore.escrowPromiseDesc', 'Every purchase deposits directly into the master artisan\'s regional bank account via the KARIGAR Sovereign Escrow Gateway.')}
              </p>
            </div>
          </aside>

          {/* Product Grid (9 cols) */}
          <main className="lg:col-span-9 space-y-space-lg">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-space-sm bg-surface-container-low p-space-md shadow-xs border border-outline-variant/40">
              <div>
                <h3 className="font-garamond text-title-md text-on-surface font-bold">{currentState.name} {t('buyer.stateExplore.catalogueHeading', 'Artisanal Catalogue')}</h3>
                <span className="font-label-sm text-[11px] text-outline uppercase tracking-[0.12em]">
                  Showing {filteredProducts.length} Masterpieces from {currentState.name} Clusters
                </span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto">
                <span className="font-label-sm text-[11px] uppercase tracking-[0.14em] text-outline whitespace-nowrap">{t('buyer.stateExplore.sortBy', 'Sort By:')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface text-on-surface font-label-sm text-[11px] uppercase tracking-[0.12em] px-space-md py-2 shadow-xs border border-outline-variant/60 focus:outline-none w-full sm:w-auto"
                >
                  <option value="heirloom">Heirloom Antiquity & Rarity</option>
                  <option value="wage-desc">{t('buyer.stateExplore.sortWage', 'Fair Wage Share: High to Low')}</option>
                  <option value="price-asc">{t('buyer.stateExplore.sortPriceAsc', 'Price: Low to High')}</option>
                  <option value="price-desc">{t('buyer.stateExplore.sortPriceDesc', 'Price: High to Low')}</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-surface-container-lowest p-8 border border-outline-variant/40">
                  <p className="font-garamond text-title-lg text-on-surface mb-2">{t('buyer.stateExplore.noMatches', 'No masterworks match the selected filters')}</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 bg-secondary text-on-secondary font-label-sm uppercase tracking-wider text-xs"
                  >
                    {t('buyer.stateExplore.clearFilters', 'Clear Filters')}
                  </button>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <article
                    key={product.id}
                    className="bg-surface-container-lowest shadow-md flex flex-col group hover:shadow-xl transition-all duration-300 border border-outline-variant/40"
                  >
                    <div className="relative aspect-[4/5] bg-surface-container-high overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-space-sm left-space-sm flex flex-col gap-1">
                        <span className="bg-secondary text-on-secondary px-2 py-0.5 font-label-sm text-[10px] uppercase tracking-[0.16em] font-semibold shadow-xs">
                          {product.giTagStatus}
                        </span>
                        <span className="bg-surface text-on-surface px-2 py-0.5 font-label-sm text-[10px] uppercase tracking-[0.14em] font-bold shadow-xs">
                          {product.craftLineage}
                        </span>
                      </div>
                      <Link
                        to={`/product/${product.id}`}
                        className="absolute bottom-space-sm right-space-sm bg-surface/90 hover:bg-surface text-on-surface p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View Product"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </Link>
                    </div>

                    <div className="p-space-md flex-1 flex flex-col justify-between space-y-space-md">
                      <div>
                        <div className="flex items-center justify-between text-outline font-label-sm text-[10px] uppercase tracking-[0.14em] mb-1">
                          <span>{product.district}</span>
                          <span>{t('buyer.stateExplore.giCertified', 'GI Certified')}</span>
                        </div>
                        <h4 className="font-garamond text-title-lg text-on-surface font-bold group-hover:text-secondary transition-colors">
                          <Link to={`/product/${product.id}`}>{product.name}</Link>
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Pricing & Fair Share */}
                      <div className="bg-surface-container-low p-space-sm shadow-xs space-y-1 border border-outline-variant/30">
                        <div className="flex justify-between items-baseline">
                          <span className="font-garamond text-headline-sm text-on-surface font-bold">
                            {formatCurrency(product.price, i18n.language)}
                          </span>
                          <span className="font-label-sm text-[10px] text-secondary font-bold">
                            {t('buyer.stateExplore.artisanShare', 'Artisan Share:')} {formatCurrency(product.artisanShareAmount, i18n.language)} ({formatNumber(product.artisanSharePercent, i18n.language)}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-container-highest h-1 overflow-hidden">
                          <div className="bg-secondary h-full" style={{ width: `${product.artisanSharePercent}%` }} />
                        </div>
                      </div>

                      <div className="pt-space-xs flex gap-space-xs">
                        <button
                          type="button"
                          onClick={() => handleAcquire(product)}
                          className="flex-1 bg-on-surface text-surface hover:bg-secondary hover:text-on-secondary py-2.5 px-space-md font-label-sm text-[11px] uppercase tracking-[0.16em] font-semibold transition-colors shadow-xs text-center"
                        >
                          {t('buyer.stateExplore.acquireMasterwork', 'Acquire Masterwork')}
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="bg-surface-container px-3 text-on-surface hover:bg-surface-container-highest transition-colors shadow-xs flex items-center justify-center"
                          title="Verify Ledger"
                        >
                          <BadgeCheck className="w-5 h-5 text-secondary" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </main>
        </div>
      </section>

      {/* Artisans Dossier Strip */}
      <section className="w-full bg-surface-container py-space-3xl px-space-md lg:px-space-xl shadow-xs border-t border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto space-y-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-sm border-b border-outline-variant/30">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] font-semibold text-secondary block mb-1">
                Human Legacy & Guild Keepers
              </span>
              <h2 className="font-garamond text-headline-lg text-on-surface font-bold">
                Living Heirlooms: Custodians of {currentState.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {stateProducts.slice(0, 4).map((prod, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-space-md shadow-md flex flex-col justify-between space-y-space-md border border-outline-variant/40">
                <div>
                  <div className="relative aspect-square mb-space-sm bg-surface-container-high overflow-hidden">
                    <img
                      src={prod.artisanAvatar || prod.images[0]}
                      alt={prod.artisanName}
                      className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                    />
                    <span className="absolute bottom-2 left-2 bg-on-surface text-surface px-2 py-0.5 font-label-sm text-[9px] uppercase tracking-widest font-bold">
                      {t('buyer.stateExplore.masterCraftsman', 'Master Craftsman')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-secondary mb-1">
                    <BadgeCheck className="w-4 h-4" />
                    <span className="font-label-sm text-[10px] uppercase tracking-[0.14em] font-semibold">{prod.district}</span>
                  </div>
                  <h3 className="font-garamond text-title-lg text-on-surface font-bold">{prod.artisanName}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                    {prod.artisanTitle} — Custodian of {prod.craftLineage} weaving tradition.
                  </p>
                </div>
                <Link
                  to={`/product/${prod.id}`}
                  className="font-label-sm text-[11px] uppercase tracking-[0.14em] font-semibold text-secondary hover:text-on-surface transition-colors flex items-center justify-between pt-space-xs border-t border-outline-variant/30"
                >
                  <span>{t('buyer.stateExplore.readDossier', 'Read Artisan Dossier')}</span>
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Territorial Cluster Map */}
      <section className="max-w-[1440px] mx-auto w-full py-space-3xl px-space-md lg:px-space-xl">
        <div className="bg-surface-container-low p-space-lg lg:p-space-2xl shadow-md border border-outline-variant/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md pb-space-lg border-b border-outline-variant/40">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] font-semibold text-secondary">
                {t('buyer.stateExplore.cartographyLabel', 'Geographical Indication Cartography')}
              </span>
              <h2 className="font-garamond text-headline-lg text-on-surface font-bold mt-1">
                {currentState.name} {t('buyer.stateExplore.craftLineage', 'Craft Lineage')} Map
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch mt-space-md">
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-md shadow-xs relative min-h-[380px] flex flex-col justify-between overflow-hidden border border-outline-variant/40">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start text-[10px] font-mono text-outline uppercase">
                  <span>{t('buyer.stateExplore.telemetryGrid', 'STATE CLUSTER TELEMETRY GRID')}</span>
                  <span>{currentState.name.toUpperCase()} REGIONAL ZONE</span>
                </div>
                <div className="py-12 text-center">
                  <MapPin className="w-10 h-10 text-secondary mx-auto mb-2 animate-bounce" />
                  <h4 className="font-garamond text-title-lg text-on-surface font-bold">{currentState.name} Sovereign Weaving Hub</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                    Geo-location verified across active looms in {availableDistricts.slice(0, 3).join(', ')}.
                  </p>
                </div>
                <div className="flex justify-between text-[10px] text-outline">
                  <span>{t('buyer.stateExplore.statusOperational', 'Status: Operational')}</span>
                  <span className="text-secondary font-bold">100% Escrow Verified</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface p-space-lg shadow-xs flex flex-col justify-between space-y-space-md border border-outline-variant/40">
              <div>
                <span className="px-2 py-0.5 bg-secondary text-on-secondary font-label-sm text-[10px] uppercase tracking-widest font-bold block w-fit mb-2">
                  {t('buyer.stateExplore.activeClusterFocus', 'Active Cluster Focus')}
                </span>
                <h3 className="font-garamond text-headline-sm text-on-surface font-bold">{currentState.name} Guild Central</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  {t('buyer.stateExplore.dedicatedGroups', 'Dedicated master artisan groups specializing in authentic heritage craftsmanship. Verified under the National Handloom Commission.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetFilters()}
                className="w-full bg-secondary hover:bg-on-surface text-on-secondary py-space-sm px-space-md font-label-sm text-label-sm uppercase tracking-[0.16em] font-semibold transition-colors shadow-xs"
              >
                View All {currentState.name} Masterpieces ({stateProducts.length})
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
