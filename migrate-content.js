const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'forgedpacts.db');
const db = new Database(dbPath);

console.log('Adding content sections table and default content...');

try {
  // Create content sections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'markdown',
      section_type TEXT NOT NULL,
      is_published BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Successfully created content_sections table');

  // Insert default content sections
  const insertContent = db.prepare(`
    INSERT OR IGNORE INTO content_sections (section_key, title, content, content_type, section_type, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // About page content
  insertContent.run(
    'about_intro',
    'About the Author',
    `# Welcome to Forged Pacts

I'm a passionate storyteller who has always been drawn to the darker corners of fantasy. This world of demons, fae, and humans locked in ancient conflicts has been brewing in my imagination for years.

## The Story Behind the Story

Forged Pacts began as a simple question: What happens when the old agreements that keep supernatural forces in check start to break down? In this world, ancient pacts between demons, fae, and humans have maintained a delicate balance for centuries. But as these agreements begin to crumble, new alliances must be forged, and old enemies must become unlikely allies.

## Writing Philosophy

I believe in character-driven narratives where personal relationships and moral complexity take center stage. Each character in Forged Pacts has their own motivations, fears, and desires that drive the larger plot forward.

Thank you for joining me on this journey into darkness and light.`,
    'markdown',
    'about',
    1
  );

  insertContent.run(
    'about_contact',
    'Get in Touch',
    `## Connect With Me

I love hearing from readers! Whether you have questions about the story, want to discuss character development, or just want to chat about dark fantasy in general, I'm always happy to connect.

**Email:** author@forgedpacts.com  
**Social Media:** Follow me for updates and behind-the-scenes content

## Beta Readers & Feedback

If you're interested in becoming a beta reader or have feedback about the story, please don't hesitate to reach out. Your input helps make Forged Pacts the best it can be.`,
    'markdown',
    'about',
    2
  );

  // World content
  insertContent.run(
    'world_overview',
    'The World of Forged Pacts',
    `# A Realm of Ancient Powers

The world of Forged Pacts exists in the liminal spaces between our reality and the otherworld, where three primary supernatural forces have coexisted for millennia under carefully negotiated agreements.

## The Great Convergence

Long ago, during the Great Convergence, representatives from the demon courts, fae nobility, and human magical societies came together to establish the Binding Accords. These ancient pacts created territories, established rules of engagement, and set the boundaries that have kept an uneasy peace.

But peace built on old magic is fragile, and the cracks are beginning to show.

## Magic and Power

In this world, magic flows through ley lines that crisscross the landscape, creating nexus points where the supernatural forces gather. Control of these nexus points has been the source of countless conflicts throughout history.

The nature of magic itself varies between the three peoples:
- **Demons** draw power from passion, emotion, and the raw forces of creation and destruction
- **Fae** channel the magic of nature, seasons, and the eternal dance between growth and decay  
- **Humans** must forge pacts and alliances to access supernatural power, making them the ultimate diplomats and deal-makers`,
    'markdown',
    'world',
    1
  );

  // Region content
  insertContent.run(
    'region_shadowmere',
    'The Shadowmere',
    `# The Shadowmere

A vast marshland where the boundaries between worlds grow thin. Ancient willow trees draped in silver moss create natural cathedrals where forbidden meetings take place. The water here runs black as ink, reflecting not the sky above but glimpses of the otherworld below.

**Key Features:**
- The Whispering Hollows: Sacred groves where the fae hold court
- The Sunken Palace: Ruins of an ancient human kingdom, now claimed by water spirits
- The Crossing Stones: A bridge between worlds, heavily guarded and rarely used

**Current Status:** Contested territory following the breakdown of the Willow Pact`,
    'markdown',
    'region',
    1
  );

  insertContent.run(
    'region_cinderpeak',
    'The Cinder Peaks',
    `# The Cinder Peaks

A mountain range of active volcanoes where demon lords have built their citadels. The peaks burn with eternal flames that never consume, and the air shimmers with heat that speaks of power beyond mortal comprehension.

**Key Features:**
- The Obsidian Throne: Seat of power for the Demon Court of Flames
- The Forges of Making: Where legendary weapons and binding contracts are crafted
- The Howling Canyons: Deep ravines where the wind carries the voices of ancient pacts

**Current Status:** Demon stronghold, but recent upheavals have left succession in question`,
    'markdown',
    'region',
    2
  );

  insertContent.run(
    'region_verdant_reaches',
    'The Verdant Reaches',
    `# The Verdant Reaches

Rolling hills and ancient forests where human settlements dot the landscape like islands in a green sea. Here, the old ways persist alongside new innovations, and hedge witches work alongside university-trained scholars to maintain the delicate balance.

**Key Features:**
- Haven's Rest: The largest human settlement and center of magical learning
- The Circle of Stones: An ancient ritual site where the first human-fae pact was signed
- The Wandering Woods: A forest that shifts its paths to protect travelers... or lead them astray

**Current Status:** Human territory, but increasingly dependent on supernatural alliances for protection`,
    'markdown',
    'region',
    3
  );

  // Home page content
  insertContent.run(
    'home_hero_title',
    'Hero Title',
    'Forged Pacts',
    'text',
    'home',
    1
  );

  insertContent.run(
    'home_hero_subtitle',
    'Hero Subtitle',
    'A Dark Fantasy Epic',
    'text',
    'home',
    2
  );

  insertContent.run(
    'home_hero_description',
    'Hero Description',
    'Where ancient agreements crumble and new alliances rise from shadow and flame. Enter a world where demons, fae, and humans must forge new pacts or face extinction.',
    'text',
    'home',
    3
  );

  console.log('✅ Added default content sections');

} catch (error) {
  console.error('❌ Error creating content sections:', error);
} finally {
  db.close();
}
