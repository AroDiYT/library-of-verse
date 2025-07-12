// Update existing novels with default theme values and author
const Database = require('better-sqlite3');
const db = new Database('./database/database.db');

console.log('Updating existing novels with theme and author defaults...');

// Update default themes for existing novels
const updateDefaults = db.prepare(`
  UPDATE novels 
  SET 
    author = COALESCE(author, 'Verse'),
    theme_primary_color = COALESCE(theme_primary_color, '#ef4444'),
    theme_secondary_color = COALESCE(theme_secondary_color, '#f97316'),
    theme_accent_color = COALESCE(theme_accent_color, '#fbbf24'),
    theme_background_color = COALESCE(theme_background_color, '#0f172a'),
    theme_text_color = COALESCE(theme_text_color, '#f1f5f9')
  WHERE 
    author IS NULL OR 
    theme_primary_color IS NULL OR 
    theme_secondary_color IS NULL OR 
    theme_accent_color IS NULL OR 
    theme_background_color IS NULL OR 
    theme_text_color IS NULL
`);

const result = updateDefaults.run();
console.log(`Updated ${result.changes} novels with default theme values.`);

// Set unique themes for each novel
const novels = db.prepare('SELECT * FROM novels ORDER BY id').all();

console.log('Setting unique themes for each novel:');

novels.forEach((novel, index) => {
  let themeColors;
  
  switch (index % 3) {
    case 0: // Red/Orange theme (Forged Pacts)
      themeColors = {
        primary: '#ef4444',
        secondary: '#f97316', 
        accent: '#fbbf24',
        background: '#0f172a',
        text: '#f1f5f9'
      };
      break;
    case 1: // Purple/Blue theme (Echoes of the Void)
      themeColors = {
        primary: '#8b5cf6',
        secondary: '#3b82f6',
        accent: '#06b6d4',
        background: '#1e1b4b',
        text: '#e0e7ff'
      };
      break;
    case 2: // Green/Teal theme
      themeColors = {
        primary: '#10b981',
        secondary: '#14b8a6',
        accent: '#fbbf24',
        background: '#064e3b',
        text: '#d1fae5'
      };
      break;
  }
  
  const updateTheme = db.prepare(`
    UPDATE novels 
    SET 
      theme_primary_color = ?,
      theme_secondary_color = ?,
      theme_accent_color = ?,
      theme_background_color = ?,
      theme_text_color = ?
    WHERE id = ?
  `);
  
  updateTheme.run(
    themeColors.primary,
    themeColors.secondary,
    themeColors.accent,
    themeColors.background,
    themeColors.text,
    novel.id
  );
  
  console.log(`- ${novel.title}: ${themeColors.primary} theme`);
});

console.log('Theme setup complete!');
db.close();
