const Database = require('better-sqlite3');
const db = new Database('./database/forgedpacts.db');

console.log('Starting character table migration...');

// Check current schema
try {
  const result = db.prepare('PRAGMA table_info(characters)').all();
  console.log('Current characters table schema:', result.map(col => col.name));
} catch (error) {
  console.log('Characters table does not exist yet');
}

// Add new columns if they don't exist
const newColumns = [
  'ALTER TABLE characters ADD COLUMN bio TEXT',
  'ALTER TABLE characters ADD COLUMN role_type TEXT DEFAULT "Side"',
  'ALTER TABLE characters ADD COLUMN age TEXT',
  'ALTER TABLE characters ADD COLUMN occupation TEXT',
  'ALTER TABLE characters ADD COLUMN location TEXT',
  'ALTER TABLE characters ADD COLUMN personality_traits TEXT',
  'ALTER TABLE characters ADD COLUMN abilities TEXT',
  'ALTER TABLE characters ADD COLUMN relationships TEXT',
  'ALTER TABLE characters ADD COLUMN appearance TEXT',
  'ALTER TABLE characters ADD COLUMN backstory TEXT',
  'ALTER TABLE characters ADD COLUMN motivation TEXT',
  'ALTER TABLE characters ADD COLUMN theme_color TEXT DEFAULT "#ef4444"',
  'ALTER TABLE characters ADD COLUMN is_published BOOLEAN DEFAULT FALSE',
  'ALTER TABLE characters ADD COLUMN sort_order INTEGER DEFAULT 0'
];

newColumns.forEach(sql => {
  try {
    db.exec(sql);
    console.log('✓ Added column:', sql);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('- Column already exists:', sql.split(' ')[4]);
    } else {
      console.error('✗ Error:', error.message);
    }
  }
});

// Update character_type to be NOT NULL with default for existing records
try {
  db.exec('UPDATE characters SET character_type = "human" WHERE character_type IS NULL');
  console.log('✓ Updated NULL character_type values');
} catch (error) {
  console.log('- No NULL character_type values to update');
}

// Update role_type for existing records that might be NULL
try {
  db.exec('UPDATE characters SET role_type = "Side" WHERE role_type IS NULL');
  console.log('✓ Updated NULL role_type values');
} catch (error) {
  console.log('- No NULL role_type values to update');
}

// Show final schema
try {
  const finalResult = db.prepare('PRAGMA table_info(characters)').all();
  console.log('\nFinal characters table schema:');
  finalResult.forEach(col => {
    console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
  });
} catch (error) {
  console.error('Error showing final schema:', error.message);
}

console.log('\nDatabase migration complete!');
db.close();
