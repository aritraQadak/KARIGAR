import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Palette, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STATE_STORIES, stateArtwork } from "../data/heritage";
import { useArtisanDirectory } from "../hooks/useArtisanDirectory";
export default function HeritageHero({ state, products = [] }) {
  const { t } = useTranslation();
  const { artisans } = useArtisanDirectory();
  const sellers = artisans.filter((a) => a.stateSlug === state.slug);
  const [headline, quote] = STATE_STORIES[state.slug] || [
    state.name,
    state.description,
  ];
  const artwork = stateArtwork(state.slug);
  const spotlight = products[0];
  const metrics = [
    [
      Palette,
      t("buyer.premium.availableCrafts", "Available pieces"),
      products.length,
    ],
    [Users, t("buyer.premium.artisans", "Artisans"), sellers.length],
    [
      MapPin,
      t("buyer.premium.listedDistricts", "Listed districts"),
      new Set(
        sellers.map((a) => a.district?.trim().toLowerCase()).filter(Boolean),
      ).size,
    ],
  ];
  return (
    <section
      className={`heritage-hero ${artwork ? "heritage-illustrated" : "heritage-unillustrated"}`}
      style={artwork ? { "--heritage-image": `url("${artwork}")` } : undefined}
    >
      <div className="heritage-copy">
        <div className="heritage-heading">
          <p className="heritage-eyebrow">
            {state.name} ·{" "}
            {state.crafts
              .slice(0, 2)
              .map((c) => c.category)
              .join(" & ")}
          </p>
          <h1>{state.name}</h1>
          <p className="heritage-subtitle">
            {t(`buyer.premium.states.${state.slug}.headline`, headline)}
          </p>
        </div>
        <p className="heritage-description">{state.description}</p>
        <div className="heritage-metrics">
          {metrics.map(([Icon, label, count]) => (
            <div className="heritage-metric" key={label}>
              <Icon size={23} strokeWidth={1.5} />
              <div>
                <span>{label}</span>
                <strong>{count}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="heritage-actions">
          <a className="heritage-button" href="#craft-collection">
            {t("buyer.stateExplore.exploreCollections", "Explore Collections")}
            <ArrowRight size={18} />
          </a>
          <a
            className="heritage-button heritage-button-outline"
            href="#craft-collection"
          >
            {t("buyer.premium.viewDetails", "Discover the collection")}
          </a>
        </div>
        <p className="heritage-quote">
          “{t(`buyer.premium.states.${state.slug}.quote`, quote)}”
          <span>— ◇ —</span>
        </p>
      </div>
      {spotlight && (
        <Link className="heritage-spotlight" to={`/product/${spotlight.id}`}>
          <span>
            {t(
              "buyer.stateExplore.masterpieceSpotlight",
              "Masterpiece Spotlight",
            )}
          </span>
          <h2>{spotlight.name}</h2>
          <p>
            {spotlight.craftLineage} · {spotlight.artisanName}
          </p>
          <ArrowRight size={22} />
        </Link>
      )}
    </section>
  );
}
