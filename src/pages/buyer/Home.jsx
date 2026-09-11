import { CRAFT_CATEGORIES,normalizeCraftCategory } from '../../constants/craftCategories.js';
import { artisanPortrait } from '../../data/demoImages';
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PRODUCTS } from "../../data/products";
import { STATES_CRAFTS } from "../../data/statesCrafts";
import { stateArtwork } from "../../data/heritage";
import { useArtisanDirectory } from "../../hooks/useArtisanDirectory";
import CraftCard from "../../components/CraftCard";
export default function Home() {
  const { t } = useTranslation();
  const { artisans } = useArtisanDirectory();
  const video = useRef(null);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [showAll, setShowAll] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (preference.matches) video.current?.pause();
      else video.current?.play().catch(() => {});
    };
    apply();
    preference.addEventListener("change", apply);
    return () => preference.removeEventListener("change", apply);
  }, []);
  const categories = CRAFT_CATEGORIES;
  const filtered = PRODUCTS.filter(
    (p) =>
      (category === "all" || normalizeCraftCategory(p.craftCategory) === category) &&
      `${p.name} ${p.artisanName} ${p.stateName} ${p.craftLineage}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const states = [...STATES_CRAFTS].sort(
    (a, b) => Number(!!stateArtwork(b.slug)) - Number(!!stateArtwork(a.slug)),
  );
  return (
    <div className="premium-home">
      <section className="home-film-hero">
        <video
          ref={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/hero-loop.mp4" type="video/mp4" />
        </video>
        <div className="home-film-scrim" />
        <div className="home-film-copy">
          <span className="eyebrow">{t('buyer.premium.heroEyebrow', 'Rooted in heritage. Made for your everyday.')}</span>
          <h1 className="home-hero-quote"><span>{t('buyer.premium.heroLead', 'Stories you can hold.')}</span><strong>{t('buyer.premium.heroEmphasis', 'Indian, handmade.')}</strong><em>{t('buyer.premium.heroClose', 'Treasures you can call your own.')}</em></h1>
          <p className="home-film-description">
            {t(
              "buyer.home.heroSubtitle",
              "Direct from India’s master craftspeople to your sanctuary.",
            )}
          </p>
          <div className="heritage-actions">
            <a className="heritage-button" href="#clusters">
              {t("buyer.home.exploreClustersCta", "Explore Craft Clusters")}
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="home-film-stats">
            <span>
              <strong>{PRODUCTS.length}</strong>
              {t("buyer.premium.availableCrafts", "Available pieces")}
            </span>
            <span>
              <strong>{artisans.length}</strong>
              {t("buyer.premium.artisans", "Artisans")}
            </span>
            <span>
              <strong>{new Set(PRODUCTS.map((p) => p.stateSlug)).size}</strong>
              {t("buyer.premium.representedStates", "States with listings")}
            </span>
          </div>
        </div>
      </section>
      <section className="premium-section" id="clusters">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("buyer.stateExplore.statesOfHeritage", "States of Heritage")}
            </span>
            <h2>
              {t(
                "buyer.premium.discoverRegions",
                "A different story in every state",
              )}
            </h2>
          </div>
          <button
            type="button"
            className="text-action"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? t("buyer.premium.showLess", "Show less")
              : t("buyer.premium.allStates", "Explore all states")}
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="state-discovery-grid">
          {states.slice(0, showAll ? states.length : 6).map((state) => (
            <Link
              key={state.slug}
              className={`state-discovery-card ${stateArtwork(state.slug) ? "" : "state-no-art"}`}
              to={`/explore/${state.slug}`}
            >
              {stateArtwork(state.slug) && (
                <img
                  src={stateArtwork(state.slug)}
                  alt={`${state.name} craft illustration`}
                  loading="lazy"
                />
              )}
              <div>
                <span>{state.region}</span>
                <h3>{state.name}</h3>
                <p>
                  {PRODUCTS.filter((p) => p.stateSlug === state.slug).length}{" "}
                  {t("buyer.premium.availableCrafts", "available pieces")}
                </p>
              </div>
              <ArrowRight size={21} />
            </Link>
          ))}
        </div>
      </section>
      <section className="premium-section collection-section" id="collections">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("buyer.premium.chosenByHand", "A considered collection")}
            </span>
            <h2>
              {t(
                "buyer.premium.madeToKeep",
                "Made to keep, made to mean something",
              )}
            </h2>
          </div>
          <div className="collection-heading-actions">
          <Link className="text-action" to="/collections">{t("buyer.premium.browseCollections", "Browse collections")} <ArrowRight size={17} /></Link>
          <label className="collection-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "buyer.premium.searchCrafts",
                "Search crafts, makers, states",
              )}
              aria-label={t(
                "buyer.premium.searchCrafts",
                "Search crafts, makers, states",
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label></div>
        </div>
        <div className="craft-filters">
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            {t("buyer.premium.allCrafts", "All crafts")}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="craft-grid">
          {filtered.map((p) => (
            <CraftCard key={p.id} product={p} />
          ))}
        </div>
        {!filtered.length && (
          <div className="premium-empty">
            <h3>{t("buyer.premium.noCrafts", "No crafts found")}</h3>
            <button
              type="button"
              className="text-action"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              {t("buyer.premium.resetFilters", "Reset filters")}
            </button>
          </div>
        )}
      </section>
      <section className="premium-section" id="artisans">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("buyer.premium.behindCraft", "The hands behind the craft")}
            </span>
            <h2>{t("buyer.premium.meetMakers", "Meet the makers")}</h2>
          </div>
          <Link className="text-action" to="/artisans">
            {t("buyer.premium.browseArtisans", "Browse artisans")}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="maker-grid">
          {artisans.slice(0, 8).map((a) => (
            <article key={a.id} className="maker-card">
              <img className="maker-demo-portrait" src={artisanPortrait(a)} alt="Artisan demo portrait" loading="lazy" />
              <div>
                <small>{a.state}</small>
                <h3>{a.name}</h3>
                <p>{a.craftType}</p>
                {a.products[0] ? (
                  <Link to={`/product/${a.products[0].id}`}>
                    {t("buyer.premium.viewCraft", "View craft")} →
                  </Link>
                ) : (
                  <Link to={`/explore/${a.stateSlug}`}>
                    {t("buyer.premium.viewRegion", "Explore their art")} →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
