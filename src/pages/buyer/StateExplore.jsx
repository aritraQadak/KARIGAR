import { CRAFT_CATEGORIES,normalizeCraftCategory } from '../../constants/craftCategories.js';
import { artisanPortrait } from '../../data/demoImages';
import { getCraftImage } from '../../constants/craftImageMap.js';
import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStateBySlug } from "../../data/statesCrafts";
import { PRODUCTS } from "../../data/products";
import HeritageHero from "../../components/HeritageHero";
import CraftCard from "../../components/CraftCard";
import { useArtisanDirectory } from "../../hooks/useArtisanDirectory";
export default function StateExplore() {
  const { stateSlug } = useParams();
  return <StateCollection key={stateSlug} stateSlug={stateSlug} />;
}
function StateCollection({ stateSlug }) {
  const { t } = useTranslation(),
    { artisans } = useArtisanDirectory();
  const state = getStateBySlug(stateSlug);
  const products = PRODUCTS.filter((p) => p.stateSlug === state?.slug);
  const sellers = artisans.filter((a) => a.stateSlug === state?.slug);
  const [craft, setCraft] = useState("all"),
    [district, setDistrict] = useState("all"),
    [sort, setSort] = useState("featured"),
    [awardOnly, setAwardOnly] = useState(false),
    [budget, setBudget] = useState("");
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (craft === "all" || normalizeCraftCategory(p.craftCategory) === craft) &&
            (district === "all" || p.district === district) &&
            (!awardOnly || /award/i.test(p.artisanTitle)) &&
            (!budget || p.price <= Number(budget)),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.price - b.price
            : sort === "high"
              ? b.price - a.price
              : sort === "share"
                ? b.artisanSharePercent - a.artisanSharePercent
                : b.rating - a.rating,
        ),
    [products, craft, district, sort, awardOnly, budget],
  );
  const reset = () => {
    setCraft("all");
    setDistrict("all");
    setSort("featured");
    setAwardOnly(false);
    setBudget("");
  };
  if (!state)
    return (
      <section className="premium-section premium-empty">
        <h1>{t("buyer.premium.stateNotFound", "State not found")}</h1>
        <Link to="/patron">
          {t("buyer.premium.allStates", "Explore all states")}
        </Link>
      </section>
    );
  return (
    <div className="premium-state">
      <nav className="premium-breadcrumb" aria-label="Breadcrumb">
        <Link to="/patron">{t("buyer.stateExplore.homeNav", "Home")}</Link>
        <span>/</span>
        <Link to="/patron">
          {t("buyer.stateExplore.statesOfHeritage", "States of Heritage")}
        </Link>
        <span>/</span>
        <span aria-current="page">{state.name}</span>
      </nav>
      <HeritageHero state={state} products={products} />
      <section className="premium-section" id="craft-collection">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {state.name} · {t("buyer.premium.collections", "Collections")}
            </span>
            <h2>
              {t(
                "buyer.premium.craftedHere",
                "Crafted here, cherished everywhere",
              )}
            </h2>
          </div>
          <p aria-live="polite">
            {filtered.length}{" "}
            {t("buyer.premium.availableCrafts", "available pieces")}
          </p>
        </div>
        {products.length > 0 ? (
          <>
            <div className="collection-toolbar">
              <label>
                {t("buyer.premium.craft", "Craft")}
                <select
                  value={craft}
                  onChange={(e) => setCraft(e.target.value)}
                >
                  <option value="all">
                    {t("buyer.premium.allCrafts", "All crafts")}
                  </option>
                  {CRAFT_CATEGORIES.map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                {t("buyer.premium.district", "District")}
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="all">
                    {t("buyer.premium.allDistricts", "All districts")}
                  </option>
                  {[
                    ...new Set(products.map((p) => p.district).filter(Boolean)),
                  ].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                {t("buyer.premium.budget", "Maximum price (₹)")}
                <input
                  type="number"
                  min="0"
                  value={budget}
                  placeholder={t("buyer.premium.anyPrice", "Any price")}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </label>
              <label>
                {t("buyer.premium.sort", "Sort by")}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">
                    {t("buyer.premium.topRated", "Top rated")}
                  </option>
                  <option value="low">
                    {t("buyer.stateExplore.sortPriceAsc", "Price: Low to High")}
                  </option>
                  <option value="high">
                    {t(
                      "buyer.stateExplore.sortPriceDesc",
                      "Price: High to Low",
                    )}
                  </option>
                  <option value="share">
                    {t(
                      "buyer.stateExplore.sortWage",
                      "Fair Wage Share: High to Low",
                    )}
                  </option>
                </select>
              </label>
              <label className="award-filter">
                <input
                  type="checkbox"
                  checked={awardOnly}
                  onChange={(e) => setAwardOnly(e.target.checked)}
                />
                {t("buyer.premium.awardWinners", "Award-winning makers")}
              </label>
              <button type="button" className="text-action" onClick={reset}>
                {t("buyer.premium.resetFilters", "Reset filters")}
              </button>
            </div>
            <div
              className={`craft-grid ${filtered.length < 3 ? "craft-grid-small" : ""}`}
            >
              {filtered.map((p) => (
                <CraftCard key={p.id} product={p} />
              ))}
            </div>
            {!filtered.length && (
              <div className="premium-empty">
                <h3>{t("buyer.premium.noCrafts", "No crafts found")}</h3>
                <button type="button" className="text-action" onClick={reset}>
                  {t("buyer.premium.resetFilters", "Reset filters")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="premium-empty">
            <h3>
              {t(
                "buyer.premium.collectionGrowing",
                "This collection is still growing",
              )}
            </h3>
            <p>
              {t(
                "buyer.premium.noStateListings",
                "There are no products listed from this state yet. Explore its craft traditions below, or discover another region.",
              )}
            </p>
            <Link className="heritage-button" to="/patron">
              {t("buyer.premium.browseCollections", "Browse collections")} →
            </Link>
          </div>
        )}
      </section>
      {sellers.length > 0 && (
        <section className="premium-section" id="artisans">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{state.name}</span>
              <h2>{t("buyer.premium.meetMakers", "Meet the makers")}</h2>
            </div>
            <a className="text-action" href="#craft-collection">
              {t("buyer.premium.browseCollections", "Browse collections")} →
            </a>
          </div>
          <div className="maker-grid">
            {sellers.map((a) => (
              <article key={a.id} className="maker-card">
                <img
                  className="maker-demo-portrait"
                  src={encodeURI(getCraftImage(a.craftType))}
                  alt={a.craftType || "Artisan craft"}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/demo_image/default.jpg";
                  }}
                />
                <div>
                  <small>{a.district || a.state}</small>
                  <h3>{a.name}</h3>
                  <p>{a.craftType}</p>
                  {a.products[0] && (
                    <Link to={`/product/${a.products[0].id}`}>
                      {t("buyer.premium.viewCraft", "View craft")} →
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="premium-section tradition-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("buyer.premium.localTraditions", "Local traditions")}
            </span>
            <h2>
              {t("buyer.premium.craftVocabulary", "A vocabulary of craft")}
            </h2>
          </div>
        </div>
        <div className="tradition-grid">
          {state.crafts.map((c, i) => (
            <article key={c.category}>
              <span className="tradition-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{c.category}</h3>
              <p>{c.items.join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
