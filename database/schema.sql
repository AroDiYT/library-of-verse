-- Database schema for Forged Pacts novel website

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'reader', -- 'admin', 'writer', 'reader'
    pen_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novel_id INTEGER DEFAULT 1, -- Link to novels table
    title TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    word_count INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novel_id INTEGER DEFAULT 1, -- Link to novels table
    name TEXT NOT NULL,
    description TEXT,
    bio TEXT, -- Full biography/backstory
    role_type TEXT NOT NULL DEFAULT 'Side', -- 'MC', 'Antagonist', 'Side', 'Supporting'
    character_type TEXT NOT NULL DEFAULT 'human', -- 'demon', 'fae', 'human', 'hybrid', 'other'
    age TEXT,
    occupation TEXT,
    location TEXT,
    personality_traits TEXT, -- JSON or comma-separated
    abilities TEXT, -- Special abilities or powers
    relationships TEXT, -- Relationships to other characters
    appearance TEXT, -- Physical description
    backstory TEXT, -- Character history
    motivation TEXT, -- What drives the character
    theme_color TEXT DEFAULT '#ef4444', -- Hex color for character theme
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    chapter_id INTEGER NOT NULL,
    progress_percentage REAL DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE,
    UNIQUE(user_id, chapter_id)
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Suggestions table for feature requests
CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Feature',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'implemented', 'rejected'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    user_id INTEGER NOT NULL,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Suggestion votes table
CREATE TABLE IF NOT EXISTS suggestion_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(suggestion_id, user_id)
);

-- Content sections table for editable site content
CREATE TABLE IF NOT EXISTS content_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novel_id INTEGER DEFAULT 1, -- Link to novels table (1 for site-wide content)
    section_key TEXT NOT NULL, -- e.g., 'about_intro', 'world_overview', 'region_1'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'markdown', -- 'markdown', 'html', 'text'
    section_type TEXT NOT NULL, -- 'about', 'world', 'region', 'home', 'other'
    is_published BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    metadata TEXT, -- JSON for additional data like images, links, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE,
    UNIQUE(novel_id, section_key) -- Allow same section keys for different novels
);

-- Novels table for managing multiple novels
CREATE TABLE IF NOT EXISTS novels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly version of title
    description TEXT,
    cover_image_url TEXT,
    genre TEXT DEFAULT 'Dark Fantasy',
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'hiatus', 'draft'
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Region cards table for world building
CREATE TABLE IF NOT EXISTS region_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novel_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    continent TEXT,
    sort_order INTEGER DEFAULT 0,
    theme_color TEXT DEFAULT '#ef4444',
    border_color TEXT DEFAULT 'border-gray-700',
    background_color TEXT DEFAULT 'bg-gray-900',
    hover_color TEXT DEFAULT 'hover:border-red-700/50',
    icon TEXT DEFAULT '🏔️',
    layout_style TEXT DEFAULT 'vertical',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, username, is_admin) 
VALUES ('admin@forgedpacts.com', '$2b$10$rOzKqZLZF9h6VyD9ZgJB3.0vGv7Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4', 'admin', TRUE);

-- Insert default novel
INSERT OR IGNORE INTO novels (id, title, slug, description, genre, status, is_featured, sort_order)
VALUES (1, 'Forged Pacts', 'forged-pacts', 'A dark fantasy epic where ancient agreements between demons, fae, and humans begin to crumble, forcing unlikely alliances in a world of shadow and flame.', 'Dark Fantasy', 'active', TRUE, 1);
