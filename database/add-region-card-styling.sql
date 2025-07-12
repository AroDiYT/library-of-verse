-- Add styling fields to region_cards table

-- First, let's create the region_cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS region_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novel_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    continent TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
);

-- Add new styling columns
ALTER TABLE region_cards ADD COLUMN theme_color TEXT DEFAULT '#ef4444';
ALTER TABLE region_cards ADD COLUMN border_color TEXT DEFAULT 'border-gray-700';
ALTER TABLE region_cards ADD COLUMN background_color TEXT DEFAULT 'bg-gray-900';
ALTER TABLE region_cards ADD COLUMN hover_color TEXT DEFAULT 'hover:border-red-700/50';
ALTER TABLE region_cards ADD COLUMN icon TEXT DEFAULT '🏔️';
ALTER TABLE region_cards ADD COLUMN layout_style TEXT DEFAULT 'vertical'; -- 'vertical', 'horizontal'
