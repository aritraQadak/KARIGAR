import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSellerProfile } from '../../data/sellerData';
import { historyCounts } from '../../utils/trustCenter';
import { listProducts } from '../../utils/productApi';
import { formatEvidenceScore, evidenceLevels } from '../../utils/evidenceFormat';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '../../utils/formatters';
import { translateCollectionTitle } from '../../utils/localizedDisplay';

export default function Verification() {
  const { t, i18n } = useTranslation();
  const {user,token}=useAuth();
  const [loaded,setLoaded]=useState({token:null,products:[],error:''});
  useEffect(()=>{
    if(!token)return;
    let active=true;
    listProducts(token).then(data=>{if(active)setLoaded({token,products:data.products,error:''});})
      .catch(()=>{if(active)setLoaded({token,products:[],error:t('verification.loadingProducts')});});
    return()=>{active=false;};
  },[token, t]);
  const ready=!!token&&loaded.token===token,products=ready?loaded.products:[],counts=historyCounts(products);

  const cards=[
    [t('verification.identityKyc'), t('verification.notConnected'), t('verification.govIdentityHelp')],
    [t('verification.pehchanCard'), t('verification.notConnected'), t('verification.pehchanHelp')],
    [t('verification.giAuthorization'), user?.giTagNumber ? t('verification.giAuthText') : t('verification.notAdded'), t('verification.suppliedNote')],
    [t('verification.cooperativeCred'), user?.clusterName ? t('verification.orgSupplied') : t('verification.notAdded'), t('verification.membershipHelp')]
  ];

  const processLabel = p => {
    if (!p.media?.processVideo) return t('addProduct.noProcessEvidence', 'No process evidence');
    if (p.media.processSource === 'live_capture' && p.evidence?.live_capture) return t('addProduct.capturedThrough', 'Captured through KARIGAR');
    return t('addProduct.uploadedVideo', 'Uploaded process video');
  };

  const panel='rounded-2xl border border-gray-200 bg-seller-card p-5 sm:p-6 space-y-4';

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <header className={panel}>
        <p className="text-sm font-semibold text-seller-accent-ink">{t('verification.credentialsTitle')}</p>
        <h1 className="text-2xl font-bold">{t('verification.pageTitle')}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('verification.pageSubtitle')}</p>
      </header>

      <section className={panel}>
        <h2 className="text-lg font-bold">{t('verification.artisanVerificationStatus')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(([title,status,help])=>(
            <article key={title} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{status}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{help}</p>
            </article>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('verification.credentialNote')}</p>
      </section>

      <section className={panel}>
        <h2 className="text-lg font-bold">{t('verification.trustProfileTitle')}</h2>
        <p className="text-2xl font-bold">
          {formatNumber(initialSellerProfile.trustScore, i18n.language)} / {formatNumber(5, i18n.language)}{' '}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('verification.demoRating')}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('verification.ratingNote')}</p>
      </section>

      <section className={panel}>
        <h2 className="text-lg font-bold">{t('verification.verificationBadgesTitle')}</h2>
        <p className="text-sm">{user?.isVerified ? t('verification.verifiedByKarigar') : t('verification.pendingVerification')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('verification.badgesNote')}</p>
      </section>

      <section className={panel}>
        <h2 className="text-lg font-bold">{t('verification.productHistoryTitle')}</h2>
        {!ready ? (
          <p role="status">{t('verification.loadingProducts')}</p>
        ) : loaded.error ? (
          <p role="alert">{loaded.error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                [counts.published, t('verification.productPublished')],
                [counts.analyzed, t('verification.evidenceSnapshots')],
                [counts.process, t('verification.withMakingEvidence')],
                [counts.live, t('verification.withLiveCapture')]
              ].map(([count,label])=>(
                <div key={label} className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-4">
                  <p className="text-2xl font-bold">{formatNumber(count, i18n.language)}</p>
                  <p className="text-sm">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('verification.historyNote')}</p>
            {products.length === 0 ? (
              <p>{t('verification.noPublishedHistory')}</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {products.slice(0,10).map(p=>(
                  <li key={p.id} className="py-3 space-y-1">
                    <h3 className="font-semibold">{translateCollectionTitle(p.title, i18n.language)}</h3>
                    <p className="text-sm">
                      {t('verification.evidenceScore')}: {formatNumber(formatEvidenceScore(p.evidence?.score), i18n.language)} / {formatNumber(100, i18n.language)} —{' '}
                      {evidenceLevels[p.evidence?.level] || t('verification.levelUnavailable')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{processLabel(p)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('verification.analysisDate')}: {p.evidence?.analyzed_at && !Number.isNaN(Date.parse(p.evidence.analyzed_at))
                        ? formatDate(p.evidence.analyzed_at, i18n.language)
                        : t('verification.notRecorded')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className={panel}>
        <h2 className="text-lg font-bold">{t('verification.processHistoryTitle')}</h2>
        {ready && !loaded.error ? (
          <ul className="space-y-2 text-sm">
            {products.slice(0,10).map(p=>(
              <li key={p.id}>
                <span className="font-semibold">{translateCollectionTitle(p.title, i18n.language)}</span>
                {' — '}{processLabel(p)}
              </li>
            ))}
            {!products.length && <li>{t('verification.noProcessHistory')}</li>}
          </ul>
        ) : (
          <p className="text-sm">{loaded.error || t('verification.loadingProducts')}</p>
        )}
      </section>

      <section className={panel}>
        <h2 className="text-lg font-bold">{t('verification.docStatusTitle')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('verification.docStatusNote')}</p>
      </section>
    </div>
  );
}
