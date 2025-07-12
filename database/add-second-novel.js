const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'forgedpacts.db');
const db = new Database(dbPath);

console.log('Adding second novel and test data...');

try {
  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Insert second novel
  const insertNovel = db.prepare(`
    INSERT OR IGNORE INTO novels (id, title, slug, description, genre, status, is_featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNovel.run(
    2,
    'Echoes of the Void',
    'echoes-of-the-void',
    'A sci-fi epic exploring the consequences of interdimensional travel and the ancient beings that dwell between realities. When humanity discovers tears in space-time, they awaken something that should have remained dormant.',
    'Science Fiction',
    'active',
    1, // is_featured as integer
    2
  );

  console.log('Second novel "Echoes of the Void" inserted.');

  // Add content for the second novel
  const insertSection = db.prepare(`
    INSERT OR IGNORE INTO content_sections (novel_id, section_key, title, content, content_type, section_type, is_published, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // About sections for second novel
  const aboutSections = [
    {
      novel_id: 2,
      section_key: 'about_story_void',
      title: 'The Void Beckons',
      content: `In the year 2387, humanity achieved what many thought impossible: the ability to tear holes in the fabric of reality itself. The Void Drive technology promised unlimited energy, instant travel across the galaxy, and access to resources beyond imagination.

But the void between dimensions was never empty.

Ancient beings, older than stars and hungrier than black holes, have been waiting in the spaces between realities. When humanity's experiments create permanent rifts, these entities begin to seep through, bringing with them technologies and knowledge that challenge everything we thought we knew about existence.

This is a story of discovery and consequence, of scientific ambition meeting cosmic horror, and of the prices we pay for reaching beyond our grasp.`,
      content_type: 'markdown',
      section_type: 'about',
      is_published: 1,
      sort_order: 1
    },
    {
      novel_id: 2,
      section_key: 'about_themes_void',
      title: 'Themes & Vision',
      content: `Echoes of the Void explores themes of scientific responsibility, the unknown consequences of progress, and humanity's place in a vast, indifferent universe.

**Core Themes:**
- The ethics of scientific advancement
- Cosmic horror meets hard science fiction
- The price of knowledge and power
- Interdimensional politics and alien psychology
- Human resilience in the face of the incomprehensible

The story combines detailed scientific concepts with existential dread, creating a narrative that questions whether some doors should never be opened.`,
      content_type: 'markdown',
      section_type: 'about',
      is_published: 1,
      sort_order: 2
    }
  ];

  // World sections for second novel
  const worldSections = [
    {
      novel_id: 2,
      section_key: 'world_overview_void',
      title: 'The Fragmented Reality',
      content: `By 2387, humanity has spread across twelve star systems, connected by a network of Void Gates that allow instantaneous travel between dimensions. What began as humanity's greatest triumph has become its greatest threat.

**The Three Realities:**
- **Prime Reality**: Our original universe, now scarred by dimensional rifts
- **The Void Between**: The space between dimensions, home to entities beyond comprehension  
- **The Echo Dimensions**: Parallel realities with their own versions of humanity

Each reality operates under slightly different physical laws, and prolonged exposure to dimensional travel has begun changing human biology in unexpected ways.`,
      content_type: 'markdown',
      section_type: 'world',
      is_published: 1,
      sort_order: 1
    },
    {
      novel_id: 2,
      section_key: 'world_technology_void',
      title: 'Void Technology',
      content: `**Void Drives**: Engines that tear temporary holes in reality, allowing ships to travel through the space between dimensions. Each jump leaves a "scar" that makes future tears easier but more dangerous.

**Resonance Fields**: Protective barriers that prevent void entities from fully manifesting in our reality. As the fields weaken, the entities grow stronger.

**Echo Sensors**: Technology borrowed from void entities that can detect changes across multiple realities simultaneously. The cost of using this technology is measured in human sanity.

**Phase Weapons**: Armaments that can strike targets across dimensional boundaries, but each shot creates micro-rifts that may never fully heal.

The line between human technology and void entity "gifts" has become increasingly blurred.`,
      content_type: 'markdown',
      section_type: 'world',
      is_published: 1,
      sort_order: 2
    }
  ];

  // Region sections for second novel
  const regionSections = [
    {
      novel_id: 2,
      section_key: 'region_terra_prime',
      title: 'Terra Prime - The Scarred Homeworld',
      content: `Earth, now called Terra Prime, bears the wounds of humanity's first experiments with dimensional travel. Massive void scars crisscross the planet's surface, creating zones where reality is unstable.

**The Scar Zones:**
- **Geneva Crater**: Site of the first successful void tear, now a pilgrimage site for void cultists
- **The Pacific Rift**: A permanent dimensional gateway that requires constant monitoring
- **The European Deadlands**: Areas where reality has become so unstable that time moves differently

**Major Cities:**
- **New Geneva**: The seat of the Dimensional Council
- **Tokyo-7**: A city rebuilt after a dimensional cascade event
- **London Undercity**: Built beneath the ruins of the original London

Despite the scars, Terra Prime remains humanity's political and cultural center.`,
      content_type: 'markdown',
      section_type: 'region',
      is_published: 1,
      sort_order: 1
    },
    {
      novel_id: 2,
      section_key: 'region_void_stations',
      title: 'The Void Stations',
      content: `Massive space stations built in the void between dimensions, these outposts serve as humanity's first line of defense against void entities. Each station is a marvel of engineering and a testament to human stubbornness.

**Station Classes:**
- **Sentinel Stations**: Military outposts armed with phase weapons
- **Research Platforms**: Scientific installations studying void phenomena
- **Transit Hubs**: Commercial stations facilitating interdimensional trade
- **Quarantine Facilities**: Stations for containing void-touched individuals

**Notable Stations:**
- **Haven-1**: The first and largest void station, home to 50,000 people
- **Prometheus Research Platform**: Where humanity's most dangerous experiments take place
- **The Lighthouse**: A beacon that helps ships navigate the void between realities

Life on a void station requires constant vigilance, as the very air is saturated with interdimensional energy that slowly changes anyone exposed to it.`,
      content_type: 'markdown',
      section_type: 'region',
      is_published: 1,
      sort_order: 2
    }
  ];

  // Insert all content sections for the second novel
  [...aboutSections, ...worldSections, ...regionSections].forEach(section => {
    insertSection.run(
      section.novel_id,
      section.section_key,
      section.title,
      section.content,
      section.content_type,
      section.section_type,
      section.is_published,
      section.sort_order
    );
  });

  // Add some characters for the second novel
  const insertCharacter = db.prepare(`
    INSERT OR IGNORE INTO characters (novel_id, name, description, bio, role_type, character_type, age, occupation, personality_traits, abilities, theme_color, is_published, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const characters = [
    {
      novel_id: 2,
      name: 'Dr. Elena Vasquez',
      description: 'Lead researcher on the Void Drive project and the first human to survive direct void exposure.',
      bio: 'Once a brilliant physicist, Elena\'s encounter with void entities has given her unique insights into interdimensional physics. She can perceive multiple realities simultaneously, but this gift comes at the cost of her sanity.',
      role_type: 'MC',
      character_type: 'human',
      age: '42',
      occupation: 'Void Physicist',
      personality_traits: 'Brilliant, haunted, determined, slightly unhinged',
      abilities: 'Dimensional perception, void entity communication, reality manipulation',
      theme_color: '#8b5cf6',
      is_published: 1,
      sort_order: 1
    },
    {
      novel_id: 2,
      name: 'Captain Marcus Chen',
      description: 'Military commander of the void station Haven-1, struggling to protect humanity from threats beyond comprehension.',
      bio: 'A career military officer who has seen too much. Marcus has witnessed entire crews disappear into dimensional rifts and fought battles against enemies that shouldn\'t exist. His unwavering dedication to duty is both his strength and his curse.',
      role_type: 'Supporting',
      character_type: 'human',
      age: '38',
      occupation: 'Station Commander',
      personality_traits: 'Stoic, protective, pragmatic, haunted by loss',
      abilities: 'Military tactics, void combat training, leadership',
      theme_color: '#059669',
      is_published: 1,
      sort_order: 2
    },
    {
      novel_id: 2,
      name: 'The Whisper',
      description: 'A void entity that has learned to communicate with humans, offering knowledge in exchange for... something.',
      bio: 'Ancient beyond human comprehension, the Whisper exists in the spaces between thoughts. It claims to want to help humanity, but its true motivations remain unclear. Its very presence causes reality to become unstable.',
      role_type: 'Antagonist',
      character_type: 'void_entity',
      age: 'Timeless',
      occupation: 'Interdimensional Being',
      personality_traits: 'Alien, manipulative, patient, incomprehensible',
      abilities: 'Reality manipulation, telepathy, dimensional travel, knowledge of cosmic secrets',
      theme_color: '#dc2626',
      is_published: 1,
      sort_order: 3
    }
  ];

  characters.forEach(character => {
    insertCharacter.run(
      character.novel_id,
      character.name,
      character.description,
      character.bio,
      character.role_type,
      character.character_type,
      character.age,
      character.occupation,
      character.personality_traits,
      character.abilities,
      character.theme_color,
      character.is_published,
      character.sort_order
    );
  });

  // Add a sample chapter for the second novel
  const insertChapter = db.prepare(`
    INSERT OR IGNORE INTO chapters (novel_id, title, chapter_number, content, excerpt, word_count, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleChapter = {
    novel_id: 2,
    title: 'The First Tear',
    chapter_number: 1,
    content: `The void between dimensions screamed.

Dr. Elena Vasquez felt it more than heard it—a sound that existed in the spaces between thoughts, in the pauses between heartbeats. She pressed her palm against the observation deck's reinforced viewport, watching as reality tore itself apart fifty kilometers away.

"Initiating Void Drive test sequence seven-alpha," came the voice through the comm system. Clinical. Professional. As if they weren't about to punch a hole through the fabric of existence itself.

Elena had designed the equations that made this possible. Fourteen years of theoretical physics, of modeling impossible geometries, of dreaming in mathematics that human minds weren't meant to comprehend. Now, watching the prototype vessel disappear into a wound in space-time, she wondered if some knowledge was too dangerous to pursue.

The tear lingered longer than the models predicted. Thirty seconds. Forty-five. At one minute, Elena's instruments detected something moving in the darkness between realities.

Something looking back.

"Abort the test," she whispered, then louder: "ABORT THE TEST!"

But it was too late. The thing in the void had already seen them. And it was interested.

Elena's last coherent thought before the whispers began was that they should have listened to the philosophers instead of the engineers. Some doors, once opened, could never be closed again.

The age of humanity's innocence ended with the sound of reality tearing, and the first echo from the void.`,
    excerpt: 'The void between dimensions screamed. Dr. Elena Vasquez felt it more than heard it—a sound that existed in the spaces between thoughts, in the pauses between heartbeats.',
    word_count: 267,
    is_published: 1
  };

  insertChapter.run(
    sampleChapter.novel_id,
    sampleChapter.title,
    sampleChapter.chapter_number,
    sampleChapter.content,
    sampleChapter.excerpt,
    sampleChapter.word_count,
    sampleChapter.is_published
  );

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('Second novel setup completed successfully!');
  
  // Display summary
  const novelCount = db.prepare('SELECT COUNT(*) as count FROM novels').get().count;
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM content_sections WHERE novel_id = 2').get().count;
  const characterCount = db.prepare('SELECT COUNT(*) as count FROM characters WHERE novel_id = 2').get().count;
  const chapterCount = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE novel_id = 2').get().count;
  
  console.log(`\\nSummary for "Echoes of the Void":
- Total novels: ${novelCount}
- Content sections: ${contentCount}
- Characters: ${characterCount}
- Chapters: ${chapterCount}`);

} catch (error) {
  console.error('Second novel setup failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
