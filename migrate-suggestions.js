const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'forgedpacts.db');
const db = new Database(dbPath);

console.log('Adding suggestions and votes tables...');

try {
  // Create suggestions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Feature',
      status TEXT NOT NULL DEFAULT 'pending', 
      priority TEXT NOT NULL DEFAULT 'medium',
      user_id INTEGER NOT NULL,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Create suggestion votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suggestion_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suggestion_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (suggestion_id) REFERENCES suggestions (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(suggestion_id, user_id)
    );
  `);

  console.log('✅ Successfully created suggestions and votes tables');

  // Add some sample suggestions for testing
  const userId = db.prepare('SELECT id FROM users WHERE username = ? LIMIT 1').get('admin')?.id;
  
  if (userId) {
    const insertSuggestion = db.prepare(`
      INSERT INTO suggestions (title, description, category, status, priority, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertSuggestion.run(
      'Chapter Comments',
      'Allow readers to leave comments and discussions on each chapter',
      'Community',
      'under_review',
      'high',
      userId
    );

    insertSuggestion.run(
      'Reading Statistics',
      'Show personal reading statistics like time spent reading, chapters completed, etc.',
      'Analytics',
      'approved',
      'medium',
      userId
    );

    insertSuggestion.run(
      'Bookmark System',
      'Allow users to bookmark their favorite chapters and characters',
      'Feature',
      'pending',
      'low',
      userId
    );

    console.log('✅ Added sample suggestions');
  }

} catch (error) {
  console.error('❌ Error creating tables:', error);
} finally {
  db.close();
}
