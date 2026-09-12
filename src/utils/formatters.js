/**
 * Karigar Locale & Formatting Utilities
 * Standardized localization helpers for currency (INR), numerals, dates, relative time, and avatars.
 */

export const LOCALE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN'
};

const DIGIT_MAPS = {
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  bn: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
};

/**
 * Replaces Western digits 0-9 with language-specific native numerals (Devanagari for Hindi, Bengali numerals for Bengali).
 *
 * @param {string|number} str
 * @param {string} lang - 'en' | 'hi' | 'bn'
 * @returns {string}
 */
export function toLocaleDigits(str, lang = 'en') {
  if (str == null) return '';
  const s = String(str);
  const cleanLang = (lang || 'en').split('-')[0];
  const map = DIGIT_MAPS[cleanLang];
  if (!map) return s;
  return s.replace(/[0-9]/g, d => map[Number(d)]);
}

/**
 * Returns the standardized BCP 47 locale tag for the given language code.
 */
export function getLocale(lang = 'en') {
  const cleanLang = (lang || 'en').split('-')[0];
  return LOCALE_MAP[cleanLang] || 'en-IN';
}

/**
 * Formats an amount into localized Indian Rupee (INR) currency.
 * Automatically renders localized currency symbols, grouping, and numerals.
 *
 * @param {number|string} amount
 * @param {string} lang - 'en' | 'hi' | 'bn'
 * @param {Intl.NumberFormatOptions} options
 * @returns {string} e.g. "₹1,250", "₹१,२५०", or "₹১,২৫০"
 */
export function formatCurrency(amount, lang = 'en', options = {}) {
  const num = Number(amount);
  const cleanLang = (lang || 'en').split('-')[0];
  if (isNaN(num)) return toLocaleDigits('₹0', cleanLang);
  const locale = getLocale(cleanLang);
  let res;
  try {
    res = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      ...options
    }).format(num);
  } catch (err) {
    console.warn('formatCurrency error:', err);
    res = `₹${num.toLocaleString('en-IN')}`;
  }
  return toLocaleDigits(res, cleanLang);
}

/**
 * Alias for formatCurrency as requested in requirements.
 */
export const formatLocalizedPrice = formatCurrency;

/**
 * Formats a plain number with localized digits and Indian numbering separators.
 *
 * @param {number|string} value
 * @param {string} lang - 'en' | 'hi' | 'bn'
 * @param {Intl.NumberFormatOptions} options
 * @returns {string}
 */
export function formatNumber(value, lang = 'en', options = {}) {
  const num = Number(value);
  const cleanLang = (lang || 'en').split('-')[0];
  if (isNaN(num)) return toLocaleDigits(String(value), cleanLang);
  const locale = getLocale(cleanLang);
  let res;
  try {
    res = new Intl.NumberFormat(locale, options).format(num);
  } catch (err) {
    res = num.toLocaleString('en-IN');
  }
  return toLocaleDigits(res, cleanLang);
}

/**
 * Alias for formatNumber as requested in requirements.
 */
export const formatLocalizedNumber = formatNumber;

/**
 * Formats a date object or ISO date string into a localized date representation.
 *
 * @param {Date|string|number} date
 * @param {string} lang - 'en' | 'hi' | 'bn'
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, lang = 'en', options = {}) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const cleanLang = (lang || 'en').split('-')[0];
  if (isNaN(d.getTime())) return toLocaleDigits(String(date), cleanLang);
  const locale = getLocale(cleanLang);
  let res;
  try {
    res = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(d);
  } catch (err) {
    res = d.toLocaleDateString();
  }
  return toLocaleDigits(res, cleanLang);
}

/**
 * Alias for formatDate as requested in requirements.
 */
export const formatLocalizedDate = formatDate;

/**
 * Formats relative time (e.g. "2 days ago", "5 minutes ago", "just now").
 *
 * @param {number} value - Negative for past, positive for future
 * @param {Intl.RelativeTimeFormatUnit} unit - 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
 * @param {string} lang - 'en' | 'hi' | 'bn'
 * @returns {string}
 */
export function formatRelativeTime(value, unit, lang = 'en') {
  const cleanLang = (lang || 'en').split('-')[0];
  const locale = getLocale(cleanLang);
  let res;
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    res = rtf.format(value, unit);
  } catch (err) {
    res = `${Math.abs(value)} ${unit}s ago`;
  }
  return toLocaleDigits(res, cleanLang);
}

/**
 * Generates clean 1 to 2 letter uppercase initials from a full name.
 * e.g. "Santosh Sharma" -> "SS", "Anita Sharma" -> "AS", "Ramesh" -> "R"
 *
 * @param {string} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'U';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

