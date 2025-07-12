const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'forgedpacts.db');
const db = new Database(dbPath);

console.log('Adding default content sections...');

try {
  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Check if we already have content sections
  const existingContent = db.prepare('SELECT COUNT(*) as count FROM content_sections').get().count;
  
  if (existingContent === 0) {
    console.log('No content found, inserting default content...');
    
    // Default About sections
    const aboutSections = [
      {
        novel_id: 1,
        section_key: 'about_story',
        title: 'The Story',
        content: `In a world where the ancient pacts between demons, fae, and humans are beginning to fracture, unlikely alliances must form to prevent chaos from consuming everything. This is a tale of complex characters navigating a landscape where trust is a luxury and survival demands sacrifice.

Forged Pacts explores the intricate relationships between three distinct realms, each with their own motivations, secrets, and desires. As the old agreements crumble, new bonds must be forged—but at what cost?

Every choice has consequences, and the line between hero and villain is written in shades of gray. This is a story where power comes with a price, and sometimes the greatest enemies make the strongest allies.`,
        content_type: 'markdown',
        section_type: 'about',
        is_published: 1,
        sort_order: 1
      },
      {
        novel_id: 1,
        section_key: 'about_author',
        title: 'About the Author',
        content: `A passionate storyteller with a love for dark fantasy and complex world-building, bringing years of creative writing experience to this ambitious project.

Currently writing new chapters weekly, crafting a narrative that explores the depths of character motivation and the consequences of power.

When not weaving tales of demons, fae, and mortal struggles, you can find me researching mythology, playing tabletop RPGs, and exploring the darker corners of fantasy literature.`,
        content_type: 'markdown',
        section_type: 'about',
        is_published: 1,
        sort_order: 2
      }
    ];

    // Default World sections
    const worldSections = [
      {
        novel_id: 1,
        section_key: 'world_overview',
        title: 'A World in Flux',
        content: `The world of Forged Pacts spans six great continents, each defined by its own philosophy, culture, and relationship with the supernatural forces that shape reality. From the economic powerhouses of Aurenhal to the mysterious forests of Thalorwyn, every realm tells a story of survival, adaptation, and the eternal struggle for power.

As ancient pacts crumble and new alliances form, the very foundations of this world are shifting. Trade routes become battlegrounds, sacred traditions face modern challenges, and the boundaries between realms blur in ways not seen for centuries.

The delicate balance between demons, fae, and humans hangs by a thread, and the choices made by individuals will determine whether civilization endures or falls to chaos.`,
        content_type: 'markdown',
        section_type: 'world',
        is_published: 1,
        sort_order: 1
      },
      {
        novel_id: 1,
        section_key: 'world_magic_system',
        title: 'The Pact Magic System',
        content: `Magic in this world operates through binding agreements between different supernatural entities. These pacts come in three primary forms:

**Demon Contracts**: Ancient agreements that bind demonic powers to mortal purposes. These pacts offer immense benefits but come with prices that compound over time. The more powerful the demon, the steeper the cost.

**Fae Bargains**: Ethereal agreements woven with magic and mystery. Fae bargains are bound by intention and wordplay, where literal meaning matters less than intent. They're beautiful, unpredictable, and often have unexpected consequences.

**Human Alliances**: Political and military agreements between mortal nations. Built on trust, mutual benefit, and the shared goal of survival in a supernatural world. While less immediately powerful than supernatural pacts, they form the backbone of civilization.

The breaking of any pact sends ripples through the magical fabric of reality, affecting not just the immediate parties but the world at large.`,
        content_type: 'markdown',
        section_type: 'world',
        is_published: 1,
        sort_order: 2
      }
    ];

    // Default Region sections
    const regionSections = [
      {
        novel_id: 1,
        section_key: 'region_aurenhal',
        title: 'Aurenhal - The Economic Heart',
        content: `Where power is brokered, not conquered. Major trading houses made forbidden pacts with demons to protect caravans and sabotage rival merchants. Prosperity is built on shadowy transactions.

**Key Locations:**
- Kingdom of Khonrud: The financial capital where demon-blessed coins never tarnish
- Principality of Temnaleia: Home to the infamous Shadow Markets
- Duchy of Neinë: Where the Guild of Sealed Contracts operates
- Republic of Halvora: The only nation attempting to ban supernatural trade agreements

The continent thrives on commerce, but beneath the golden exterior lies a web of supernatural debt that grows more complex with each passing day.`,
        content_type: 'markdown',
        section_type: 'region',
        is_published: 1,
        sort_order: 1
      },
      {
        novel_id: 1,
        section_key: 'region_venaroth',
        title: 'Venaroth - Bastion of Purity',
        content: `Fiercely loyal to humanity. Its nations refuse all demon dealings, upholding traditions of purity, honor, and valor in battle. To be human here is a badge of sacred duty.

**The Pure Code:**
- No supernatural pacts of any kind
- Strict bloodline verification for citizenship
- Mandatory military service to defend against supernatural incursion
- Death penalty for anyone caught making demon contracts

**Key Nations:**
- Empire of Veneara: The continent's military superpower
- Protectorate of Phacosia: Known for their demon hunters
- Grand Duchy of Shen: Masters of anti-magic warfare
- Sultanate of Qessan: Desert warriors with blessed weapons

Despite their rejection of supernatural aid, Venaroth has developed the most advanced mundane military technology in the world.`,
        content_type: 'markdown',
        section_type: 'region',
        is_published: 1,
        sort_order: 2
      }
    ];

    // Insert all content sections
    const insertSection = db.prepare(`
      INSERT INTO content_sections (novel_id, section_key, title, content, content_type, section_type, is_published, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    console.log(`Inserted ${aboutSections.length + worldSections.length + regionSections.length} content sections.`);
  } else {
    console.log(`Found ${existingContent} existing content sections, skipping default content insertion.`);
  }

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('Content setup completed successfully!');
  
  // Display summary
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM content_sections').get().count;
  const aboutCount = db.prepare("SELECT COUNT(*) as count FROM content_sections WHERE section_type = 'about'").get().count;
  const worldCount = db.prepare("SELECT COUNT(*) as count FROM content_sections WHERE section_type = 'world'").get().count;
  const regionCount = db.prepare("SELECT COUNT(*) as count FROM content_sections WHERE section_type = 'region'").get().count;
  
  console.log(`\\nContent Summary:
- Total sections: ${contentCount}
- About sections: ${aboutCount}
- World sections: ${worldCount}
- Region sections: ${regionCount}`);

} catch (error) {
  console.error('Content setup failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
