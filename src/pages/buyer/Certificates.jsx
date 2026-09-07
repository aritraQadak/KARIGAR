import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, ShieldCheck, Download, CheckCircle, ExternalLink } from 'lucide-react';

export default function Certificates() {
  const { t } = useTranslation();

  const certificates = [
    {
      id: 'GI-WB-2024-0082',
      craft: 'Nakshi Kantha Tapestry',
      artisan: 'Smt. Ananya Devi',
      cluster: 'Bolpur, Birbhum, West Bengal',
      purityScore: '99.4%',
      dateIssued: '12 Oct 2024',
      status: 'Blockchain Verified'
    },
    {
      id: 'GI-JK-2024-0921',
      craft: 'Kani Pashmina Shawl',
      artisan: 'Ghulam Hassan Mir',
      cluster: 'Srinagar, Kashmir',
      purityScore: '100%',
      dateIssued: '15 Sep 2024',
      status: 'Blockchain Verified'
    }
  ];

  return (
    <div className="w-full bg-surface py-space-2xl px-space-md lg:px-space-4xl min-h-[80vh]">
      <div className="max-w-[1440px] mx-auto space-y-space-2xl">
        <div className="border-b border-outline-variant/40 pb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-[0.14em] mb-1">
              <Link to="/patron" className="hover:text-secondary transition-colors">
                {t('buyer.certificates.home', 'Home')}
              </Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">{t('buyer.certificates.title', 'GI Certificates')}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {t('buyer.certificates.heading', 'Sovereign GI Certificates & Provenance Dossiers')}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-surface-container-lowest p-space-xl shadow-md border border-outline-variant/40 space-y-space-md relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
                <div className="flex items-center gap-space-xs text-secondary font-bold font-label-sm text-label-sm uppercase tracking-wider">
                  <Award className="w-5 h-5" />
                  <span>{cert.id}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[11px] font-label-sm uppercase tracking-wider font-bold inline-flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {cert.status}
                </span>
              </div>

              <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <div className="font-title-lg text-title-lg text-on-surface font-semibold">{cert.craft}</div>
                <div>{t('buyer.certificates.masterArtisan', 'Master Artisan')}: <span className="font-semibold text-on-surface">{cert.artisan}</span></div>
                <div>{t('buyer.certificates.cluster', 'Origin Cluster')}: <span className="text-on-surface">{cert.cluster}</span></div>
                <div>{t('buyer.certificates.purity', 'Lab Purity Index')}: <span className="font-semibold text-secondary">{cert.purityScore}</span></div>
                <div className="text-xs text-outline pt-1">{t('buyer.certificates.issuedOn', 'Issued On')}: {cert.dateIssued}</div>
              </div>

              <div className="pt-space-sm border-t border-outline-variant/30 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => alert(t('buyer.certificates.downloadAlert', 'Downloading Signed Sovereign Provenance PDF Certificate...'))}
                  className="inline-flex items-center gap- space-xs font-label-sm text-xs uppercase tracking-wider text-secondary font-bold hover:underline"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('buyer.certificates.downloadDossier', 'Download Archival PDF')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
