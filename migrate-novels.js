const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'forgedpacts.db');
const db = new Database(dbPath);

console.log('Migrating database to support multiple novels...');

try {
  // Create novels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS novels (
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
    );
  `);

  console.log('✅ Successfully created novels table');

  // Insert default novel
  const insertNovel = db.prepare(`
    INSERT OR IGNORE INTO novels (id, title, slug, description, genre, status, is_featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNovel.run(
    1,
    'Forged Pacts',
    'forged-pacts',
    'A dark fantasy epic where ancient agreements between demons, fae, and humans begin to crumble, forcing unlikely alliances in a world of shadow and flame.',
    'Dark Fantasy',
    'active',
    1,
    1
  );

  console.log('✅ Added default novel');

  // Check if columns already exist before adding them
  const checkChapterColumn = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='chapters'").get();
  if (checkChapterColumn && !checkChapterColumn.sql.includes('novel_id')) {
    db.exec('ALTER TABLE chapters ADD COLUMN novel_id INTEGER DEFAULT 1');
    db.exec('CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id)');
    console.log('✅ Added novel_id to chapters table');
  }

  const checkCharacterColumn = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='characters'").get();
  if (checkCharacterColumn && !checkCharacterColumn.sql.includes('novel_id')) {
    db.exec('ALTER TABLE characters ADD COLUMN novel_id INTEGER DEFAULT 1');
    db.exec('CREATE INDEX IF NOT EXISTS idx_characters_novel_id ON characters(novel_id)');
    console.log('✅ Added novel_id to characters table');
  }

  const checkContentColumn = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='content_sections'").get();
  if (checkContentColumn && !checkContentColumn.sql.includes('novel_id')) {
    db.exec('ALTER TABLE content_sections ADD COLUMN novel_id INTEGER DEFAULT 1');
    // Drop old unique constraint and create new one
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
      );
    `);
    
    db.exec(`
      INSERT INTO content_sections_new 
      SELECT id, novel_id, section_key, title, content, content_type, section_type, 
             is_published, sort_order, metadata, created_at, updated_at
      FROM content_sections;
    `);
    
    db.exec('DROP TABLE content_sections');
    db.exec('ALTER TABLE content_sections_new RENAME TO content_sections');
    
    console.log('✅ Updated content_sections table with novel_id');
  }

  // Update the world page content sections
  const updateWorldContent = db.prepare(`
    INSERT OR IGNORE INTO content_sections (novel_id, section_key, title, content, content_type, section_type, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Update existing world content
  updateWorldContent.run(
    1,
    'world_overview',
    'The World of Forged Pacts',
    `# A Realm of Ancient Powers

The world of Forged Pacts exists in the liminal spaces between our reality and the otherworld, where three primary supernatural forces have coexisted for millennia under carefully negotiated agreements.

## The Great Convergence

Long ago, during the Great Convergence, representatives from the demon courts, fae nobility, and human magical societies came together to establish the Binding Accords. These ancient pacts created territories, established rules of engagement, and set the boundaries that have kept an uneasy peace.

But peace built on old magic is fragile, and the cracks are beginning to show.

## Magic and Power

In this world, magic flows through ley lines that crisscross the landscape, creating nexus points where the supernatural forces gather. Control of these nexus points has been the source of countless conflicts throughout history.

The nature of magic itself varies between the three peoples:
- **Demons** draw power from passion, emotion, and the raw forces of creation and destruction
- **Fae** channel the magic of nature, seasons, and the eternal dance between growth and decay  
- **Humans** must forge pacts and alliances to access supernatural power, making them the ultimate diplomats and deal-makers`,
    'markdown',
    'world',
    1
  );

  console.log('✅ Updated world content');

} catch (error) {
  console.error('❌ Error during migration:', error);
} finally {
  db.close();
}
