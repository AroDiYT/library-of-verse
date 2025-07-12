const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'forgedpacts.db');
const db = new Database(dbPath);

console.log('Setting up novels table and migrating content...');

try {
  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Check if novels table exists
  const novelTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='novels'").get();
  
  if (!novelTableExists) {
    console.log('Creating novels table...');
    
    // Create novels table
    db.exec(`
      CREATE TABLE novels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        genre TEXT DEFAULT 'Dark Fantasy',
        status TEXT NOT NULL DEFAULT 'active',
        is_featured BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default novel
    const insertNovel = db.prepare(`
      INSERT INTO novels (id, title, slug, description, genre, status, is_featured, sort_order)
      VALUES (1, 'Forged Pacts', 'forged-pacts', 'A dark fantasy epic where ancient agreements between demons, fae, and humans begin to crumble, forcing unlikely alliances in a world of shadow and flame.', 'Dark Fantasy', 'active', TRUE, 1)
    `);
    insertNovel.run();
    
    console.log('Novels table created and default novel inserted.');
  } else {
    console.log('Novels table already exists.');
    
    // Check if default novel exists
    const defaultNovel = db.prepare('SELECT id FROM novels WHERE id = 1').get();
    if (!defaultNovel) {
      const insertNovel = db.prepare(`
        INSERT INTO novels (id, title, slug, description, genre, status, is_featured, sort_order)
        VALUES (1, 'Forged Pacts', 'forged-pacts', 'A dark fantasy epic where ancient agreements between demons, fae, and humans begin to crumble, forcing unlikely alliances in a world of shadow and flame.', 'Dark Fantasy', 'active', TRUE, 1)
      `);
      insertNovel.run();
      console.log('Default novel inserted.');
    }
  }

  // Check if content_sections table has novel_id column
  const contentColumns = db.prepare("PRAGMA table_info(content_sections)").all();
  const hasNovelId = contentColumns.some(col => col.name === 'novel_id');
  
  if (!hasNovelId) {
    console.log('Adding novel_id column to content_sections...');
    
    // Add novel_id column
    db.exec('ALTER TABLE content_sections ADD COLUMN novel_id INTEGER DEFAULT 1');
    
    // Add foreign key constraint by recreating the table
    db.exec(`
      CREATE TABLE content_sections_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER DEFAULT 1,
        section_key TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        content_type TEXT NOT NULL DEFAULT 'markdown',
        section_type TEXT NOT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE,
        UNIQUE(novel_id, section_key)
      )
    `);
    
    // Copy data
    db.exec(`
      INSERT INTO content_sections_new (id, novel_id, section_key, title, content, content_type, section_type, is_published, sort_order, metadata, created_at, updated_at)
      SELECT id, 1, section_key, title, content, content_type, section_type, is_published, sort_order, metadata, created_at, updated_at
      FROM content_sections
    `);
    
    // Drop old table and rename new one
    db.exec('DROP TABLE content_sections');
    db.exec('ALTER TABLE content_sections_new RENAME TO content_sections');
    
    console.log('Content sections table updated with novel_id support.');
  } else {
    console.log('Content sections table already has novel_id column.');
  }

  // Check if chapters table has novel_id column
  const chapterColumns = db.prepare("PRAGMA table_info(chapters)").all();
  const chaptersHasNovelId = chapterColumns.some(col => col.name === 'novel_id');
  
  if (!chaptersHasNovelId) {
    console.log('Adding novel_id column to chapters...');
    db.exec('ALTER TABLE chapters ADD COLUMN novel_id INTEGER DEFAULT 1');
    
    // Add foreign key constraint
    db.exec(`
      CREATE TABLE chapters_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER DEFAULT 1,
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
      )
    `);
    
    db.exec(`
      INSERT INTO chapters_new (id, novel_id, title, chapter_number, content, excerpt, word_count, is_published, published_at, created_at, updated_at)
      SELECT id, 1, title, chapter_number, content, excerpt, word_count, is_published, published_at, created_at, updated_at
      FROM chapters
    `);
    
    db.exec('DROP TABLE chapters');
    db.exec('ALTER TABLE chapters_new RENAME TO chapters');
    
    console.log('Chapters table updated with novel_id support.');
  } else {
    console.log('Chapters table already has novel_id column.');
  }

  // Check if characters table has novel_id column
  const characterColumns = db.prepare("PRAGMA table_info(characters)").all();
  const charactersHasNovelId = characterColumns.some(col => col.name === 'novel_id');
  
  if (!charactersHasNovelId) {
    console.log('Adding novel_id column to characters...');
    db.exec('ALTER TABLE characters ADD COLUMN novel_id INTEGER DEFAULT 1');
    
    // Add foreign key constraint
    db.exec(`
      CREATE TABLE characters_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER DEFAULT 1,
        name TEXT NOT NULL,
        description TEXT,
        bio TEXT,
        role_type TEXT NOT NULL DEFAULT 'Side',
        character_type TEXT NOT NULL DEFAULT 'human',
        age TEXT,
        occupation TEXT,
        location TEXT,
        personality_traits TEXT,
        abilities TEXT,
        relationships TEXT,
        appearance TEXT,
        backstory TEXT,
        motivation TEXT,
        theme_color TEXT DEFAULT '#ef4444',
        image_url TEXT,
        is_published BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
      )
    `);
    
    db.exec(`
      INSERT INTO characters_new (id, novel_id, name, description, bio, role_type, character_type, age, occupation, location, personality_traits, abilities, relationships, appearance, backstory, motivation, theme_color, image_url, is_published, sort_order, created_at, updated_at)
      SELECT id, 1, name, description, bio, role_type, character_type, age, occupation, location, personality_traits, abilities, relationships, appearance, backstory, motivation, theme_color, image_url, is_published, sort_order, created_at, updated_at
      FROM characters
    `);
    
    db.exec('DROP TABLE characters');
    db.exec('ALTER TABLE characters_new RENAME TO characters');
    
    console.log('Characters table updated with novel_id support.');
  } else {
    console.log('Characters table already has novel_id column.');
  }

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('Migration completed successfully!');
  
  // Display summary
  const novelCount = db.prepare('SELECT COUNT(*) as count FROM novels').get().count;
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM content_sections').get().count;
  const chapterCount = db.prepare('SELECT COUNT(*) as count FROM chapters').get().count;
  const characterCount = db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
  
  console.log(`\nSummary:
- Novels: ${novelCount}
- Content sections: ${contentCount}
- Chapters: ${chapterCount}
- Characters: ${characterCount}`);

} catch (error) {
  console.error('Migration failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
