import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Languages,
  ChevronDown,
  Menu,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';
import { useSeller } from '../context/SellerContext';

import SellerProfileDropdown from './SellerProfileDropdown';

export default function SellerHeader({ onToggleMobileMenu }) {
  const { t } = useTranslation();
  const { profile, lang, setLang, addToast } = useSeller();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const notifRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: t('notifications.paymentReleased'),
      desc: t('dashboard.escrowPaymentDesc'),
      time: t('dashboard.timeAgo10m'),
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'
    },
    {
      id: 3,
      title: t('notifications.giRenewal'),
      desc: t('dashboard.giRenewalDesc'),
      time: t('dashboard.timeAgo1d'),
      icon: PackageCheck,
      color: 'text-seller-accent-ink bg-seller-accent-soft  text-seller-accent-ink'
    }
  ];

  const unreadCount = notificationsRead ? 0 : notifications.length;

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    const messages = {
      en: 'Language switched to English',
      hi: 'भाषा बदलकर हिन्दी कर दी गई',
      bn: 'ভাষা বাংলায় পরিবর্তিত হয়েছে'
    };
    addToast(messages[newLang] || messages.en, 'info');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-seller-card  border-b border-gray-200/90 dark:border-gray-700/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & breadcrumb or title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-seller-muted dark:hover:bg-seller-card md:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('nav.artisanStudio')}</span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 font-medium px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {profile.cluster || t('dashboard.bankuraCluster')}
          </span>
        </div>
      </div>

      {/* Right side: Language, Notifications, Seller Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative inline-flex shrink-0 items-center rounded-full border border-stone-300/80 dark:border-gray-600 bg-seller-card/80  text-stone-800 dark:text-gray-100 shadow-sm backdrop-blur-md focus-within:ring-2 focus-within:ring-amber-700">
          <Languages aria-hidden="true" className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#914626] text-seller-accent-ink" />
          <select
            aria-label={t('common.chooseLanguage', 'Choose language')}
            value={['en', 'hi', 'bn'].includes(lang?.split('-')[0]) ? lang.split('-')[0] : 'en'}
            onChange={event => handleLanguageChange(event.target.value)}
            className="min-h-11 cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-10 pr-9 text-sm font-medium outline-none"
          >
            <option className="bg-seller-card " value="en" lang="en">English</option>
            <option className="bg-seller-card " value="hi" lang="hi">हिन्दी</option>
            <option className="bg-seller-card " value="bn" lang="bn">বাংলা</option>
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 h-4 w-4 text-stone-500 dark:text-gray-400" />
        </label>

        {/* 2. Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setNotificationsRead(true);
            }}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-seller-muted dark:hover:bg-seller-card transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white dark:ring-[#1F2937]"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-seller-card  rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('notifications.title')}
                </h4>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {t('notifications.allSystemsActive')}
                </span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-3 hover:bg-seller-muted dark:hover:bg-seller-card flex items-start gap-3 transition-colors cursor-pointer">
                      <div className={`p-2 rounded-lg ${n.color} flex-shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{n.title}</p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">{n.desc}</p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 inline-block">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-0.5" />

        {/* 3 & 4. Seller Avatar & Name with interactive Dropdown */}
        <SellerProfileDropdown />
      </div>
    </header>
  );
}
