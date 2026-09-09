import { useTheme } from '../../context/ThemeContext';
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
export default function BuyerSettings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const [form, setForm] = useState({
      fullName: user?.fullName || "",
      mobile: user?.mobile || "",
      state: user?.state || "",
      district: user?.district || "",
    }),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateUserProfile(form);
      setMessage(t("buyer.premium.profileSaved", "Profile details saved."));
    } catch (err) {
      setError(
        err.message ||
          t(
            "buyer.premium.saveFailed",
            "Could not save your profile. Please try again.",
          ),
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="premium-section buyer-settings">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {t("buyer.premium.yourAccount", "Your account")}
          </span>
          <h1>{t("buyer.premium.settings", "Settings")}</h1>
        </div>
        <Link className="text-action" to="/buyer/profile">
          {t("buyer.user.myProfile", "My profile")} →
        </Link>
      </div>
      <div className="settings-grid">
        <section className="settings-card appearance-settings"><h2>{t("buyer.premium.appearance", "Appearance")}</h2><p>{t("buyer.premium.themeDescription", "Choose a light or dark look for your browsing experience.")}</p><div className="theme-options"><button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>{t('buyer.premium.lightTheme', 'Light')}</button><button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>{t('buyer.premium.darkTheme', 'Dark')}</button></div></section>
        <section className="settings-card">
          <h2>{t("buyer.premium.language", "Language")}</h2>
          <p>
            {t(
              "buyer.premium.languageDescription",
              "Choose the language you feel at home in.",
            )}
          </p>
          <fieldset className="language-options">
            <legend className="sr-only">
              {t("buyer.premium.language", "Language")}
            </legend>
            {[
              ["en", "English"],
              ["hi", "हिन्दी"],
              ["bn", "বাংলা"],
            ].map(([code, label]) => (
              <label key={code}>
                <input
                  type="radio"
                  name="language"
                  value={code}
                  checked={i18n.language.split("-")[0] === code}
                  onChange={async () => {
                    await i18n.changeLanguage(code);
                    try {
                      localStorage.setItem("karigar-language", code);
                    } catch {
                      /* Language remains active for this session. */
                    }
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
        </section>
        <section className="settings-card">
          <h2>{t("buyer.premium.profileDetails", "Profile details")}</h2>
          <form onSubmit={save}>
            <div className="settings-fields">
              {[
                ["fullName", t("buyer.premium.fullName", "Full name")],
                ["mobile", t("buyer.premium.mobile", "Mobile number")],
                ["state", t("buyer.premium.state", "State")],
                ["district", t("buyer.premium.district", "District")],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    name={key}
                    value={form[key]}
                    required={key === "fullName"}
                    type={key === "mobile" ? "tel" : "text"}
                    autoComplete={
                      key === "fullName"
                        ? "name"
                        : key === "mobile"
                          ? "tel"
                          : key === "state"
                            ? "address-level1"
                            : "address-level2"
                    }
                    maxLength={key === "mobile" ? 10 : 100}
                    pattern={key === "mobile" ? "[6-9][0-9]{9}" : undefined}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="form-success">
                {message}
              </p>
            )}
            <button className="heritage-button" type="submit" disabled={saving}>
              {saving
                ? t("buyer.premium.saving", "Saving…")
                : t("buyer.premium.saveChanges", "Save changes")}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
