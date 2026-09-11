import { useTheme } from '../../context/ThemeContext';
import { artisanPortrait } from '../../data/demoImages';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Sun,
  Moon,
  Building2,
  Bell,
  Languages,
  ShieldCheck,
  Save,
  Phone,
} from 'lucide-react';
import { useSeller } from '../../context/SellerContext';

export default function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile, lang, setLang, addToast } = useSeller();

  const [formData, setFormData] = useState({
    name: profile.name || 'Sushila Devi',
    craft: profile.craftType || 'Terracotta Artisan',
    location: profile.location || 'West Bengal, India',
    phone: profile.phone || '+91 98765 43210',
    email: profile.email || 'sushila@karigar.in',
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• •••• 4892',
    ifsc: 'SBIN0001420',
    accountHolder: profile.name || 'Sushila Devi',
    workshopAddress: 'House 14, Panchmura Kumbhakar Para, Bankura, West Bengal - 722156',
    smsNotifications: true,
    whatsappNotifications: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      craftType: formData.craft,
      location: formData.location,
      phone: formData.phone,
      email: formData.email
    });
    addToast(t('common.save') + ': ' + t('common.success'), 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-seller-card  p-5 sm:p-6 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900  tracking-tight">
            {t('settings.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500  mt-1">
            {t('settings.pageSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-seller-accent hover:bg-seller-accent text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{t('common.save')}</span>
        </button>
      </div>

      <section aria-labelledby="seller-appearance" className="bg-seller-card  rounded-2xl p-6 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs space-y-4">
        <div>
          <h2 id="seller-appearance" className="text-sm font-bold text-gray-900 dark:text-gray-100">{t('buyer.premium.appearance', 'Appearance')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('buyer.premium.themeDescription', 'Choose a light or dark look for your browsing experience.')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[['light', Sun, t('buyer.premium.lightTheme', 'Light')], ['dark', Moon, t('buyer.premium.darkTheme', 'Dark')]].map(([value, Icon, label]) => (
            <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seller-accent ${theme === value ? 'bg-seller-accent text-white border-seller-accent dark:bg-seller-accent dark:border-seller-accent' : 'bg-seller-muted text-gray-700 border-gray-200  dark:text-gray-200 dark:border-gray-600'}`}>
              <Icon size={18} aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid of Setting Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Artisan Profile */}
        <div className="bg-seller-card  rounded-2xl p-6 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/80">
            <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-900 ">{t('settings.artisanProfile', 'Artisan Profile')}</h3>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={artisanPortrait(profile)}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-seller-accent shadow-xs"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900 ">{formData.name}</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{formData.craft}</p>
              <span className="inline-block mt-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {t('settings.aadhaarGiVerified', 'Aadhaar & GI Verified')}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.fullName', 'Full Name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.craftSpecialization', 'Craft Specialization')}</label>
              <input
                type="text"
                value={formData.craft}
                onChange={(e) => setFormData({ ...formData, craft: e.target.value })}
                className="w-full px-3 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.phoneForSms', 'Phone Number (For Order SMS)')}</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.workshopAddress', 'Workshop / Kiln Physical Address')}</label>
              <textarea
                rows={2}
                value={formData.workshopAddress}
                onChange={(e) => setFormData({ ...formData, workshopAddress: e.target.value })}
                className="w-full px-3 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank Account & Payouts */}
        <div className="bg-seller-card  rounded-2xl p-6 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/80">
            <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-900 ">{t('settings.directPayoutTitle', 'Direct Payout Bank Account')}</h3>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              {t('settings.aadhaarSeededDesc', 'Bank account is Aadhaar-seeded for direct escrow disbursements from verified buyer payments.')}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.accountHolderName', 'Account Holder Name')}</label>
              <input
                type="text"
                value={formData.accountHolder}
                disabled
                className="w-full px-3 py-2 bg-seller-muted dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.bankName', 'Bank Name')}</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.accountNumber', 'Account Number')}</label>
              <input
                type="text"
                value={formData.accountNumber}
                disabled
                className="w-full px-3 py-2 bg-seller-muted dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-mono font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">{t('settings.ifscCode', 'IFSC Code')}</label>
              <input
                type="text"
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                className="w-full px-3 py-2 bg-seller-muted  border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Interface Language & Regional Dialects */}
        <div className="bg-seller-card  rounded-2xl p-6 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/80">
            <Languages className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-900 ">{t('settings.languageSection')}</h3>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('settings.languageDesc')}
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
              { code: 'bn', label: 'Bengali', native: 'বাংলা' }
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLang(item.code);
                  addToast(t('settings.langChangedToast', { lang: item.native, defaultValue: `Language changed to ${item.native}` }), 'info');
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  lang === item.code
                    ? 'border-seller-accent bg-seller-accent-soft/70  text-seller-accent-ink text-seller-accent-ink font-bold ring-2 ring-orange-200 dark:ring-orange-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="block text-sm">{item.native}</span>
                <span className="text-[10px] text-gray-400">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Communication & Notifications */}
        <div className="bg-seller-card  rounded-2xl p-6 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/80">
            <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-900 ">{t('settings.alertsAndNotifications', 'Alerts & Notifications')}</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-muted/50  cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">{t('settings.smsAlertsTitle', 'Instant SMS Dispatch Alerts')}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{t('settings.smsAlertsDesc', 'Receive SMS alerts when a new order is confirmed.')}</span>
              </div>
              <input
                type="checkbox"
                checked={formData.smsNotifications}
                onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
                className="w-4 h-4 text-seller-accent-ink rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-muted/50  cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">{t('settings.whatsappAudioTitle', 'WhatsApp Audio Updates')}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{t('settings.whatsappAudioDesc', 'Get payout notifications and voice notes via WhatsApp.')}</span>
              </div>
              <input
                type="checkbox"
                checked={formData.whatsappNotifications}
                onChange={(e) => setFormData({ ...formData, whatsappNotifications: e.target.checked })}
                className="w-4 h-4 text-seller-accent-ink rounded"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
