const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'forgedpacts.db');
const db = new Database(dbPath);

console.log('Checking database schema...\n');

// Check users table schema
console.log('Users table:');
const userColumns = db.prepare("PRAGMA table_info(users)").all();
userColumns.forEach(col => console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`));

console.log('\nNovels table:');
const novelColumns = db.prepare("PRAGMA table_info(novels)").all();
novelColumns.forEach(col => console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`));

console.log('\nChapters table:');
const chapterColumns = db.prepare("PRAGMA table_info(chapters)").all();
chapterColumns.forEach(col => console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`));

console.log('\nCharacters table:');
const characterColumns = db.prepare("PRAGMA table_info(characters)").all();
characterColumns.forEach(col => console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`));

// Check if messages and writer_applications tables exist
try {
  console.log('\nMessages table:');
  const messageColumns = db.prepare("PRAGMA table_info(messages)").all();
  if (messageColumns.length > 0) {
    messageColumns.forEach(col => console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`));
  } else {
    console.log('  Table does not exist');
  }
} catch (e) {
  console.log('  Table does not exist');
}

try {
  console.log('\nWriter applications table:');
  const appColumns = db.prepare("PRAGMA table_info(writer_applications)").all();
  if (appColumns.length > 0) {
    appColumns.forEach(col => console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`));
  } else {
    console.log('  Table does not exist');
  }
} catch (e) {
  console.log('  Table does not exist');
}

db.close();
