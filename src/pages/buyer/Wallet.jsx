import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wallet as WalletIcon, ShieldCheck, ArrowDownRight, ArrowUpRight, Award, Lock } from 'lucide-react';
import { formatCurrency, toLocaleDigits } from '../../utils/formatters';

export default function Wallet() {
  const { t, i18n } = useTranslation();

  const transactions = [
    {
      id: 'TXN-9021',
      date: '12 Oct 2024',
      type: 'Escrow Locked',
      amount: 48000,
      isLock: true,
      description: 'Radha-Krishna Narrative Nakshi Kantha Tapestry (Order #KGR-849201)'
    },
    {
      id: 'TXN-7718',
      date: '28 Aug 2024',
      type: 'Escrow Disbursed to Artisan',
      amount: 31050,
      isLock: false,
      description: 'Direct Payout to Ramdas Ansari (Order #KGR-710293)'
    }
  ];

  return (
    <div className="w-full bg-surface py-space-2xl px-space-md lg:px-space-4xl min-h-[80vh]">
      <div className="max-w-[1440px] mx-auto space-y-space-2xl">
        <div className="border-b border-outline-variant/40 pb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-[0.14em] mb-1">
              <Link to="/patron" className="hover:text-secondary transition-colors">
                {t('buyer.wallet.home', 'Home')}
              </Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">{t('buyer.wallet.title', 'Sovereign Escrow Wallet')}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {t('buyer.wallet.heading', 'Patron Sovereign Escrow & Guild Reserve')}
            </h1>
          </div>
        </div>

        {/* Escrow Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
          <div className="bg-surface-container-lowest p-space-xl shadow-md border border-outline-variant/40 space-y-space-xs md:col-span-2">
            <div className="flex items-center gap-space-xs text-secondary font-bold font-label-sm text-label-sm uppercase tracking-wider">
              <WalletIcon className="w-5 h-5" />
              <span>{t('buyer.wallet.activeEscrow', 'Active Escrow Balance Impounded')}</span>
            </div>
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {formatCurrency(120000, i18n.language)}
            </div>
            <p className="text-body-sm text-on-surface-variant max-w-lg">
              {t('buyer.wallet.escrowExplanation', 'Patron funds remain securely vaulted under Government-compliant escrow. Money is only transferred to artisan bank accounts when delivery and authenticity are verified.')}
            </p>
          </div>

          <div className="bg-secondary text-on-secondary p-space-xl shadow-md space-y-space-xs flex flex-col justify-between">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider font-bold">
              <ShieldCheck className="w-5 h-5 text-primary-fixed" />
              <span>{t('buyer.wallet.guarantee', '100% Direct Payout Protocol')}</span>
            </div>
            <div className="font-headline-sm text-headline-sm text-primary-fixed font-bold">
              {toLocaleDigits(t('buyer.wallet.disbursedAmount', '₹ 4.8 Cr+'), i18n.language)}
            </div>
            <p className="text-body-sm text-secondary-fixed text-xs">
              {t('buyer.wallet.totalDisbursed', 'Disbursed directly to national awardees and artisan cooperatives nationwide.')}
            </p>
          </div>
        </div>

        {/* Ledger Transactions */}
        <div className="bg-surface-container-lowest p-space-xl shadow-md border border-outline-variant/40 space-y-space-md">
          <h3 className="font-title-lg text-title-lg text-on-surface font-semibold border-b border-outline-variant/30 pb-space-xs">
            {t('buyer.wallet.recentLedger', 'Recent Escrow Audit Log')}
          </h3>

          <div className="space-y-space-sm">
            {transactions.map((tItem) => (
              <div key={tItem.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md bg-surface-container-low border border-outline-variant/30 gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tItem.isLock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {tItem.isLock ? <Lock className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-title-md text-title-md font-semibold text-on-surface">
                      {tItem.isLock ? t('buyer.wallet.escrowLocked', 'Escrow Locked') : t('buyer.wallet.escrowDisbursed', 'Escrow Disbursed to Artisan')}
                    </div>
                    <div className="text-body-sm text-on-surface-variant text-xs">{toLocaleDigits(tItem.description, i18n.language)}</div>
                  </div>
                </div>
                <div className="text-right sm:text-right w-full sm:w-auto">
                  <div className="font-title-lg text-title-lg font-bold text-on-surface">
                    {formatCurrency(tItem.amount, i18n.language)}
                  </div>
                  <div className="text-xs text-outline">{toLocaleDigits(tItem.date, i18n.language)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
