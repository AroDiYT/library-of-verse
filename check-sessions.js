const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'forgedpacts.db');
const db = new Database(dbPath);

console.log('=== Session Analysis ===');

// Check current sessions
const sessions = db.prepare('SELECT id, user_id, expires_at, created_at FROM sessions ORDER BY created_at DESC LIMIT 10').all();
console.log('Recent sessions:');
sessions.forEach(session => {
  const expired = new Date(session.expires_at) < new Date();
  console.log(`  ${session.id.substring(0, 20)}... User: ${session.user_id}, Expires: ${session.expires_at}, Expired: ${expired}`);
});

// Check if there are any active sessions
const activeSessionsQuery = `SELECT COUNT(*) as count FROM sessions WHERE datetime(expires_at) > datetime('now')`;
const activeSessions = db.prepare(activeSessionsQuery).get();
console.log('\nActive sessions:', activeSessions.count);

// Test session lookup
if (sessions.length > 0) {
  const latestSession = sessions[0];
  console.log(`\nTesting session lookup for: ${latestSession.id.substring(0, 20)}...`);
  
  const sessionLookup = db.prepare(`
    SELECT s.id, s.user_id, s.expires_at, s.created_at, u.email, u.username, u.is_admin 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.id = ? AND datetime(s.expires_at) > datetime('now')
  `).get(latestSession.id);
  
  if (sessionLookup) {
    console.log('Session lookup successful:', {
      id: sessionLookup.id.substring(0, 20) + '...',
      user_id: sessionLookup.user_id,
      email: sessionLookup.email,
      expires_at: sessionLookup.expires_at
    });
  } else {
    console.log('Session lookup failed - session not found or expired');
  }
}

db.close();
