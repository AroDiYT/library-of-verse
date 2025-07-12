const Database = require('better-sqlite3');
const path = require('path');

console.log('📊 Adding sample analytics data...\n');

const dbPath = path.join(__dirname, 'database', 'forgedpacts.db');
const db = new Database(dbPath);

try {
  // Get existing users and chapters
  const users = db.prepare('SELECT id, username FROM users WHERE is_admin = 0').all();
  const chapters = db.prepare('SELECT id FROM chapters WHERE is_published = 1').all();
  
  console.log(`Found ${users.length} users and ${chapters.length} chapters`);
  
  if (users.length === 0 || chapters.length === 0) {
    console.log('No users or chapters found. Skipping analytics data creation.');
    process.exit(0);
  }

  // Clear existing reading progress
  db.prepare('DELETE FROM reading_progress').run();
  
  // Add realistic reading progress data
  let progressCount = 0;
  
  users.forEach(user => {
    // Each user reads between 0-80% of chapters
    const readPercentage = Math.random() * 0.8;
    const chaptersToRead = Math.floor(chapters.length * readPercentage);
    
    // Read chapters in order (mostly)
    const shuffledChapters = [...chapters].sort(() => Math.random() - 0.5);
    const chaptersToReadArray = shuffledChapters.slice(0, chaptersToRead);
    
    chaptersToReadArray.forEach(chapter => {
      const stmt = db.prepare(`
        INSERT INTO reading_progress (user_id, chapter_id, completed_at)
        VALUES (?, ?, ?)
      `);
      
      // Random completion date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const completedAt = new Date();
      completedAt.setDate(completedAt.getDate() - daysAgo);
      
      stmt.run(user.id, chapter.id, completedAt.toISOString());
      progressCount++;
    });
  });

  // Add some sample sessions (for login analytics)
  const sessionCount = 50;
  for (let i = 0; i < sessionCount; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - daysAgo);
    
    // Generate a random session ID
    const sessionId = 'analytics_' + Math.random().toString(36).substring(2, 15);
    
    const stmt = db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    const expiresAt = new Date(sessionDate);
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
    
    stmt.run(sessionId, user.id, expiresAt.toISOString(), sessionDate.toISOString());
  }

  console.log(`✅ Added ${progressCount} reading progress entries`);
  console.log(`✅ Added ${sessionCount} sample sessions`);
  
  // Show summary
  const totalProgress = db.prepare('SELECT COUNT(*) as count FROM reading_progress').get();
  const totalSessions = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
  
  console.log(`\n📈 Analytics Summary:`);
  console.log(`- Total reading progress entries: ${totalProgress.count}`);
  console.log(`- Total sessions: ${totalSessions.count}`);
  console.log(`- Active users: ${users.length}`);
  console.log(`- Published chapters: ${chapters.length}`);

} catch (error) {
  console.error('Error adding analytics data:', error);
} finally {
  db.close();
  console.log('\n✅ Analytics data setup completed!');
}
