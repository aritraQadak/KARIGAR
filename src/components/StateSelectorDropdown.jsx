import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, MapPin, ChevronRight } from 'lucide-react';
import { STATES_CRAFTS, REGIONS } from '../data/statesCrafts';

import { formatNumber } from '../utils/formatters';
import { translateState, translateCraftType } from '../utils/localizedDisplay';

export default function StateSelectorDropdown({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegions, setExpandedRegions] = useState({
    'East': true,
    'North': true,
    'South': true,
    'West': true,
    'Central': true,
    'Northeast': true,
    'Union Territory': true,
  });

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter states by search query (multilingual)
  const filteredGroupedStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = {};

    REGIONS.forEach(region => {
      const statesInRegion = STATES_CRAFTS.filter(s => s.region === region);
      if (!query) {
        result[region] = statesInRegion;
      } else {
        const matched = statesInRegion.filter(s => {
          const stateEn = s.name.toLowerCase();
          const stateTrans = translateState(s.name, i18n.language).toLowerCase();
          const craftsEn = s.crafts.some(c => c.items.some(i => i.toLowerCase().includes(query)));
          const craftsTrans = s.crafts.some(c => c.items.some(i => translateCraftType(i, i18n.language).toLowerCase().includes(query)));
          return stateEn.includes(query) || stateTrans.includes(query) || craftsEn || craftsTrans;
        });
        if (matched.length > 0) {
          result[region] = matched;
        }
      }
    });

    return result;
  }, [searchQuery, i18n.language, t]);

  const toggleRegion = (region) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  const handleSelectState = (slug) => {
    setIsOpen(false);
    setSearchQuery('');
    navigate(`/explore/${slug}`);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={e => { if(e.key === 'Escape') setIsOpen(false); }}
        className="flex items-center gap-1.5 font-label-md text-label-md uppercase tracking-[0.14em] text-on-surface-variant hover:text-secondary transition-colors py-space-xs font-semibold focus:outline-none"
        aria-expanded={isOpen}
      >
        <span>{t('buyer.nav.selectState', 'Select Your State')}</span>
        <ChevronDown
          className={`w-4 h-4 text-outline transition-transform duration-200 ${isOpen ? 'rotate-180 text-secondary' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-80 max-h-[480px] bg-[#FCFAF6] dark:bg-[#1E1A17] border border-[#E7DECB] dark:border-stone-700 shadow-xl rounded-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-3 bg-[#F8F4EC] dark:bg-stone-800/70 border-b border-[#E7DECB]/80 dark:border-stone-700 sticky top-0 z-10">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('buyer.nav.searchStatePlaceholder', 'Search state or craft (e.g. Kashmir, Saree)...')}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-[#D5C9B3] dark:border-stone-700 focus:border-[#14532D] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#14532D]/30 focus:outline-none placeholder:text-stone-400 font-sans transition-all"
                aria-label={t('buyer.nav.searchStatePlaceholder', 'Search state or craft')}
                onKeyDown={e => { if(e.key === 'Escape') { setIsOpen(false); dropdownRef.current?.querySelector('button')?.focus(); } }}
                autoFocus
              />
            </div>
          </div>

          {/* Region Grouped List */}
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 py-1">
            {Object.keys(filteredGroupedStates).length === 0 ? (
              <div className="p-4 text-center text-xs text-outline font-sans">
                {t('buyer.nav.noStatesFound', 'No states found matching search query')}
              </div>
            ) : (
              REGIONS.map(region => {
                const states = filteredGroupedStates[region];
                if (!states || states.length === 0) return null;

                const isExpanded = expandedRegions[region] || searchQuery.trim().length > 0;

                return (
                  <div key={region} className="bg-surface-container-lowest">
                    {/* Region Section Header */}
                    <button
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className="w-full px-3 py-1.5 bg-surface-container-low/70 hover:bg-surface-container-low flex items-center justify-between text-left transition-colors"
                    >
                      <span className="font-label-sm text-[11px] uppercase tracking-[0.16em] font-bold text-secondary">
                        {t(`buyer.nav.region_${region.toLowerCase().replace(/\s+/g, '_')}`, region)} {region === 'Union Territory' ? t('buyer.nav.territories', 'Territories') : t('buyer.nav.guilds', 'Guilds')} ({formatNumber(states.length, i18n.language)})
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-outline transition-transform duration-200 ${isExpanded ? 'rotate-90 text-secondary' : ''}`}
                      />
                    </button>

                    {/* States List in Region */}
                    {isExpanded && (
                      <div className="py-0.5">
                        {states.map(state => (
                          <button
                            key={state.slug}
                            type="button"
                            onClick={() => handleSelectState(state.slug)}
                            className="w-full px-4 py-2 hover:bg-surface-container flex items-start gap-2 text-left transition-colors group"
                          >
                            <MapPin className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="min-w-0 flex-1">
                              <div className="font-label-sm text-[12px] uppercase tracking-[0.1em] font-semibold text-on-surface group-hover:text-secondary truncate">
                                {translateState(state.name, i18n.language)}
                              </div>
                              <div className="font-body-sm text-[11px] text-outline truncate leading-tight">
                                {state.crafts.map(c => c.items.slice(0, 1).map(item => translateCraftType(item, i18n.language)).join('')).slice(0, 2).join(' • ')}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2 bg-surface-container-high/60 border-t border-outline-variant/30 text-[10px] text-outline text-center uppercase tracking-wider">
            {t('buyer.nav.all36Territories', 'All 36 Indian States & UTs Registered')}
          </div>
        </div>
      )}
    </div>
  );
}
