import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, BadgeCheck, Store, Building2 } from 'lucide-react';
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from './SocialIcons';
import { toLocaleDigits } from '../utils/formatters';
import Logo from './Logo';

export default function Footer({ className = '', variant = 'seller' }) {
  const { t, i18n } = useTranslation();

  if (variant === 'buyer') {
    return (
      <footer className={`w-full bg-[#F8F4EC] dark:bg-stone-950 border-t border-[#E7DECB]/80 dark:border-stone-800 pt-12 sm:pt-16 pb-10 ${className}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Institution & GI Credentials Row */}
          <div className="border-b border-stone-200/80 dark:border-stone-800 pb-10 mb-10">
            <div className="text-center mb-6">
              <span className="font-label-sm text-xs uppercase tracking-[0.2em] text-[#14532D] dark:text-emerald-400 font-bold">
                {t('buyer.footer.nationalRegistry', 'National Heritage Provenance & Institutional Registry')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-2xl p-5 flex items-center gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex-shrink-0">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-label-sm text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100">
                    {t('buyer.footer.giTitle', 'Geographical Indication (GI)')}
                  </div>
                  <div className="font-body-sm text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    {t('buyer.footer.giDesc', 'Certified Sovereign Origin Mark')}
                  </div>
                </div>
              </div>
              <div className="border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-2xl p-5 flex items-center gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-label-sm text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100">
                    {t('buyer.footer.gemTitle', 'Government e-Marketplace')}
                  </div>
                  <div className="font-body-sm text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    {t('buyer.footer.gemDesc', 'Accredited GeM Guild Seller')}
                  </div>
                </div>
              </div>
              <div className="border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-2xl p-5 flex items-center gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-label-sm text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100">
                    {t('buyer.footer.ministryTitle', 'Ministry of Textiles')}
                  </div>
                  <div className="font-body-sm text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    {t('buyer.footer.ministryDesc', 'Office of Dev. Commissioner (Handlooms)')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Guild Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-200/80 dark:border-stone-800">
            <div>
              <h4 className="font-label-md text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100 mb-3.5">
                {t('buyer.footer.northernWeaves', 'Northern Weaves')}
              </h4>
              <ul className="space-y-2 font-body-sm text-xs text-stone-600 dark:text-stone-400">
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/jammu-kashmir">{t('buyer.footer.kaniPashmina', 'Kani & Pashmina (Kashmir)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/uttar-pradesh">{t('buyer.footer.banarasiKatan', 'Banarasi Katan (Varanasi)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/uttar-pradesh">{t('buyer.footer.chikankari', 'Chikankari (Lucknow)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/himachal-pradesh">{t('buyer.footer.kulluShawls', 'Kullu Shawls (Himachal)')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-md text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100 mb-3.5">
                {t('buyer.footer.westernGuilds', 'Western Guilds')}
              </h4>
              <ul className="space-y-2 font-body-sm text-xs text-stone-600 dark:text-stone-400">
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/gujarat">{t('buyer.footer.patanPatola', 'Patan Patola (Gujarat)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/gujarat">{t('buyer.footer.ajrakhPrint', 'Ajrakh Block Print (Kutch)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/maharashtra">{t('buyer.footer.paithaniSilks', 'Paithani Silks (Maharashtra)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/rajasthan">{t('buyer.footer.kotaDoria', 'Kota Doria (Rajasthan)')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-md text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100 mb-3.5">
                {t('buyer.footer.southernHeirlooms', 'Southern Heirlooms')}
              </h4>
              <ul className="space-y-2 font-body-sm text-xs text-stone-600 dark:text-stone-400">
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/tamil-nadu">{t('buyer.footer.kanchipuramSilk', 'Kanchipuram Silk (Tamil Nadu)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/telangana">{t('buyer.footer.pochampallyIkat', 'Pochampally Ikat (Telangana)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/kerala">{t('buyer.footer.balaramapuram', 'Balaramapuram (Kerala)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/karnataka">{t('buyer.footer.mysoreCrepe', 'Mysore Crepe (Karnataka)')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-md text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100 mb-3.5">
                {t('buyer.footer.easternLooms', 'Eastern Looms')}
              </h4>
              <ul className="space-y-2 font-body-sm text-xs text-stone-600 dark:text-stone-400">
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/west-bengal">{t('buyer.footer.jamdaniBaluchari', 'Jamdani & Baluchari (Bengal)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/assam">{t('buyer.footer.mugaEriSilk', 'Muga & Eri Silk (Assam)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/odisha">{t('buyer.footer.sambalpuriIkat', 'Sambalpuri Ikat (Odisha)')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/explore/bihar">{t('buyer.footer.bhagalpuriTussar', 'Bhagalpuri Tussar (Bihar)')}</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h4 className="font-label-md text-xs uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100 mb-3.5">
                {t('buyer.footer.patronServices', 'Patron Services')}
              </h4>
              <ul className="space-y-2 font-body-sm text-xs text-stone-600 dark:text-stone-400">
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/buyer/certificates">{t('buyer.footer.provenanceVerification', 'Provenance Verification')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/about">{t('buyer.footer.fairTrade', 'Artisan Direct Fair Trade')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/contact">{t('buyer.footer.institutionalInquiries', 'Institutional Inquiries')}</Link></li>
                <li><Link className="hover:text-[#14532D] dark:hover:text-emerald-400 transition-colors" to="/buyer/wallet">{t('buyer.footer.restorationFund', 'Cluster Restoration Fund')}</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 dark:text-stone-400 font-label-sm text-xs tracking-wider">
            <div>
              © {toLocaleDigits(2026, i18n.language)} KARIGAR Artisanal Heritage Platform. {t('buyer.footer.allRightsReserved', 'All rights reserved under National Handloom Archives.')}
            </div>
            <div className="flex gap-6">
              <Link className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors" to="/buyer/certificates">{t('buyer.footer.compliance', 'GI Compliance')}</Link>
              <Link className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors" to="/about">{t('buyer.footer.artisanRights', 'Artisan Rights')}</Link>
              <Link className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors" to="/contact">{t('buyer.footer.privacy', 'Privacy Gazette')}</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const quickLinks = [
    { name: t('common.all') === 'All' ? 'Home' : t('nav.dashboard'), path: '/' },
    { name: t('nav.myProducts'), path: '/products' },
    { name: t('nav.customers'), path: '/customers' },
    { name: t('nav.aboutKarigar'), path: '/about' },
    { name: t('nav.verification'), path: '/verification' },
    { name: t('nav.getInTouch'), path: '/contact' },
  ];

  const artisanLinks = [
    { name: t('nav.addProduct'), path: '/add-product' },
    { name: t('nav.aboutKarigar'), path: '/about' },
    { name: t('nav.verification'), path: '/verification' },
    { name: t('nav.getInTouch'), path: '/contact' },
  ];

  const buyerLinks = [
    { name: t('about.title'), path: '/about' },
    { name: t('nav.orders'), path: '/orders' },
    { name: t('contact.title'), path: '/contact' },
  ];

  const legalLinks = [
    { name: t('footer.privacyPolicy', 'Privacy Policy'), path: '#' },
    { name: t('footer.termsConditions', 'Terms & Conditions'), path: '#' },
    { name: t('footer.cookiePolicy', 'Cookie Policy'), path: '#' },
  ];

  return (
    <footer
      className={`relative bg-[#063C32] text-[#F3F4F6] overflow-hidden ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 10% 20%, rgba(20, 83, 45, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(234, 88, 12, 0.15) 0%, transparent 40%)`
      }}
    >
      {/* Subtle traditional Indian geometric fretwork border overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FFF 0, #FFF 1px, transparent 0, transparent 20px)`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pb-12">
          {/* Column 1: Brand, Tagline, Description, Socials */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div>
              <Logo clickable linkTo={variant === 'seller' ? '/seller/dashboard' : '/patron'} imgClassName="h-14 sm:h-16 w-auto" />
              <h3 className="text-amber-300/90 font-serif font-semibold text-sm mt-3 tracking-wide">
                {t('footer.tagline')}
              </h3>
              <p className="text-emerald-100/75 text-xs mt-2 leading-relaxed max-w-xs">
                {t('footer.description')}
              </p>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition-all hover:scale-105"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition-all hover:scale-105"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition-all hover:scale-105"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition-all hover:scale-105"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-emerald-800/80 pb-1.5 inline-block">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="hover:text-amber-300 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="text-emerald-500 group-hover:text-amber-300 transition-colors">›</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Artisans */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-emerald-800/80 pb-1.5 inline-block">
              {t('footer.artisanCorner')}
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              {artisanLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="hover:text-amber-300 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="text-emerald-500 group-hover:text-amber-300 transition-colors">›</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: For Buyers */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-emerald-800/80 pb-1.5 inline-block">
              {t('footer.buyerGuide')}
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              {buyerLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="hover:text-amber-300 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="text-emerald-500 group-hover:text-amber-300 transition-colors">›</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-emerald-800/80 pb-1.5 inline-block">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              {legalLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="hover:text-amber-300 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="text-emerald-500 group-hover:text-amber-300 transition-colors">›</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200/70">
          <p>© {toLocaleDigits(2026, i18n.language)} Karigar. {t('footer.allRightsReserved')}</p>
          <p className="flex items-center gap-1.5 text-emerald-100/90 font-medium">
            <span>{t('footer.madeWithLove')}</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            <span>🇮🇳</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

