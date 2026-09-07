import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  ChevronDown,
  BadgeCheck,
  Package,
  Award,
  Bookmark,
  Wallet,
  Languages,
  Headset,
  LogOut,
  User,
  LogIn
} from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import StateSelectorDropdown from './StateSelectorDropdown';
import { useBuyer } from '../context/BuyerContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getInitials } from '../utils/formatters';

export default function BuyerHeader({ className = '' }) {
  const { t, i18n } = useTranslation();
  const { cartItemCount } = useBuyer();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('karigar-language', lng);
    } catch (_e) {}
  };

  const handleSignOut = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const userInitials = getInitials(user?.fullName);

  const isExploreActive = location.pathname.startsWith('/explore');

  return (
    <header className={`sticky top-0 left-0 w-full z-50 bg-[#FCFAF6]/95 dark:bg-[#181412]/95 backdrop-blur-md border-b border-[#E7DECB]/80 dark:border-stone-800 shadow-xs transition-colors ${className}`}>
      <div className="h-16 sm:h-[68px] max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Brand Logo & Clean Divider */}
        <div className="flex items-center gap-3">
          <Logo clickable linkTo="/patron" imgClassName="h-9 sm:h-10 w-auto object-contain" />
          <span className="h-4 w-[1px] bg-stone-300 dark:bg-stone-700 hidden sm:inline-block ml-1"></span>
        </div>

        {/* Center Navigation Bar */}
        <nav className="hidden lg:flex items-center justify-center gap-8 mx-auto">
          <Link
            to="/explore/west-bengal"
            className={`font-label-md text-xs uppercase tracking-[0.16em] transition-colors py-1.5 font-bold ${
              isExploreActive
                ? 'text-[#14532D] border-b-2 border-[#14532D] dark:text-emerald-400 dark:border-emerald-400'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#14532D] dark:hover:text-emerald-400'
            }`}
          >
            {t('buyer.nav.explore', 'Explore')}
          </Link>
          <a
            href="#clusters"
            className="font-label-md text-xs uppercase tracking-[0.16em] text-stone-700 dark:text-stone-300 hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors py-1.5 font-bold"
          >
            {t('buyer.nav.categories', 'Categories')}
          </a>
          <StateSelectorDropdown />
        </nav>

        {/* Right Action Icons & User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Icon Button */}
          <Link
            to="/cart"
            className="relative px-2.5 py-1.5 rounded-lg text-stone-800 dark:text-stone-200 hover:text-[#14532D] hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-all flex items-center gap-1.5 group"
            title={t('buyer.nav.cart', 'Cart')}
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span className="font-label-sm text-xs text-[#14532D] dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {cartItemCount}
            </span>
          </Link>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Language Switcher Button Group */}
          <div className="hidden sm:flex items-center bg-[#F3EFE6] dark:bg-stone-800/80 rounded-lg p-0.5 border border-[#E5D7C2] dark:border-stone-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                i18n.language === 'en' ? 'bg-[#14532D] text-white font-bold shadow-xs' : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('hi')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                i18n.language === 'hi' ? 'bg-[#14532D] text-white font-bold shadow-xs' : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('bn')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                i18n.language === 'bn' ? 'bg-[#14532D] text-white font-bold shadow-xs' : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>

          <span className="h-5 w-[1px] bg-stone-300 dark:bg-stone-700 inline-block"></span>

          {/* User Menu / Auth Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/50 focus:outline-none group cursor-pointer transition-colors"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-600 group-hover:border-[#14532D] transition-colors overflow-hidden bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-[#14532D] dark:text-emerald-400">{userInitials}</span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 group-hover:text-stone-800 dark:group-hover:text-white transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-[#14532D]' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#FCFAF6] dark:bg-[#1E1A17] border border-[#E7DECB] dark:border-stone-700 shadow-xl rounded-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Info Header */}
                  <div className="p-3 border-b border-[#E7DECB]/60 dark:border-stone-700/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-[#14532D] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 flex-shrink-0 overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="font-title-md text-[14px] leading-tight truncate text-stone-900 dark:text-stone-100 font-bold">
                          {user?.fullName || t('buyer.user.guest', 'Patron')}
                        </div>
                        <BadgeCheck className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                      </div>
                      <div className="font-label-sm text-[10px] text-[#14532D] dark:text-emerald-400 font-bold uppercase tracking-wider">
                        {user?.role === 'ARTISAN' ? t('buyer.user.verifiedArtisan', 'Verified Artisan') : t('buyer.user.verifiedPatron', 'Verified Patron')}
                      </div>
                      <div className="font-body-sm text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {user?.email || ''}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/buyer/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-label-sm text-xs uppercase tracking-wider font-bold">
                          {t('buyer.user.myProfile', 'My Profile')}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {t('buyer.user.myProfileSub', 'View & edit your patron account')}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/buyer/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-label-sm text-xs uppercase tracking-wider font-bold">
                          {t('buyer.user.myCollection', 'My Collection & Orders')}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {t('buyer.user.myCollectionSub', 'Track active consignments & escrow')}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/buyer/certificates"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors"
                    >
                      <Award className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-label-sm text-xs uppercase tracking-wider font-bold">
                          {t('buyer.user.giCertificates', 'GI Certificates & Dossiers')}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {t('buyer.user.giCertificatesSub', 'Verified blockchain origin records')}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/buyer/saved"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-label-sm text-xs uppercase tracking-wider font-bold">
                          {t('buyer.user.savedCrafts', 'Saved Crafts & Artisans')}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {t('buyer.user.savedCraftsSub', 'Bookmarked masterworks')}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/buyer/wallet"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-[#14532D] dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-label-sm text-xs uppercase tracking-wider font-bold">
                          {t('buyer.user.escrowWallet', 'Sovereign Escrow & Wallet')}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {t('buyer.user.escrowWalletSub', 'Protected escrow balance')}
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="h-[1px] bg-[#E7DECB]/60 dark:bg-stone-700/60 my-1"></div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        const nextLang = i18n.language === 'en' ? 'hi' : i18n.language === 'hi' ? 'bn' : 'en';
                        changeLanguage(nextLang);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors font-label-sm text-xs uppercase tracking-wider text-left"
                    >
                      <Languages className="w-4 h-4 text-stone-400" />
                      <span>{t('buyer.user.preferences', 'Preferences & Language')}</span>
                    </button>

                    <Link
                      to="/contact"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors font-label-sm text-xs uppercase tracking-wider"
                    >
                      <Headset className="w-4 h-4 text-stone-400" />
                      <span>{t('buyer.user.helpDesk', 'Help Desk & Ombudsman')}</span>
                    </Link>
                  </div>

                  <div className="h-[1px] bg-[#E7DECB]/60 dark:bg-stone-700/60 my-1"></div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors font-label-sm text-xs uppercase tracking-wider text-left font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('buyer.user.signOut', 'Sign Out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#14532D] hover:bg-[#0E3D20] text-white font-label-sm text-xs uppercase tracking-[0.14em] font-bold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('buyer.nav.signIn', 'Sign In')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
