import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/useLanguage.js";

function BreakingBar({ items = [] }) {
    const { t } = useLanguage();

    if (items.length === 0) {
        return null;
    }

    const [active] = items;

    return (
        <div className="breaking-bar">
            <div className="breaking-container">

                <div className="breaking-label">
                    {t("breaking.label")}
                </div>

                <div className="breaking-text">
                    {active.news_slug ? (
                        <Link to={`/news/${active.news_slug}`}>
                            {active.headline}
                        </Link>
                    ) : (
                        <span>{active.headline}</span>
                    )}
                </div>

            </div>
        </div>
    );
}

export default BreakingBar;
