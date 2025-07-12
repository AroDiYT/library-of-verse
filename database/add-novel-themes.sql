-- Add theme columns to novels table
ALTER TABLE novels ADD COLUMN theme_primary_color TEXT DEFAULT '#ef4444';
ALTER TABLE novels ADD COLUMN theme_secondary_color TEXT DEFAULT '#f97316';
ALTER TABLE novels ADD COLUMN theme_accent_color TEXT DEFAULT '#fbbf24';
ALTER TABLE novels ADD COLUMN theme_background_color TEXT DEFAULT '#0f172a';
ALTER TABLE novels ADD COLUMN theme_text_color TEXT DEFAULT '#f1f5f9';
ALTER TABLE novels ADD COLUMN author TEXT DEFAULT 'Verse';
