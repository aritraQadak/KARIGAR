/**
 * Centralized presentation-level localization helpers for KARIGAR.
 * Safely renders localized forms of canonical entities:
 * - States and UTs (37)
 * - Craft Categories (13)
 * - Regional Craft Types (340)
 * - Districts & Hubs (271)
 * - Artisan, Patron, Maker, and Seller Names (370+)
 * - Numbers, Currencies, and Dates
 * 
 * Canonical data remains unchanged in English for database, routing, and APIs.
 */

import {
  translateState,
  translateCategory,
  translateCraftType,
  translateDistrict,
  translatePersonName,
  transliterateText,
  COLLECTION_TITLE_TRANSLATIONS,
  translateCollectionTitle,
  translateCollectionDescription,
  translateProductSpec
} from '../constants/culturalTranslations.js';

import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatLocalizedNumber,
  formatLocalizedPrice,
  formatLocalizedDate,
  toLocaleDigits,
  getInitials
} from './formatters.js';

export {
  translateState,
  translateCategory,
  translateCraftType,
  translateDistrict,
  translatePersonName,
  transliterateText,
  COLLECTION_TITLE_TRANSLATIONS,
  translateCollectionTitle,
  translateCollectionDescription,
  translateProductSpec,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatLocalizedNumber,
  formatLocalizedPrice,
  formatLocalizedDate,
  toLocaleDigits,
  getInitials
};
