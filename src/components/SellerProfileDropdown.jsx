import { artisanPortrait } from '../data/demoImages';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Info,
  Mail,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useSeller } from '../context/SellerContext';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/formatters';

export default function SellerProfileDropdown() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { profile, addToast } = useSeller();
  const { user, logout } = useAuth();

  const displayName = user?.fullName || profile.name || t('nav.verifiedBadge');
  const displayEmail = user?.email || profile.email || '';
  const displayAvatar = artisanPortrait(user || profile);
  const initials = getInitials(displayName);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    addToast(t('common.loggedOut', 'Logged out successfully'), 'info');
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { label: t('nav.myProfile'), path: '/seller/profile', icon: User, badge: t('common.confirmed') },
    { label: t('nav.aboutKarigar'), path: '/seller/about', icon: Info },
    { label: t('nav.getInTouch'), path: '/seller/contact', icon: Mail },
    { label: t('nav.settings'), path: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Avatar & Seller Name Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-seller-muted dark:hover:bg-seller-card transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-left focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative flex-shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 shadow-2xs"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700 shadow-2xs">
              {initials}
            </div>
          )}
          {/* Green verified dot badge */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#1F2937] flex items-center justify-center text-white"
            title={t('verification.badgeMasterArtisan')}
          >
            <CheckCircle className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        </div>

        <div className="hidden sm:block">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[130px]">
              {displayName}
            </h3>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
              {t('nav.verifiedBadge')}
            </span>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-seller-card  rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in-50 duration-150">
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/80">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              {t('nav.verifiedBadge')}
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">
              {displayName}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
              {displayEmail}
            </p>
          </div>

          {/* Links */}
          <div className="p-1 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-seller-muted dark:hover:bg-seller-card rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className="p-1 border-t border-gray-100 dark:border-gray-700/80 mt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
