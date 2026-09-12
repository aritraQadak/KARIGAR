import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { toLocaleDigits } from "../utils/formatters";

export default function BuyerFooter() {
  const { t, i18n } = useTranslation();
  return (
    <footer className="buyer-footer">
      <div>
        <Logo linkTo="/patron" imgClassName="h-14 w-auto" />
        <p>
          {t("buyer.premium.footerLine", "Made by hand. Chosen with care.")}
        </p>
      </div>
      <nav aria-label="Footer">
        <Link to="/patron">
          {t("buyer.premium.collections", "Collections")}
        </Link>
        <Link to="/buyer/orders">{t("buyer.premium.orders", "Orders")}</Link>
        <Link to="/buyer/settings">
          {t("buyer.premium.settings", "Settings")}
        </Link>
        <Link to="/contact">{t("buyer.premium.help", "Help & contact")}</Link>
      </nav>
      <small>© {toLocaleDigits(new Date().getFullYear(), i18n.language)} KARIGAR</small>
    </footer>
  );
}
