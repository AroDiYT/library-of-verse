const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'forgedpacts.db');
const db = new Database(dbPath);

console.log('=== Database Status ===');

// Check if database exists
try {
  const chapters = db.prepare('SELECT id, title, is_published, chapter_number FROM chapters ORDER BY chapter_number').all();
  console.log('\nAvailable chapters:');
  chapters.forEach(ch => console.log(`  ID: ${ch.id}, Chapter: ${ch.chapter_number}, Title: ${ch.title}, Published: ${ch.is_published}`));
  
  const users = db.prepare('SELECT id, email, username, is_admin FROM users').all();
  console.log('\nUsers:');
  users.forEach(user => console.log(`  ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Admin: ${user.is_admin}`));
  
  const sessions = db.prepare('SELECT id, user_id, expires_at FROM sessions WHERE expires_at > datetime("now")').all();
  console.log('\nActive sessions:');
  sessions.forEach(session => console.log(`  ID: ${session.id.substring(0, 20)}..., User: ${session.user_id}, Expires: ${session.expires_at}`));
  
} catch (error) {
  console.error('Database error:', error.message);
}

db.close();
