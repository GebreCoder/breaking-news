-- ============================================================
-- BREAKING NEWS DATABASE SCHEMA
-- PostgreSQL
-- ============================================================

-- ============================================================
-- 1. ADMINS
-- ============================================================

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. CATEGORIES
-- ============================================================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. NEWS
-- ============================================================

CREATE TABLE news (
    news_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    author_id INTEGER,
    
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(350) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    
    featured_image TEXT,
    image_caption TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_most_read BOOLEAN NOT NULL DEFAULT FALSE,
    
    published_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_news_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_news_author
        FOREIGN KEY (author_id)
        REFERENCES admins(admin_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_news_status
        CHECK (status IN ('draft', 'published', 'archived'))
);


-- ============================================================
-- 4. BREAKING NEWS
-- ============================================================

CREATE TABLE breaking_news (
    breaking_news_id SERIAL PRIMARY KEY,
    
    news_id INTEGER,
    
    headline VARCHAR(300) NOT NULL,
    link_url TEXT,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_breaking_news_article
        FOREIGN KEY (news_id)
        REFERENCES news(news_id)
        ON DELETE SET NULL
);


-- ============================================================
-- 5. MEDIA
-- ============================================================

CREATE TABLE media (
    media_id SERIAL PRIMARY KEY,
    
    uploaded_by INTEGER,
    
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    
    alt_text VARCHAR(255),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_media_admin
        FOREIGN KEY (uploaded_by)
        REFERENCES admins(admin_id)
        ON DELETE SET NULL
);


-- ============================================================
-- 6. SITE SETTINGS
-- ============================================================

CREATE TABLE site_settings (
    setting_id SERIAL PRIMARY KEY,
    
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_news_category
    ON news(category_id);

CREATE INDEX idx_news_status
    ON news(status);

CREATE INDEX idx_news_published_at
    ON news(published_at DESC);

CREATE INDEX idx_news_featured
    ON news(is_featured);

CREATE INDEX idx_breaking_news_active
    ON breaking_news(is_active);

CREATE INDEX idx_breaking_news_dates
    ON breaking_news(starts_at, ends_at);


-- ============================================================
-- INITIAL SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (setting_key, setting_value)
VALUES
    ('site_name', 'BREAKING NEWS'),
    ('site_description', 'Latest news and breaking stories'),
    ('contact_email', ''),
    ('logo_url', ''),
    ('facebook_url', ''),
    ('x_url', ''),
    ('telegram_url', '');