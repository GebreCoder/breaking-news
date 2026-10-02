import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/useLanguage.js";

function BreakingBar({ items = [] }) {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const nextChange = items.reduce((nearest, item) => {
      const boundaries = [item.starts_at, item.ends_at]
        .filter(Boolean)
        .map((value) => new Date(value).getTime())
        .filter((time) => Number.isFinite(time) && time > now);

      return boundaries.reduce(
        (currentNearest, time) => Math.min(currentNearest, time),
        nearest,
      );
    }, Number.POSITIVE_INFINITY);

    if (!Number.isFinite(nextChange)) {
      return undefined;
    }

    const timeout = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(nextChange - now + 50, 2147483647),
    );

    return () => window.clearTimeout(timeout);
  }, [items, now]);

  const activeItems = items.filter((item) => {
    if (!item.headline?.trim()) {
      return false;
    }

    const startsAt = item.starts_at
      ? new Date(item.starts_at).getTime()
      : Number.NEGATIVE_INFINITY;
    const endsAt = item.ends_at
      ? new Date(item.ends_at).getTime()
      : Number.POSITIVE_INFINITY;

    return startsAt <= now && now < endsAt;
  });

  if (activeItems.length === 0) {
    return null;
  }

  const estimatedWidth = activeItems.reduce(
    (width, item) => width + item.headline.length * 8 + 48,
    0,
  );
  const travelWidth = Math.max(
    estimatedWidth,
    Math.min(window.innerWidth, 1380),
  );
  const duration = Math.min(120, Math.max(8, travelWidth / 42));

  return (
    <div
      className="breaking-bar"
      role="region"
      aria-label={t("breaking.label")}
    >
      <div className="breaking-container">
        <div className="breaking-label" aria-hidden="true">
          {t("breaking.label")}
        </div>

        <div className="breaking-text">
          <div
            className="breaking-track"
            style={{ "--breaking-duration": `${duration}s` }}
          >
            {[0, 1].map((copyIndex) => (
              <div
                className="breaking-sequence"
                key={copyIndex}
                aria-hidden={copyIndex === 1}
              >
                {activeItems.map((item, itemIndex) => (
                  <span
                    className="breaking-ticker-item"
                    key={`${copyIndex}-${item.breaking_news_id ?? itemIndex}`}
                  >
                    {item.news_slug ? (
                      <Link
                        className="breaking-headline"
                        to={`/news/${item.news_slug}`}
                        tabIndex={copyIndex === 1 ? -1 : undefined}
                      >
                        {item.headline}
                      </Link>
                    ) : (
                      <span className="breaking-headline">{item.headline}</span>
                    )}
                    <span className="breaking-separator" aria-hidden="true">
                      •
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreakingBar;
