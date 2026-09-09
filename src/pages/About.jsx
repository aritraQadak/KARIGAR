import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  Award,
  Users,
  TrendingUp,
  ShieldCheck,
  Quote
} from 'lucide-react';
import Footer from '../components/Footer';

export default function About() {
  const { t } = useTranslation();

  const values = [
    {
      id: 1,
      title: t('about.value1Title'),
      description: t('about.value1Desc'),
      icon: Award,
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
    },
    {
      id: 2,
      title: t('about.value2Title'),
      description: t('about.value2Desc'),
      icon: Users,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 3,
      title: t('about.value3Title'),
      description: t('about.value3Desc'),
      icon: TrendingUp,
      color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
    },
    {
      id: 4,
      title: t('about.value4Title'),
      description: t('about.value4Desc'),
      icon: ShieldCheck,
      color: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800'
    }
  ];

  return (
    <div className="about-page min-h-full flex flex-col justify-between -m-4 sm:-m-6 lg:-m-8">
      <div className="about-content p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-12">
        {/* Page Header Badge & Title */}
        <div className="about-heading text-center max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('about.missionTitle')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight text-gray-900 dark:text-white">
            {t('about.title')}
          </h1>

          <p className="mt-3 text-base sm:text-lg text-emerald-800 dark:text-emerald-400 font-medium max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Two-Column Hero Section */}
        <div className="about-story grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mission Description */}
          <div className="about-copy lg:col-span-6 space-y-5">
            <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />

            <div className="space-y-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                {t('about.missionDesc1')}
              </p>
              <p>
                {t('about.missionDesc2')}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#14532D] hover:bg-[#0f3f22] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>{t('contact.title')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Artisan Visual + Overlapping Quote Card */}
          <div className="lg:col-span-6 relative">
            {/* Main Artisan Visual */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-900/10 dark:border-gray-700 aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="/images/demo/about.png"
                alt="The craft and heritage of Karigar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Overlapping Warm Beige Quote Card */}
            <div className="sm:absolute -bottom-6 -left-6 max-w-sm w-full mt-4 sm:mt-0 p-5 rounded-2xl bg-[#F7EDE2] dark:bg-[#2B231B] border border-[#E9D5C3] dark:border-[#523F2F] shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex-shrink-0">
                  <Quote className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="font-serif italic font-medium text-gray-900 dark:text-amber-100 text-sm sm:text-base leading-snug">
                    {t('about.quote')}
                  </p>
                  <p className="text-[11px] text-amber-900/70 dark:text-amber-300/70 mt-1 font-semibold uppercase tracking-wider">
                    — {t('about.quoteAuthor')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Four Value Items */}
        <div className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white">
              {t('about.valuesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('about.value2Title')} • {t('about.value4Title')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border border-gray-200/80 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3.5"
                >
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${v.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      {v.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reusable Full Footer */}
      <Footer className="mt-16" />
    </div>
  );
}
