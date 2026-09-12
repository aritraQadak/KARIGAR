import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Check, ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBuyer } from "../context/BuyerContext";
import { formatCurrency } from "../utils/formatters";
import { getCraftImage } from "../constants/craftImageMap.js";
export default function CraftCard({ product }) {
  const { t, i18n } = useTranslation();
  const { addToCart, isSaved, toggleSaveItem, cart } = useBuyer();
  const [failed, setFailed] = useState(false);
  const added = cart.some((item) => item.product.id === product.id);
  return (
    <article className="craft-card">
      <div className="craft-card-image">
        <Link to={`/product/${product.id}`} aria-label={product.name}>
          {failed ? (
            <span className="craft-image-fallback">
              <ImageOff size={30} />
              {product.craftLineage}
            </span>
          ) : (
            <img
              src={encodeURI(product.images?.[0] || getCraftImage(product.craftType || product.craftLineage))}
              alt={product.name}
              loading="lazy"
              onError={() => setFailed(true)}
            />
          )}
        </Link>
        <button
          type="button"
          className="save-craft"
          aria-label={`${isSaved(product.id) ? t("buyer.premium.unsave", "Unsave") : t("buyer.premium.save", "Save")} ${product.name}`}
          aria-pressed={isSaved(product.id)}
          onClick={() => toggleSaveItem(product.id)}
        >
          <Heart
            size={19}
            fill={isSaved(product.id) ? "currentColor" : "none"}
          />
        </button>
        <span className="craft-region">{product.stateName}</span>
      </div>
      <div className="craft-card-body">
        <span className="eyebrow">{product.craftLineage}</span>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p>{product.artisanName}</p>
        <p className="craft-card-story">{product.description}</p>
        <div className="craft-card-bottom">
          <strong>{formatCurrency(product.price, i18n.language)}</strong>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            aria-label={`${t("buyer.premium.addToBag", "Add to bag")}: ${product.name}`}
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
