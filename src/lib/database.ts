import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'forgedpacts.db');
const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new Database(dbPath);
// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database with schema
function initializeDatabase() {
  try {
    if (fs.existsSync(schemaPath)) {
      // Check if database is already initialized by looking for users table
      const tablesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      
      if (!tablesExist) {
        console.log('Database not initialized, running schema...');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
        
        // Create default admin user with proper password hash
        const adminPassword = bcrypt.hashSync('admin123', 10);
        const insertAdmin = db.prepare(`
          INSERT OR REPLACE INTO users (id, email, password_hash, username, is_admin, role) 
          VALUES (1, 'admin@forgedpacts.com', ?, 'admin', TRUE, 'admin')
        `);
        insertAdmin.run(adminPassword);
        
        console.log('Database initialized successfully');
      } else {
        console.log('Database already initialized');
        
        // Check if role column exists and add it if it doesn't
        const roleColumnExists = db.prepare("PRAGMA table_info(users)").all()
          .some((column: any) => column.name === 'role');
        
        if (!roleColumnExists) {
          console.log('Adding role column to users table...');
          db.exec(`
            ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'reader';
            ALTER TABLE users ADD COLUMN pen_name TEXT;
          `);
          
          // Update existing admin users to have role='admin'
          db.prepare(`UPDATE users SET role = 'admin' WHERE is_admin = TRUE`).run();
          console.log('Role column added and admin users updated');
        }
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize on import
initializeDatabase();
initializeDatabase();

// User functions
export const userQueries = {
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ? AND is_active = TRUE'),
  findById: db.prepare('SELECT * FROM users WHERE id = ? AND is_active = TRUE'),
  create: db.prepare(`
    INSERT INTO users (email, password_hash, username) 
    VALUES (?, ?, ?) 
    RETURNING id, email, username, is_admin, role, pen_name, created_at
  `),
  updateLastLogin: db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'),
  getAll: db.prepare('SELECT id, email, username, is_admin, role, pen_name, created_at, last_login FROM users WHERE is_active = TRUE'),
};

// Chapter functions
export const chapterQueries = {
  getPublished: db.prepare('SELECT * FROM chapters WHERE is_published = TRUE ORDER BY chapter_number'),
  getAll: db.prepare('SELECT * FROM chapters ORDER BY chapter_number'),
  getPublishedByNovel: db.prepare('SELECT * FROM chapters WHERE is_published = TRUE AND novel_id = ? ORDER BY chapter_number'),
  getAllByNovel: db.prepare('SELECT * FROM chapters WHERE novel_id = ? ORDER BY chapter_number'),
  getById: db.prepare('SELECT * FROM chapters WHERE id = ?'),
  getNextChapter: db.prepare(`
    SELECT * FROM chapters 
    WHERE chapter_number > ? AND novel_id = ?
    ORDER BY chapter_number ASC 
    LIMIT 1
  `),
  getPrevChapter: db.prepare(`
    SELECT * FROM chapters 
    WHERE chapter_number < ? AND novel_id = ?
    ORDER BY chapter_number DESC 
    LIMIT 1
  `),
  getNextPublishedChapter: db.prepare(`
    SELECT * FROM chapters 
    WHERE chapter_number > ? AND is_published = TRUE AND novel_id = ?
    ORDER BY chapter_number ASC 
    LIMIT 1
  `),
  getPrevPublishedChapter: db.prepare(`
    SELECT * FROM chapters 
    WHERE chapter_number < ? AND is_published = TRUE AND novel_id = ?
    ORDER BY chapter_number DESC 
    LIMIT 1
  `),
  create: db.prepare(`
    INSERT INTO chapters (title, chapter_number, content, excerpt, word_count, is_published, novel_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `),
  update: db.prepare(`
    UPDATE chapters 
    SET title = ?, content = ?, excerpt = ?, word_count = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM chapters WHERE id = ?'),
};

// Character functions
export const characterQueries = {
  getAll: db.prepare('SELECT * FROM characters ORDER BY is_main_character DESC, name'),
  getById: db.prepare('SELECT * FROM characters WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO characters (name, description, character_type, image_url, is_main_character) 
    VALUES (?, ?, ?, ?, ?) 
    RETURNING *
  `),
  update: db.prepare(`
    UPDATE characters 
    SET name = ?, description = ?, character_type = ?, image_url = ?, is_main_character = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM characters WHERE id = ?'),
};

// Reading progress functions
export const progressQueries = {
  getUserProgress: db.prepare(`
    SELECT rp.*, c.title, c.chapter_number 
    FROM reading_progress rp 
    JOIN chapters c ON rp.chapter_id = c.id 
    WHERE rp.user_id = ? 
    ORDER BY c.chapter_number
  `),
  updateProgress: db.prepare(`
    INSERT OR REPLACE INTO reading_progress (user_id, chapter_id, progress_percentage, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `),
  markCompleted: db.prepare(`
    INSERT OR REPLACE INTO reading_progress (user_id, chapter_id, progress_percentage, completed_at, updated_at)
    VALUES (?, ?, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `),
};

// Session functions
export const sessionQueries = {
  create: db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'),
  findById: db.prepare(`
    SELECT s.id, s.user_id, s.expires_at, s.created_at, u.email, u.username, u.role, u.pen_name 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
  `),
  delete: db.prepare('DELETE FROM sessions WHERE id = ?'),
  cleanup: db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP'),
};

// Region card functions
export const regionCardQueries = {
  getByNovel: db.prepare('SELECT * FROM region_cards WHERE novel_id = ? ORDER BY sort_order ASC, name ASC'),
  getById: db.prepare('SELECT * FROM region_cards WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO region_cards (novel_id, name, description, image_url, continent, sort_order, theme_color, border_color, background_color, hover_color, icon, layout_style) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `),
  update: db.prepare(`
    UPDATE region_cards 
    SET name = ?, description = ?, image_url = ?, continent = ?, sort_order = ?, theme_color = ?, border_color = ?, background_color = ?, hover_color = ?, icon = ?, layout_style = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM region_cards WHERE id = ?'),
};

export default db;
