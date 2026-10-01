import { useCallback, useEffect, useMemo, useState } from "react";

import en from "./en.json";
import am from "./am.json";
import { LanguageContext } from "./useLanguage.js";

const STORAGE_KEY = "breakingNewsLanguage";

const DICTIONARIES = { en, am };

const DEFAULT_LANGUAGE = "en";

function readStoredLanguage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored && DICTIONARIES[stored]) {
            return stored;
        }
    } catch {
        // localStorage unavailable (private mode, blocked storage)
    }

    return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(readStoredLanguage);

    useEffect(() => {
        document.documentElement.lang = language;

        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch {
            // Ignore write failures, language still applies for this session
        }
    }, [language]);

    const setLanguage = useCallback((next) => {
        if (DICTIONARIES[next]) {
            setLanguageState(next);
        }
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguageState((current) =>
            current === "am" ? "en" : "am"
        );
    }, []);

    const t = useCallback(
        (key, values) => {
            const template =
                DICTIONARIES[language]?.[key] ??
                DICTIONARIES[DEFAULT_LANGUAGE][key] ??
                key;

            if (!values) {
                return template;
            }

            return template.replace(
                /\{(\w+)\}/g,
                (match, name) =>
                    name in values ? String(values[name]) : match
            );
        },
        [language]
    );

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            toggleLanguage,
            t,
            isAmharic: language === "am",
            locale: language === "am" ? "am-ET-u-nu-latn" : "en-US"
        }),
        [language, setLanguage, toggleLanguage, t]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}
