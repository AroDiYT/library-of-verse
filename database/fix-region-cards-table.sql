-- Fix region_cards table structure

-- First backup existing data
CREATE TABLE region_cards_backup AS SELECT * FROM region_cards;

-- Drop the existing table
DROP TABLE region_cards;

-- Recreate with proper structure
CREATE TABLE region_cards (
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

-- Restore data with default values for new columns
INSERT INTO region_cards (
    id, novel_id, name, description, image_url, continent, sort_order, created_at, updated_at,
    theme_color, border_color, background_color, hover_color, icon, layout_style
)
SELECT 
    id, novel_id, name, description, image_url, continent, sort_order, created_at, updated_at,
    '#ef4444', 'border-gray-700', 'bg-gray-900', 'hover:border-red-700/50', '🏔️', 'vertical'
FROM region_cards_backup;

-- Drop backup table
DROP TABLE region_cards_backup;
