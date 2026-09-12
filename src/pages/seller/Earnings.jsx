import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useSeller } from '../../context/SellerContext';
import { formatCurrency, formatNumber, toLocaleDigits } from '../../utils/formatters';

export default function Earnings() {
  const { t, i18n } = useTranslation();
  const { profile, transactions, withdrawFunds, addToast } = useSeller();
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableBal = profile.withdrawableBalance || profile.availableBalance || 8420;

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || amt > availableBal) {
      if (addToast) {
        addToast(t('earnings.withdrawMinAmount'), 'error');
      } else {
        alert(t('earnings.withdrawMinAmount'));
      }
      return;
    }
    withdrawFunds(amt);
    setIsModalOpen(false);
  };

  const getLocalizedType = (type) => {
    switch (type) {
      case 'Escrow Release':
        return t('earnings.typeEscrowRelease');
      case 'Order Payment':
      case 'Credit':
        return t('earnings.typeOrderPayment');
      case 'Debit':
      case 'Bank Withdrawal':
        return t('earnings.typeBankWithdrawal');
      default:
        return type;
    }
  };

  const getLocalizedStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return t('earnings.statusCompleted');
      case 'pending':
        return t('earnings.statusPending');
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-seller-card  p-5 sm:p-6 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900  tracking-tight">
            {t('earnings.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500  mt-1">
            {t('earnings.pageSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-seller-accent hover:bg-seller-accent text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>{t('earnings.withdrawButton')}</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Withdrawable Balance */}
        <div className="bg-[#1b1e21] text-white rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">
              {t('earnings.availableBalance')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-seller-accent/80 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight">
              {formatCurrency(availableBal, i18n.language)}
            </span>
            <p className="text-xs text-emerald-200/80 mt-1">
              {t('orderDetails.fundsSecured')}
            </p>
          </div>
        </div>

        {/* Card 2: Pending in Escrow */}
        <div className="bg-seller-card  rounded-2xl p-5 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('earnings.inEscrow')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink flex items-center justify-center border border-seller-accent border-seller-accent">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-gray-900  tracking-tight">
              {formatCurrency(profile.pendingBalance || 3100, i18n.language)}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('orderDetails.escrowDescPending')}
            </p>
          </div>
        </div>

        {/* Card 3: Total Sales */}
        <div className="bg-seller-card  rounded-2xl p-5 border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('earnings.totalEarnings')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink flex items-center justify-center border border-seller-accent border-seller-accent">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-gray-900  tracking-tight">
              {formatCurrency(profile.totalEarnings || 24560, i18n.language)}
            </span>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {t('dashboard.topTier')}
            </p>
          </div>
        </div>
      </div>

      {/* Artisan Value Comparison Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/10 rounded-2xl p-5 border border-seller-accent/80 border-seller-accent/60 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {t('orderDetails.zeroCommission')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
              {t('about.missionDesc2')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-seller-card  px-3.5 py-2 rounded-xl border border-seller-accent border-seller-accent text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap shadow-2xs">
          <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t('verification.bankTitle')}</span>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-seller-card  rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 ">
              {t('earnings.transactions')}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
              {t('earnings.settlementNote')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-seller-muted/80  text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200/70 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">{t('earnings.txnId')}</th>
                <th className="py-3 px-4">{t('earnings.date')}</th>
                <th className="py-3 px-4">{t('earnings.orderRef')}</th>
                <th className="py-3 px-4">{t('earnings.type')}</th>
                <th className="py-3 px-4">{t('earnings.amount')}</th>
                <th className="py-3 px-4">{t('earnings.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
              {transactions.map((tx) => {
                const isCredit = tx.type === 'Credit' || tx.type === 'Escrow Release';
                return (
                  <tr key={tx.id} className="hover:bg-seller-muted/70 dark:hover:bg-seller-card transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                      {toLocaleDigits(tx.id, i18n.language)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {toLocaleDigits(tx.date, i18n.language)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-medium max-w-xs truncate">
                      {toLocaleDigits(tx.description, i18n.language)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isCredit
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-seller-accent-soft  text-seller-accent-ink text-seller-accent-ink border border-seller-accent border-seller-accent'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {getLocalizedType(tx.type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm">
                      <span className={isCredit ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}>
                        {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), i18n.language)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {getLocalizedStatus(tx.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-seller-card  rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {t('earnings.withdrawModalTitle')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('earnings.withdrawModalSubtitle')}
            </p>

            <form onSubmit={handleWithdraw} className="mt-4 space-y-4">
              <div className="p-3 bg-seller-muted  rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-1">
                  <span>{t('earnings.availableForTransfer')}:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(availableBal, i18n.language)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t('earnings.transferFee')}:</span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-400">
                    {t('earnings.freeZeroFee')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('earnings.withdrawAmountLabel')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    max={availableBal}
                    min={100}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-seller-card  rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  {t('earnings.instantImps')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-seller-muted  rounded-xl cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-seller-accent hover:bg-seller-accent rounded-xl shadow-xs cursor-pointer"
                >
                  {t('earnings.confirmWithdrawal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
