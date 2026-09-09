import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS } from '../../data/products';
import { artisanPortrait } from '../../data/demoImages';
import { useArtisanDirectory } from '../../hooks/useArtisanDirectory';
import CraftCard from '../../components/CraftCard';

export default function Browse({ makers = false }) {
  const { t } = useTranslation();
  const { artisans, status, refresh } = useArtisanDirectory();
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [craft, setCraft] = useState('');
  const items = makers ? artisans : PRODUCTS;
  const stateName = item => makers ? item.state : item.stateName;
  const craftName = item => makers ? item.craftType : item.craftCategory;
  const states = [...new Set(items.map(stateName).filter(Boolean))].sort();
  const crafts = [...new Set(items.map(craftName).filter(Boolean))].sort();
  const results = items.filter(item =>
    (!state || stateName(item) === state) && (!craft || craftName(item) === craft) &&
    [item.name, stateName(item), craftName(item), item.artisanName, item.district, item.craftLineage]
      .filter(Boolean).join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );
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
        <label><span>{t('buyer.premium.stateLabel', 'State')}</span><select value={state} onChange={e => setState(e.target.value)}><option value="">{t('buyer.premium.allStates', 'All states')}</option>{states.map(value => <option key={value}>{value}</option>)}</select></label>
        <label><span>{t('buyer.premium.craftLabel', 'Art & craft')}</span><select value={craft} onChange={e => setCraft(e.target.value)}><option value="">{t('buyer.premium.allCrafts', 'All crafts')}</option>{crafts.map(value => <option key={value}>{value}</option>)}</select></label>
        <button className="text-action" onClick={reset} type="button">{t('buyer.premium.resetFilters', 'Reset filters')}</button>
      </div>
      {makers && status === 'loading' && <p role="status">{t('buyer.premium.loadingMakers', 'Updating the artisan directory…')}</p>}
      {makers && status === 'error' && <p role="status">{t('buyer.premium.makersUnavailable', 'Showing catalogue artisans. The live directory is temporarily unavailable.')} <button type="button" className="text-action" onClick={refresh}>{t('buyer.premium.retry', 'Try again')}</button></p>}
      <p className="directory-count" role="status">{results.length} {makers ? t('buyer.premium.artisans', 'Artisans') : t('buyer.premium.availableCrafts', 'available pieces')}</p>
      <div className={makers ? 'maker-grid directory-makers' : 'craft-grid'}>
        {results.map(item => makers ? (
          <article className="maker-card" key={item.id}>
            <img className="maker-demo-portrait" src={artisanPortrait(item)} alt="Artisan demo portrait" loading="lazy" />
            <div><small>{[item.district, item.state].filter(Boolean).join(', ')}</small><h3>{item.name}</h3><p>{item.craftType}</p>
              {item.products.length ? <div className="maker-work-links">{item.products.map(product => <Link key={product.id} to={`/product/${product.id}`}>{product.name} <ArrowRight size={14} /></Link>)}</div> : <span className="maker-coming-soon">{t('buyer.premium.craftsComingSoon', 'Craft listings coming soon')}</span>}
            </div>
          </article>
        ) : <CraftCard key={item.id} product={item} />)}
      </div>
      {!results.length && <div className="premium-empty"><h3>{t('buyer.premium.noMatches', 'No matches just yet')}</h3><p>{t('buyer.premium.tryFilters', 'Try another state, craft, or search term.')}</p><button type="button" className="text-action" onClick={reset}>{t('buyer.premium.resetFilters', 'Reset filters')}</button></div>}
    </section>
  );
}
