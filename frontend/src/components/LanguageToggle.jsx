import { LANGUAGES, useLanguage } from "../i18n/useLanguage.js";

function LanguageToggle({ className = "" }) {
    const { language, toggleLanguage, t } = useLanguage();

    const isAmharic = language === "am";
    const otherLanguage = isAmharic
        ? LANGUAGES.en
        : LANGUAGES.am;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isAmharic}
            aria-label={`${t("language.switch")} — ${
                otherLanguage.label
            }`}
            title={`${t("language.switch")} — ${
                otherLanguage.label
            }`}
            onClick={toggleLanguage}
            className={`lang-toggle ${
                isAmharic ? "lang-toggle-am" : "lang-toggle-en"
            } ${className}`.trim()}
        >
            <span className="lang-toggle-thumb" aria-hidden="true" />

            <span
                lang="en"
                className={`lang-toggle-option ${
                    isAmharic ? "" : "is-active"
                }`.trim()}
            >
                {LANGUAGES.en.short}
            </span>

            <span
                lang="am"
                className={`lang-toggle-option ${
                    isAmharic ? "is-active" : ""
                }`.trim()}
            >
                {LANGUAGES.am.short}
            </span>
        </button>
    );
}

export default LanguageToggle;
