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
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample games
INSERT INTO games (title, description, release_date, developer, publisher, genres, platforms, average_rating, total_reviews) VALUES
    ('No Man''s Sky', 'An exploration survival game set in an infinite procedurally generated universe', '2016-08-09', 'Hello Games', 'Hello Games', 'Adventure, Survival', '["PC", "PS5", "Xbox", "Switch"]', 4.2, 1500),
    ('Cyberpunk 2077', 'An open-world action-adventure RPG set in Night City', '2020-12-10', 'CD PROJEKT RED', 'CD PROJEKT RED', 'RPG, Action', '["PC", "PS5", "Xbox"]', 3.8, 2300),
    ('HELLDIVERS 2', 'A co-op third-person shooter defending Super Earth', '2024-02-08', 'Arrowhead Game Studios', 'Sony Interactive Entertainment', 'Shooter, Co-op', '["PC", "PS5"]', 4.5, 980);
