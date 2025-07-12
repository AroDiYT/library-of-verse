import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import client from '../src/lib/edgedb';

// SQLite database path
const sqliteDbPath = './database/forgedpacts.db';

interface SQLiteUser {
  id: number;
  email: string;
  password_hash: string;
  username: string;
  is_admin: boolean;
  role: string;
  pen_name?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

interface SQLiteNovel {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  genre: string;
  status: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

async function migrateData() {
  console.log('Starting data migration from SQLite to EdgeDB...');
  
  // Open SQLite database
  const db = await open({
    filename: sqliteDbPath,
    driver: sqlite3.Database
  });

  try {
    // 1. Migrate Users
    console.log('Migrating users...');
    const users = await db.all('SELECT * FROM users') as SQLiteUser[];
    const userIdMap = new Map<number, string>();

    for (const user of users) {
      try {
        const edgeUser = await client.querySingle(`
          insert User {
            email := <str>$email,
            password_hash := <str>$password_hash,
            username := <str>$username,
            is_admin := <bool>$is_admin,
            role := <str>$role,
            pen_name := <optional str>$pen_name,
            is_active := <bool>$is_active
          }
        `, {
          email: user.email,
          password_hash: user.password_hash,
          username: user.username,
          is_admin: Boolean(user.is_admin),
          role: user.role,
          pen_name: user.pen_name || null,
          is_active: Boolean(user.is_active)
        }) as any;

        userIdMap.set(user.id, edgeUser.id);
        console.log(`✓ Migrated user: ${user.username}`);
      } catch (error) {
        console.error(`✗ Failed to migrate user ${user.username}:`, error);
      }
    }

    // 2. Migrate Novels
    console.log('Migrating novels...');
    const novels = await db.all('SELECT * FROM novels') as SQLiteNovel[];
    const novelIdMap = new Map<number, string>();

    for (const novel of novels) {
      try {
        const edgeNovel = await client.querySingle(`
          insert Novel {
            title := <str>$title,
            slug := <str>$slug,
            description := <optional str>$description,
            cover_image_url := <optional str>$cover_image_url,
            genre := <str>$genre,
            status := <str>$status,
            is_featured := <bool>$is_featured,
            sort_order := <int32>$sort_order
          }
        `, {
          title: novel.title,
          slug: novel.slug,
          description: novel.description || null,
          cover_image_url: novel.cover_image_url || null,
          genre: novel.genre,
          status: novel.status,
          is_featured: Boolean(novel.is_featured),
          sort_order: novel.sort_order
        }) as any;

        novelIdMap.set(novel.id, edgeNovel.id);
        console.log(`✓ Migrated novel: ${novel.title}`);
      } catch (error) {
        console.error(`✗ Failed to migrate novel ${novel.title}:`, error);
      }
    }

    // 3. Migrate Characters
    console.log('Migrating characters...');
    const characters = await db.all('SELECT * FROM characters');

    for (const character of characters) {
      try {
        const novelId = novelIdMap.get(character.novel_id);
        if (!novelId) {
          console.error(`✗ Novel ID ${character.novel_id} not found for character ${character.name}`);
          continue;
        }

        await client.querySingle(`
          insert Character {
            novel := (select Novel filter .id = <uuid>$novel_id),
            name := <str>$name,
            description := <optional str>$description,
            bio := <optional str>$bio,
            role_type := <str>$role_type,
            character_type := <str>$character_type,
            age := <optional str>$age,
            occupation := <optional str>$occupation,
            location := <optional str>$location,
            personality_traits := <optional str>$personality_traits,
            abilities := <optional str>$abilities,
            relationships := <optional str>$relationships,
            appearance := <optional str>$appearance,
            backstory := <optional str>$backstory,
            motivation := <optional str>$motivation,
            theme_color := <str>$theme_color,
            image_url := <optional str>$image_url,
            is_published := <bool>$is_published,
            sort_order := <int32>$sort_order
          }
        `, {
          novel_id: novelId,
          name: character.name,
          description: character.description || null,
          bio: character.bio || null,
          role_type: character.role_type || 'Side',
          character_type: character.character_type || 'human',
          age: character.age || null,
          occupation: character.occupation || null,
          location: character.location || null,
          personality_traits: character.personality_traits || null,
          abilities: character.abilities || null,
          relationships: character.relationships || null,
          appearance: character.appearance || null,
          backstory: character.backstory || null,
          motivation: character.motivation || null,
          theme_color: character.theme_color || '#ef4444',
          image_url: character.image_url || null,
          is_published: Boolean(character.is_published),
          sort_order: character.sort_order || 0
        });

        console.log(`✓ Migrated character: ${character.name}`);
      } catch (error) {
        console.error(`✗ Failed to migrate character ${character.name}:`, error);
      }
    }

    // 4. Migrate Chapters
    console.log('Migrating chapters...');
    const chapters = await db.all('SELECT * FROM chapters');

    for (const chapter of chapters) {
      try {
        const novelId = novelIdMap.get(chapter.novel_id);
        if (!novelId) {
          console.error(`✗ Novel ID ${chapter.novel_id} not found for chapter ${chapter.title}`);
          continue;
        }

        await client.querySingle(`
          insert Chapter {
            novel := (select Novel filter .id = <uuid>$novel_id),
            title := <str>$title,
            chapter_number := <int32>$chapter_number,
            content := <str>$content,
            excerpt := <optional str>$excerpt,
            word_count := <optional int32>$word_count,
            is_published := <bool>$is_published,
            published_at := <optional datetime>$published_at
          }
        `, {
          novel_id: novelId,
          title: chapter.title,
          chapter_number: chapter.chapter_number,
          content: chapter.content,
          excerpt: chapter.excerpt || null,
          word_count: chapter.word_count || null,
          is_published: Boolean(chapter.is_published),
          published_at: chapter.published_at ? new Date(chapter.published_at) : null
        });

        console.log(`✓ Migrated chapter: ${chapter.title}`);
      } catch (error) {
        console.error(`✗ Failed to migrate chapter ${chapter.title}:`, error);
      }
    }

    // 5. Migrate Region Cards
    console.log('Migrating region cards...');
    const regionCards = await db.all('SELECT * FROM region_cards');

    for (const card of regionCards) {
      try {
        const novelId = novelIdMap.get(card.novel_id);
        if (!novelId) {
          console.error(`✗ Novel ID ${card.novel_id} not found for region card ${card.name}`);
          continue;
        }

        await client.querySingle(`
          insert RegionCard {
            novel := (select Novel filter .id = <uuid>$novel_id),
            name := <str>$name,
            description := <optional str>$description,
            image_url := <optional str>$image_url,
            continent := <optional str>$continent,
            sort_order := <int32>$sort_order,
            theme_color := <str>$theme_color,
            border_color := <str>$border_color,
            background_color := <str>$background_color,
            hover_color := <str>$hover_color,
            icon := <str>$icon,
            layout_style := <str>$layout_style
          }
        `, {
          novel_id: novelId,
          name: card.name,
          description: card.description || null,
          image_url: card.image_url || null,
          continent: card.continent || null,
          sort_order: card.sort_order || 0,
          theme_color: card.theme_color || '#ef4444',
          border_color: card.border_color || 'border-gray-700',
          background_color: card.background_color || 'bg-gray-900',
          hover_color: card.hover_color || 'hover:border-red-700/50',
          icon: card.icon || '🏔️',
          layout_style: card.layout_style || 'vertical'
        });

        console.log(`✓ Migrated region card: ${card.name}`);
      } catch (error) {
        console.error(`✗ Failed to migrate region card ${card.name}:`, error);
      }
    }

    // 6. Migrate Content Sections
    console.log('Migrating content sections...');
    const contentSections = await db.all('SELECT * FROM content_sections');

    for (const section of contentSections) {
      try {
        const novelId = novelIdMap.get(section.novel_id);
        if (!novelId) {
          console.error(`✗ Novel ID ${section.novel_id} not found for content section ${section.title}`);
          continue;
        }

        await client.querySingle(`
          insert ContentSection {
            novel := (select Novel filter .id = <uuid>$novel_id),
            section_key := <str>$section_key,
            title := <str>$title,
            content := <str>$content,
            content_type := <str>$content_type,
            section_type := <str>$section_type,
            is_published := <bool>$is_published,
            sort_order := <int32>$sort_order,
            metadata := <optional str>$metadata
          }
        `, {
          novel_id: novelId,
          section_key: section.section_key,
          title: section.title,
          content: section.content,
          content_type: section.content_type || 'markdown',
          section_type: section.section_type,
          is_published: Boolean(section.is_published),
          sort_order: section.sort_order || 0,
          metadata: section.metadata || null
        });

        console.log(`✓ Migrated content section: ${section.title}`);
      } catch (error) {
        console.error(`✗ Failed to migrate content section ${section.title}:`, error);
      }
    }

    console.log('✅ Data migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.close();
  }
}

// Run migration
if (require.main === module) {
  migrateData().catch(console.error);
}

export { migrateData };
