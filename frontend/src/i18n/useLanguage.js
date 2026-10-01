import { createContext, useContext } from "react";

export const LanguageContext = createContext(null);

export const LANGUAGES = {
    en: { code: "en", label: "English", short: "EN" },
    am: { code: "am", label: "Amharic", short: "አማ" }
};

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error(
            "useLanguage must be used inside a LanguageProvider"
        );
    }

    return context;
}
