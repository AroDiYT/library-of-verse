const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('👥 Creating sample users...\n');

const dbPath = path.join(__dirname, 'database', 'forgedpacts.db');
const db = new Database(dbPath);

const sampleUsers = [
  { email: 'reader1@example.com', username: 'BookwormAlice', password: 'password123' },
  { email: 'reader2@example.com', username: 'FantasyFan_Bob', password: 'password123' },
  { email: 'reader3@example.com', username: 'NovelLover_Carol', password: 'password123' },
  { email: 'reader4@example.com', username: 'StorySeeker_Dave', password: 'password123' },
  { email: 'reader5@example.com', username: 'PageTurner_Eve', password: 'password123' },
];

try {
  let createdCount = 0;
  
  for (const user of sampleUsers) {
    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(user.email, user.username);
    
    if (!existing) {
      const passwordHash = bcrypt.hashSync(user.password, 10);
      
      const stmt = db.prepare(`
        INSERT INTO users (email, username, password_hash, is_admin, is_active, created_at)
        VALUES (?, ?, ?, 0, 1, ?)
      `);
      
      // Random creation date within last 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      stmt.run(user.email, user.username, passwordHash, createdAt.toISOString());
      createdCount++;
      console.log(`✅ Created user: ${user.username}`);
    } else {
      console.log(`⏭️  User ${user.username} already exists`);
    }
  }
  
  console.log(`\n📊 Created ${createdCount} new users`);
  
  // Show total users
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`Total users in database: ${totalUsers.count}`);

} catch (error) {
  console.error('Error creating users:', error);
} finally {
  db.close();
  console.log('\n✅ User creation completed!');
}
