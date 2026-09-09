import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  ChevronDown,
  User,
  Package,
  Bookmark,
  Wallet,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import StateSelectorDropdown from "./StateSelectorDropdown";
import { useBuyer } from "../context/BuyerContext";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/formatters";
export default function BuyerHeader() {
  const { pathname } = useLocation();
  const isHome = ["/patron", "/patron/dashboard", "/user", "/marketplace"].includes(pathname);
  const homeSection = id => isHome ? `#${id}` : `/${id}`;
  const [activeSection, setActiveSection] = useState("home");
  const header = useRef(null);
  useEffect(() => {
    if (!isHome) return;
    let frame;
    const update = () => {
      const threshold = (header.current?.offsetHeight || 94) + 32;
      let active = "home";
      for (const id of ["collections", "artisans"]) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= threshold) active = id;
      }
      setActiveSection(active);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [isHome, pathname]);
  const navProps = section => {
    const active = isHome ? activeSection === section : pathname === `/${section}`;
    return { className: active ? "active" : undefined, "aria-current": active ? (isHome ? "location" : "page") : undefined };
  };
  const { t } = useTranslation();
  const { cartItemCount } = useBuyer();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false),
    [mobile, setMobile] = useState(false);
  const menu = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (!menu.current?.contains(e.target)) setOpen(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobile(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const links = [
    ["/buyer/profile", User, t("buyer.user.myProfile", "My profile")],
    ["/buyer/orders", Package, t("buyer.premium.orders", "Orders")],
    ["/buyer/saved", Bookmark, t("buyer.premium.saved", "Saved crafts")],
    [
      "/buyer/certificates",
      Award,
      t("buyer.premium.certificates", "Certificates"),
    ],
    ["/buyer/wallet", Wallet, t("buyer.premium.wallet", "Wallet")],
    ["/buyer/settings", Settings, t("buyer.premium.settings", "Settings")],
  ];
  return (
    <header ref={header} className="buyer-header">
      <div className="buyer-header-inner">
        <Logo
          className="buyer-brand"
          imgClassName="buyer-logo"
          linkTo="/patron"
        />
        <nav className="buyer-desktop-nav" aria-label="Main navigation">
          <Link to={isHome ? pathname : "/patron"} {...navProps("home")}>
            {t("buyer.stateExplore.homeNav", "Home")}
          </Link>
          <Link to={homeSection("collections")} {...navProps("collections")}>
            {t("buyer.premium.collections", "Collections")}
          </Link>
          <Link to={homeSection("artisans")} {...navProps("artisans")}>
            {t("buyer.premium.artisans", "Artisans")}
          </Link>
          <NavLink to="/about">{t("buyer.heritage.about", "About")}</NavLink>
          <StateSelectorDropdown className="buyer-state-selector" />
        </nav>
        <div className="buyer-header-actions">
          <Link
            className="buyer-icon-button cart-action"
            to="/cart"
            aria-label={`${t("buyer.nav.cart", "Cart")}: ${cartItemCount}`}
          >
            <ShoppingBag size={21} />
            {cartItemCount > 0 && <span>{cartItemCount}</span>}
          </Link>
          <div ref={menu} className="buyer-account">
            <button
              ref={trigger}
              className="account-trigger"
              type="button"
              aria-label={t("buyer.premium.accountMenu", "Account menu")}
              aria-expanded={open}
              aria-controls="buyer-account-panel"
              onClick={() => setOpen(!open)}
            >
              <span className="account-avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  getInitials(user?.fullName)
                )}
              </span>
              <ChevronDown size={15} />
            </button>
            {open && (
              <div className="account-panel" id="buyer-account-panel">
                <div className="account-greeting">
                  <small>{t("buyer.premium.welcome", "Welcome back")}</small>
                  <strong>{user?.fullName}</strong>
                </div>
                {links.map(([to, Icon, label]) => (
                  <Link key={to} to={to} onClick={() => setOpen(false)}>
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/login");
                  }}
                >
                  <LogOut size={18} />
                  {t("buyer.user.signOut", "Sign out")}
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="buyer-menu-toggle buyer-icon-button"
            aria-label="Toggle navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobile && (
        <nav className="buyer-mobile-panel" aria-label="Mobile navigation">
          <Link onClick={() => setMobile(false)} to={isHome ? pathname : "/patron"} {...navProps("home")}>
            {t("buyer.stateExplore.homeNav", "Home")}
          </Link>
          <Link onClick={() => setMobile(false)} to={homeSection("collections")} {...navProps("collections")}>
            {t("buyer.premium.collections", "Collections")}
          </Link>
          <Link onClick={() => setMobile(false)} to={homeSection("artisans")} {...navProps("artisans")}>
            {t("buyer.premium.artisans", "Artisans")}
          </Link>
          <NavLink onClick={() => setMobile(false)} to="/about">{t("buyer.heritage.about", "About")}</NavLink>
          <Link onClick={() => setMobile(false)} to="/buyer/settings">
            {t("buyer.premium.settings", "Settings")}
          </Link>
          <StateSelectorDropdown className="buyer-state-selector" />
        </nav>
      )}
    </header>
  );
}
