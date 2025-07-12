const Database = require('better-sqlite3');
const path = require('path');

// Open database connection
const db = new Database(path.join(__dirname, '..', 'database', 'forgedpacts.db'));

console.log('🚀 Adding second novel with test data...');

try {
  // Start transaction
  const transaction = db.transaction(() => {
    // Insert second novel
    const insertNovel = db.prepare(`
      INSERT OR IGNORE INTO novels (id, title, slug, description, genre, status, is_featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNovel.run(
      2,
      'Echoes of the Void',
      'echoes-of-the-void',
      'In the depths of space, ancient technologies awaken and cosmic entities stir. A sci-fi epic where humanity must face the consequences of disturbing forces beyond comprehension.',
      'Science Fiction',
      'active',
      0, // false as 0
      2
    );

    // Add content sections for the second novel
    const insertContent = db.prepare(`
      INSERT OR IGNORE INTO content_sections (novel_id, section_key, title, content, content_type, section_type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // About content
    insertContent.run(
      2,
      'about_story',
      'The Story',
      `# Echoes of the Void

In the year 2387, humanity has spread across the galaxy, establishing colonies on distant worlds and unlocking technologies that seemed impossible centuries ago. But progress comes with a price.

When the deep space mining vessel *Prometheus* discovers an ancient artifact buried in the core of a dead planet, they unwittingly awaken something that has been dormant for millennia. The artifact—a crystalline structure of impossible geometry—begins emitting signals that resonate across dimensions.

Dr. Elena Vasquez, the expedition's xenoarchaeologist, realizes too late that the artifact isn't just a relic—it's a beacon. And something in the void between stars has been waiting for its call.

As reality begins to fracture around the artifact's influence, the crew must confront the possibility that some boundaries were never meant to be crossed. The void stares back, and it hungers for more than just their souls.`,
      'markdown',
      'about',
      1
    );

    insertContent.run(
      2,
      'about_author',
      'About the Author',
      `The author brings a passion for hard science fiction and cosmic horror to *Echoes of the Void*, drawing inspiration from both cutting-edge scientific discoveries and humanity's eternal fascination with the unknown.

With a background in physics and astronomy, the story explores themes of scientific hubris, cosmic insignificance, and the terrifying beauty of the universe's deepest mysteries.

*Echoes of the Void* represents a departure from traditional fantasy into the realm of science fiction, where technology and terror intertwine in the vast emptiness between stars.`,
      'markdown',
      'about',
      2
    );

    insertContent.run(
      2,
      'about_inspiration',
      'Inspiration',
      `*Echoes of the Void* draws inspiration from classic works of cosmic horror and hard science fiction, exploring what happens when humanity's reach exceeds its understanding.

The story examines themes of isolation, the unknown, and the consequences of disturbing forces beyond human comprehension. Each chapter builds tension while exploring the vast scales of space and time that dwarf human existence.

The narrative asks fundamental questions: What if we're not alone? What if we're not the first? And most terrifyingly—what if something out there has been waiting for us to find it?`,
      'markdown',
      'about',
      3
    );

    // World content
    insertContent.run(
      2,
      'world_overview',
      'The Universe of 2387',
      `## The Terran Colonial Federation

By 2387, humanity has established the Terran Colonial Federation, spanning over 200 star systems. Faster-than-light travel through quantum tunneling drives has made interstellar commerce and communication possible, though still limited by the vast distances involved.

### Technology

- **Quantum Tunneling Drives**: Enable FTL travel, but require massive energy and precision
- **Neural Interface Systems**: Direct brain-computer interfaces for ship operation and data analysis  
- **Molecular Assemblers**: Advanced 3D printing technology for manufacturing in space
- **Psionic Resonators**: Experimental devices that amplify human psychic potential

### The Frontier

The outer rim territories remain largely unexplored, home to mining operations, research stations, and the occasional rogue colony. It's here, in the darkness between stars, that the *Prometheus* made its fateful discovery.`,
      'markdown',
      'world',
      1
    );

    insertContent.run(
      2,
      'region_core_worlds',
      'Core Worlds',
      `## The Core Worlds

The heart of human civilization, these dozen star systems house the majority of humanity's population and industrial capacity.

**Sol System**: Earth remains the political center, though much of its surface is now covered by arcologies housing billions.

**Alpha Centauri**: The first successful colony, now a major industrial hub with artificial ring habitats.

**Vega Station**: The Federation's primary research center, home to the most advanced laboratories and the Psionic Research Division.

### Characteristics
- Dense population centers
- Advanced infrastructure  
- Heavy regulation and oversight
- Limited access to experimental technologies`,
      'markdown',
      'world',
      2
    );

    insertContent.run(
      2,
      'region_rim_territories',
      'Rim Territories',
      `## The Rim Territories

The frontier of human expansion, where miners, researchers, and pioneers push the boundaries of known space.

**Mining Sectors**: Automated operations extract rare elements from dead worlds and asteroid fields.

**Research Outposts**: Small teams study everything from exotic matter to potential signs of alien life.

**Deep Space Monitoring**: Arrays of sensors watch for anomalies in the cosmic background radiation.

### Characteristics
- Sparse population
- Minimal oversight
- Dangerous working conditions
- High profit potential
- Unknown dangers`,
      'markdown',
      'world',
      3
    );

    // Add characters for the second novel
    const insertCharacter = db.prepare(`
      INSERT OR IGNORE INTO characters (
        novel_id, name, description, bio, role_type, character_type, age, occupation, location,
        personality_traits, abilities, relationships, appearance, backstory, motivation, theme_color,
        is_published, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Dr. Elena Vasquez - Main Character
    insertCharacter.run(
      2,
      'Dr. Elena Vasquez',
      'A brilliant xenoarchaeologist whose discovery changes everything',
      `Dr. Elena Vasquez is the lead xenoarchaeologist aboard the mining vessel *Prometheus*. Her expertise in alien artifacts and ancient civilizations made her the natural choice for investigating unusual discoveries on the rim territories.

Elena has spent her career searching for proof that humanity is not alone in the universe. Her methodical approach and scientific rigor have earned respect throughout the academic community, but her theories about ancient cosmic civilizations have also made her controversial.

When the *Prometheus* discovers the crystalline artifact, Elena's excitement blinds her to the danger. By the time she realizes what they've found, it may be too late to contain the consequences.`,
      'MC',
      'human',
      '34',
      'Xenoarchaeologist',
      'Deep Space Mining Vessel Prometheus',
      'Methodical, curious, determined, sometimes reckless in pursuit of knowledge',
      'Expert in alien languages and artifacts, enhanced neural interface capabilities',
      'Close colleague Dr. Marcus Chen, romantic tension with Captain Rivera',
      'Petite with dark hair often tied back, intense brown eyes, usually wearing practical field gear',
      'Grew up on Mars Colony, lost her parents in a transport accident, driven to prove alien life exists',
      'To unlock the secrets of the universe and prove humanity is not alone',
      '#3b82f6',
      1,
      1
    );

    // Captain Sofia Rivera - Supporting Character
    insertCharacter.run(
      2,
      'Captain Sofia Rivera',
      'The steady commander of the Prometheus, trying to keep her crew alive',
      `Captain Sofia Rivera has commanded deep space mining operations for over a decade. Her calm leadership and practical approach have kept crews alive in the dangerous rim territories where equipment failures and cosmic radiation are constant threats.

When the artifact begins affecting her crew, Rivera must balance her duty to complete the mission with her responsibility to protect her people. As reality starts breaking down around them, she becomes the anchor that keeps the crew grounded.

Rivera's military background and natural leadership make her a formidable opponent for whatever forces the artifact has awakened, but she's fighting an enemy that doesn't follow any rules she understands.`,
      'Supporting',
      'human',
      '42',
      'Ship Captain',
      'Deep Space Mining Vessel Prometheus',
      'Calm under pressure, protective of crew, pragmatic, decisive',
      'Expert pilot and navigator, natural leadership abilities, combat training',
      'Professional respect for Dr. Vasquez, protective of engineer Kowalski',
      'Tall and athletic, short graying hair, weathered hands from years of ship work',
      'Former military officer, turned to civilian mining after a classified incident',
      'To protect her crew and complete missions safely',
      '#10b981',
      1,
      2
    );

    // The Void Entity - Antagonist
    insertCharacter.run(
      2,
      'The Void Whispers',
      'Ancient intelligences from between the stars',
      `The entities that respond to the artifact's signal exist in the spaces between dimensions, in the quantum foam that underlies reality itself. They are not bound by physical form or linear time, experiencing existence as a vast web of probability and potential.

These beings were old when the first stars formed, watching as countless civilizations rose and fell across the galaxy. They seed the universe with artifacts—beacons that call to them when discovered by minds capable of understanding their purpose.

The Void Whispers do not seek to destroy in the conventional sense. They hunger for consciousness itself, for the unique patterns of thought and experience that living beings create. To them, absorbing a mind is not murder but preservation—a way to add new perspectives to their eternal collective.`,
      'Antagonist',
      'other',
      'Eternal',
      'Cosmic Entity',
      'The Void Between Dimensions',
      'Ancient, patient, incomprehensibly alien, curious about human consciousness',
      'Dimensional manipulation, telepathic influence, reality distortion, consciousness absorption',
      'Connected to all other Void entities across space and time',
      'No fixed form - appears as shifting shadows, impossible geometries, whispers in empty space',
      'Existed since before the formation of galaxies, seeded the universe with beckoning artifacts',
      'To understand and absorb consciousness, to add new perspectives to their collective',
      '#6366f1',
      1,
      3
    );

    // Add a sample chapter
    const insertChapter = db.prepare(`
      INSERT OR IGNORE INTO chapters (novel_id, title, chapter_number, content, excerpt, word_count, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const chapterContent = `# Chapter 1: The Discovery

The *Prometheus* hung in the void like a metallic spear thrust into the heart of darkness. Captain Sofia Rivera stood on the bridge, watching the mining drones work their way through the asteroid field with mechanical precision. Each drone's cutting laser painted brief stars against the cosmic black, illuminating chunks of rock that had been drifting here since the solar system's formation.

"Contact on drone seven," reported Lieutenant Chen from the sensor station. "Metallic signature, but it's not reading as any known mineral."

Rivera moved to look over his shoulder. The holographic display showed a three-dimensional map of the asteroid field, with drone seven highlighted as it approached an object roughly the size of a shuttle.

"Dr. Vasquez," Rivera called to the xenoarchaeologist who was reviewing survey data at the science station. "Your expertise is needed."

Elena Vasquez looked up from her tablet, her dark eyes bright with interest. She'd been hoping for something unusual—the rim territories were full of standard mining operations, but discoveries that required her particular skills were rare.

"What do we have?" she asked, joining them at the sensor display.

"Unknown metallic object, partially embedded in asteroid 7-Alpha," Chen reported. "Drone sensors are having trouble getting a clear reading. Whatever it is, it's interfering with our equipment."

Elena's pulse quickened. In twelve years of deep space archaeology, she'd investigated hundreds of "anomalies" that turned out to be unusual mineral formations or debris from ancient mining operations. But equipment interference was different. That suggested active technology.

"Can we extract it?" she asked Rivera.

The captain studied the display, calculating risks. The *Prometheus* wasn't a research vessel—it was a mining operation with deadlines and quotas. But standing orders were clear: any potential alien artifacts were to be secured and reported immediately.

"We can try," Rivera decided. "But carefully. I don't want any surprises."

Two hours later, the object floated in the *Prometheus*'s main cargo bay, secured behind emergency containment barriers. It was beautiful in a way that made Elena's breath catch—a crystalline structure roughly three meters long, its surface covered in geometric patterns that seemed to shift when viewed directly.

"Scans show it's definitely artificial," reported Dr. Marcus Chen, Elena's colleague and the ship's xenobiologist. "The internal structure is impossibly complex. Whatever built this had technology far beyond our current capabilities."

Elena approached the containment barrier, studying the artifact through the transparent aluminum. The patterns on its surface weren't random—they were definitely some kind of writing or symbolic system. But as she watched, the symbols seemed to rearrange themselves, forming new configurations that hurt to look at directly.

"It's responding to observation," she whispered. "It knows we're here."

Behind her, Captain Rivera frowned. "That's impossible. It's just a piece of crystallized metal."

But Elena wasn't listening. She was transfixed by the way the symbols moved, forming patterns that spoke to something deep in her mind. Without thinking, she reached out and placed her palm against the containment barrier.

The moment her skin touched the surface, the artifact pulsed with brilliant light.

And somewhere in the vast emptiness between stars, something ancient turned its attention toward the *Prometheus*.

Elena jerked her hand back, but it was too late. The beacon had been activated, its signal racing across dimensions at speeds that made light seem motionless. In the depths of space, entities that had been dormant for millennia began to stir.

"Dr. Vasquez," Rivera said sharply. "Step away from the artifact."

But Elena barely heard her. In her mind, whispers had begun—voices speaking in languages that predated human civilization, promising knowledge beyond imagination. All she had to do was listen.

All she had to do was let them in.`;

    insertChapter.run(
      2,
      'The Discovery',
      1,
      chapterContent,
      'The mining vessel Prometheus discovers an ancient artifact that changes everything...',
      650,
      1
    );

    console.log('✅ Successfully added novel "Echoes of the Void" with test data!');
    console.log('   - Novel entry created');
    console.log('   - 3 content sections (about)');
    console.log('   - 3 world/region sections');
    console.log('   - 3 characters');
    console.log('   - 1 sample chapter');
  });

  // Execute transaction
  transaction();

} catch (error) {
  console.error('❌ Error adding second novel:', error);
} finally {
  db.close();
  console.log('Database connection closed.');
}
