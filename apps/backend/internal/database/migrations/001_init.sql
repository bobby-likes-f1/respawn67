-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    release_date DATE,
    cover_image_url TEXT,
    spotlight_image_url TEXT,
    developer TEXT,
    publisher TEXT,
    genres TEXT,
    platforms TEXT, -- Stored as JSON array
    average_rating REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    igdb_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    profile_picture_url TEXT,
    location TEXT,
    favorite_genres TEXT,
    is_verified BOOLEAN DEFAULT 0,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample games
INSERT OR IGNORE INTO games (title, description, release_date, developer, publisher, genres, platforms, average_rating, total_reviews) VALUES
    ('No Man''s Sky', 'An exploration survival game set in an infinite procedurally generated universe', '2016-08-09', 'Hello Games', 'Hello Games', 'Adventure, Survival', '["PC", "PS5", "Xbox", "Switch"]', 4.2, 1500),
    ('Cyberpunk 2077', 'An open-world action-adventure RPG set in Night City', '2020-12-10', 'CD PROJEKT RED', 'CD PROJEKT RED', 'RPG, Action', '["PC", "PS5", "Xbox"]', 3.8, 2300),
    ('HELLDIVERS 2', 'A co-op third-person shooter defending Super Earth', '2024-02-08', 'Arrowhead Game Studios', 'Sony Interactive Entertainment', 'Shooter, Co-op', '["PC", "PS5"]', 4.5, 980);

-- Insert sample users
-- Note: Password for all users is "password123" (hashed with bcrypt)
INSERT OR IGNORE INTO users (username, email, password_hash, display_name, bio, favorite_genres, is_verified, is_admin) VALUES
    ('alice_gamer', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alice Cooper', 'Indie game enthusiast and speedrunner', 'Indie, Platformer, Roguelike', 1, 0),
    ('bob_reviews', 'bob@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bob Johnson', 'RPG lover, 500+ games completed', 'RPG, Action, Adventure', 1, 0),
    ('admin', 'admin@respawn.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'Site administrator', 'All genres', 1, 1);