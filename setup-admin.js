const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('🔧 Checking and setting up admin user...\n');

const dbPath = path.join(__dirname, 'database', 'forgedpacts.db');
const db = new Database(dbPath);

// Check current users
console.log('Current users in database:');
const users = db.prepare('SELECT id, email, username, is_admin, is_active FROM users').all();
console.log(users);

if (users.length === 0) {
  console.log('\n📝 Creating default admin user...');
  
  const passwordHash = bcrypt.hashSync('admin123', 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (email, username, password_hash, is_admin, is_active, created_at)
    VALUES (?, ?, ?, 1, 1, datetime('now'))
  `);
  
  const result = stmt.run('admin@example.com', 'admin', passwordHash);
  console.log('Admin user created with ID:', result.lastInsertRowid);
  
  // Verify creation
  const newUsers = db.prepare('SELECT id, email, username, is_admin, is_active FROM users').all();
  console.log('Updated users:', newUsers);
} else {
  console.log('\nUsers already exist in database');
}

db.close();
console.log('\n✅ Database check completed!');
