import { CRAFT_CATEGORIES, normalizeCraftCategory } from '../../constants/craftCategories.js';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS } from '../../data/products';
import { artisanPortrait } from '../../data/demoImages';
import { getCraftImage, craftCategoryMap, getCraftCategory } from '../../constants/craftImageMap.js';
import { normalizeState } from '../../data/heritage.js';
import { useArtisanDirectory } from '../../hooks/useArtisanDirectory';
import CraftCard from '../../components/CraftCard';
import {
  translateState,
  translateCategory,
  translateCraftType,
  translateDistrict,
  translatePersonName,
  translateCollectionTitle,
  formatLocalizedNumber
} from '../../utils/localizedDisplay.js';

export default function Browse({ makers = false }) {
  const { t, i18n } = useTranslation();
  const { artisans, status, refresh } = useArtisanDirectory();
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [craft, setCraft] = useState('');

  const normalize = (value = "") => String(value || "").trim().toLowerCase();

  const collectionItems = useMemo(() => {
    if (makers) return artisans || [];
    const catalogArtisans = new Set(
      PRODUCTS.map((p) => `${(p.artisanName || "")?.toLowerCase()}|${(p.stateName || "")?.toLowerCase()}`)
    );
    const artisanPieces = (artisans || [])
      .filter((a) => !catalogArtisans.has(`${(a.fullName || a.name || "")?.toLowerCase()}|${(a.state || "")?.toLowerCase()}`))
      .map((a) => {
        const cType = a.craftType || 'Traditional Craft';
        const pCat = getCraftCategory(cType);
        const img = getCraftImage(cType);
        return {
          id: `artisan-piece-${a.id || a.fullName}`,
          artisanId: a.id,
          name: `${cType} Masterpiece`,
          craftType: cType,
          craftCategory: pCat,
          craftLineage: cType,
          state: a.state,
          stateName: a.state,
          stateSlug: a.stateSlug || normalizeState(a.state),
          district: a.district,
          artisanName: a.fullName || a.name,
          artisanTitle: `Master Artisan • ${a.state}`,
          price: 18000,
          images: [img],
          description: `Authentic handcrafted ${cType} by master artisan ${a.fullName || a.name} from ${a.district ? a.district + ', ' : ''}${a.state}.`,
          rating: 4.9,
          reviewsCount: 18,
          isFeatured: false,
        };
      });
    return [...PRODUCTS, ...artisanPieces];
  }, [makers, artisans]);

  const items = collectionItems;
  const stateName = item => makers ? item.state : item.stateName;

  const getParentCategory = item => {
    const rawCraft = makers ? item.craftType : (item.craftType || item.craftCategory || item.craftLineage);
    return craftCategoryMap[rawCraft] || getCraftCategory(rawCraft) || normalizeCraftCategory(rawCraft);
  };

  const states = [...new Set(items.map(stateName).filter(Boolean))].sort();
  const crafts = CRAFT_CATEGORIES;

  const results = items.filter(item => {
    if (state && stateName(item) !== state) return false;
    if (craft && craft !== 'All crafts' && craft !== 'all') {
      const parentCat = getParentCategory(item);
      if (normalize(parentCat) !== normalize(craft)) return false;
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const sEn = stateName(item) || '';
      const sHi = translateState(sEn, 'hi');
      const sBn = translateState(sEn, 'bn');

      const cEn = item.craftType || item.craftLineage || '';
      const cHi = translateCraftType(cEn, 'hi');
      const cBn = translateCraftType(cEn, 'bn');

      const catEn = getParentCategory(item) || '';
      const catHi = translateCategory(catEn, 'hi');
      const catBn = translateCategory(catEn, 'bn');

      const aEn = item.artisanName || item.name || '';
      const aHi = translatePersonName(aEn, 'hi');
      const aBn = translatePersonName(aEn, 'bn');

      const dEn = item.district || '';
      const dHi = translateDistrict(dEn, 'hi');
      const dBn = translateDistrict(dEn, 'bn');

      const tHi = translateCollectionTitle(item.name || item.title, 'hi');
      const tBn = translateCollectionTitle(item.name || item.title, 'bn');

      const text = `${item.name || ''} ${tHi} ${tBn} ${aEn} ${aHi} ${aBn} ${sEn} ${sHi} ${sBn} ${cEn} ${cHi} ${cBn} ${catEn} ${catHi} ${catBn} ${dEn} ${dHi} ${dBn}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const reset = () => { setQuery(''); setState(''); setCraft(''); };
  return (
    <section className="premium-section browse-directory">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t('buyer.premium.behindCraft', 'The hands behind the craft')}</span>
          <h1>{makers ? t('buyer.premium.browseArtisans', 'Browse artisans') : t('buyer.premium.browseCollections', 'Browse collections')}</h1>
          <p>{makers ? t('buyer.premium.artisanIntro', 'Meet the makers, discover their traditions, and find the art that speaks to you.') : t('buyer.premium.collectionIntro', 'Find something to treasure, by the place it comes from or the craft that brings it to life.')}</p>
        </div>
        <Link className="text-action" to={makers ? '/collections' : '/artisans'}>
          {makers ? t('buyer.premium.browseCollections', 'Browse collections') : t('buyer.premium.browseArtisans', 'Browse artisans')} <ArrowRight size={17} />
        </Link>
      </div>
      <div className="directory-filters">
        <label><span>{t('buyer.premium.searchLabel', 'Search')}</span><div className="directory-search"><Search size={18} /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('buyer.premium.searchCrafts', 'Search crafts, makers, states')} /></div></label>
        <label><span>{t('buyer.premium.stateLabel', 'State')}</span><select value={state} onChange={e => setState(e.target.value)}><option value="">{t('buyer.premium.allStates', 'All states')}</option>{states.map(value => <option key={value} value={value}>{translateState(value, i18n.language)}</option>)}</select></label>
        <label><span>{t('buyer.premium.craftLabel', 'Art & craft')}</span><select value={craft} onChange={e => setCraft(e.target.value)}><option value="">{t('buyer.premium.allCrafts', 'All crafts')}</option>{crafts.map(value => <option key={value} value={value}>{translateCategory(value, i18n.language)}</option>)}</select></label>
        <button className="text-action" onClick={reset} type="button">{t('buyer.premium.resetFilters', 'Reset filters')}</button>
      </div>
      {makers && status === 'loading' && <p role="status">{t('buyer.premium.loadingMakers', 'Updating the artisan directory…')}</p>}
      {makers && status === 'error' && <p role="status">{t('buyer.premium.makersUnavailable', 'Showing catalogue artisans. The live directory is temporarily unavailable.')} <button type="button" className="text-action" onClick={refresh}>{t('buyer.premium.retry', 'Try again')}</button></p>}
      <p className="directory-count" role="status">{formatLocalizedNumber(results.length, i18n.language)} {makers ? t('buyer.premium.artisans', 'Artisans') : t('buyer.premium.availableCrafts', 'available pieces')}</p>
      <div className={makers ? 'maker-grid directory-makers' : 'craft-grid'}>
        {results.map(item => makers ? (
          <article className="maker-card" key={item.id}>
            <img
              className="maker-demo-portrait"
              src={encodeURI(getCraftImage(item.craftType))}
              alt={item.craftType || "Artisan craft"}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/demo_image/default.jpg";
              }}
            />
            <div><small>{[translateDistrict(item.district, i18n.language), translateState(item.state, i18n.language)].filter(Boolean).join(', ')}</small><h3>{translatePersonName(item.name || item.fullName, i18n.language)}</h3><p>{translateCraftType(item.craftType, i18n.language)}</p>
              {item.products && item.products.length ? <div className="maker-work-links">{item.products.map(product => <Link key={product.id} to={`/product/${product.id}`}>{translateCollectionTitle(product.name, i18n.language)} <ArrowRight size={14} /></Link>)}</div> : <span className="maker-coming-soon">{t('buyer.premium.craftsComingSoon', 'Craft listings coming soon')}</span>}
            </div>
          </article>
        ) : <CraftCard key={item.id} product={item} />)}
      </div>
      {!results.length && <div className="premium-empty"><h3>{t('buyer.premium.noMatches', 'No matches just yet')}</h3><p>{t('buyer.premium.tryFilters', 'Try another state, craft, or search term.')}</p><button type="button" className="text-action" onClick={reset}>{t('buyer.premium.resetFilters', 'Reset filters')}</button></div>}
    </section>
  );
}
