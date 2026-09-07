DROP TABLE IF EXISTS post_relations;
DROP TABLE IF EXISTS post_keywords;
DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS keywords;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS post_favorites;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS refresh_token;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255),
    profile_image VARCHAR(255),
    info VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'USER',
    created_at DATETIME,
    updated_at DATETIME,
    fail_count INT DEFAULT 0,
    locked_until DATETIME,
    terms_agreed BOOLEAN,
    privacy_agreed BOOLEAN,
    marketing_agreed BOOLEAN DEFAULT FALSE,
    agreed_at DATETIME
);

CREATE TABLE refresh_token (
    id BIGINT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expired_date DATETIME NOT NULL
);

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_categories_user_name
        UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id_id
    ON categories(user_id, id);

CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(255),
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(255),
    hits INT NOT NULL DEFAULT 0,
    likes INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_posts_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_posts_user_id
    ON posts(user_id);

CREATE INDEX idx_posts_category_id
    ON posts(category_id);

CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    CONSTRAINT fk_post_tags_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_post_tags_post
        FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_post_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE INDEX idx_post_tags_user_id_tag_id
    ON post_tags(user_id, tag_id);

CREATE INDEX idx_post_tags_post_id
    ON post_tags(post_id);

CREATE TABLE keywords (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    document_frequency INT NOT NULL DEFAULT 0
);

CREATE TABLE post_keywords (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    keyword_id BIGINT NOT NULL,
    title_count INT NOT NULL,
    content_count INT NOT NULL,
    tag_count INT NOT NULL,
    weight DOUBLE NOT NULL,
    CONSTRAINT fk_post_keywords_post
        FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_post_keywords_keyword
        FOREIGN KEY (keyword_id) REFERENCES keywords(id),
    CONSTRAINT uk_post_keywords_post_keyword
        UNIQUE (post_id, keyword_id)
);

CREATE INDEX idx_post_keywords_post_weight
    ON post_keywords(post_id, weight);

CREATE INDEX idx_post_keywords_keyword_weight
    ON post_keywords(keyword_id, weight);

CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_comments_post_id
    ON comments(post_id);

CREATE INDEX idx_comments_post_deleted_created_id
    ON comments(post_id, is_deleted, created_at, id);

CREATE TABLE post_relations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_post_id BIGINT NOT NULL,
    target_post_id BIGINT NOT NULL,
    score DOUBLE NOT NULL,
    shared_keywords VARCHAR(1000) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_post_relations_source_post
        FOREIGN KEY (source_post_id) REFERENCES posts(id),
    CONSTRAINT fk_post_relations_target_post
        FOREIGN KEY (target_post_id) REFERENCES posts(id),
    CONSTRAINT uk_post_relations_source_target
        UNIQUE (source_post_id, target_post_id)
);

CREATE INDEX idx_post_relations_source_score
    ON post_relations(source_post_id, score);

CREATE INDEX idx_post_relations_target
    ON post_relations(target_post_id);

CREATE TABLE post_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME,
    CONSTRAINT fk_post_likes_post
        FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_post_likes_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_post_likes_user_post
        UNIQUE (user_id, post_id)
);

CREATE INDEX idx_post_likes_post_id
    ON post_likes(post_id);

CREATE TABLE post_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME,
    CONSTRAINT fk_post_favorites_post
        FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_post_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_post_favorites_user_post
        UNIQUE (user_id, post_id)
);

CREATE INDEX idx_post_favorites_user_created
    ON post_favorites(user_id, created_at, id);
