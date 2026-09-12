import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Check, ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBuyer } from "../context/BuyerContext";
import { formatCurrency } from "../utils/formatters";
import { getCraftImage } from "../constants/craftImageMap.js";
import {
  translateState,
  translateCraftType,
  translatePersonName,
  translateCollectionTitle,
  translateCollectionDescription
} from "../constants/culturalTranslations.js";

export default function CraftCard({ product }) {
  const { t, i18n } = useTranslation();
  const { addToCart, isSaved, toggleSaveItem, cart } = useBuyer();
  const [failed, setFailed] = useState(false);
  const added = cart.some((item) => item.product.id === product.id);
  const localizedCraft = translateCraftType(product.craftType || product.craftLineage, i18n.language);
  const localizedState = translateState(product.stateName || product.state, i18n.language);
  const localizedArtisan = translatePersonName(product.artisanName || product.artisan?.fullName, i18n.language);
  const localizedTitle = translateCollectionTitle(product.title || product.name, i18n.language);
  const localizedDescription = translateCollectionDescription(product.description, product, i18n.language);

  return (
    <article className="craft-card">
      <div className="craft-card-image">
        <Link to={`/product/${product.id}`} aria-label={localizedTitle}>
          {failed ? (
            <span className="craft-image-fallback">
              <ImageOff size={30} />
              {localizedCraft}
            </span>
          ) : (
            <img
              src={encodeURI(product.images?.[0] || getCraftImage(product.craftType || product.craftLineage))}
              alt={localizedTitle}
              loading="lazy"
              onError={() => setFailed(true)}
            />
          )}
        </Link>
        <button
          type="button"
          className="save-craft"
          aria-label={`${isSaved(product.id) ? t("buyer.premium.unsave", "Unsave") : t("buyer.premium.save", "Save")} ${localizedTitle}`}
          aria-pressed={isSaved(product.id)}
          onClick={() => toggleSaveItem(product.id)}
        >
          <Heart
            size={19}
            fill={isSaved(product.id) ? "currentColor" : "none"}
          />
        </button>
        <span className="craft-region">{localizedState}</span>
      </div>
      <div className="craft-card-body">
        <span className="eyebrow">{localizedCraft}</span>
        <h3>
          <Link to={`/product/${product.id}`}>{localizedTitle}</Link>
        </h3>
        <p>{localizedArtisan}</p>
        <p className="craft-card-story">{localizedDescription}</p>
        <div className="craft-card-bottom">
          <strong>{formatCurrency(product.price, i18n.language)}</strong>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            aria-label={`${t("buyer.premium.addToBag", "Add to bag")}: ${localizedTitle}`}
          >
            {added ? <Check size={18} /> : <Plus size={18} />}
            <span>
              {added
                ? t("buyer.premium.addAnother", "Add another")
                : t("buyer.premium.addToBag", "Add to bag")}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
