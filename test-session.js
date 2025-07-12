const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const db = new Database('./database/forgedpacts.db');

// Manually create a test session
const sessionId = jwt.sign({ random: Math.random() }, 'your-super-secret-jwt-key-change-in-production');
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

console.log('Creating manual session:', sessionId);

try {
  const insertSession = db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)');
  insertSession.run(sessionId, 1, expiresAt.toISOString());
  console.log('Session created successfully');
  
  // Now test retrieval
  const getSession = db.prepare(`
    SELECT s.id, s.user_id, s.expires_at, s.created_at, u.email, u.username, u.is_admin 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `);
  
  const session = getSession.get(sessionId);
  console.log('Retrieved session:', session);
  
  // Set as cookie manually in a test
  console.log('Test this session ID in browser:', sessionId);
} catch (error) {
  console.error('Error:', error);
}

db.close();
