import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import client from '../src/lib/edgedb';

async function applySchema() {
  try {
    console.log('🔧 Applying EdgeDB schema manually...');
    
    // First, create Novel type (required for other types)
    console.log('Creating Novel type...');
    await client.execute(`
      CREATE TYPE Novel {
        CREATE REQUIRED PROPERTY title -> str;
        CREATE REQUIRED PROPERTY slug -> str {
          CREATE CONSTRAINT exclusive;
        };
        CREATE PROPERTY description -> str;
        CREATE PROPERTY cover_image_url -> str;
        CREATE PROPERTY genre -> str {
          SET default := 'Dark Fantasy';
        };
        CREATE PROPERTY status -> str {
          SET default := 'active';
          CREATE CONSTRAINT one_of('active', 'completed', 'hiatus', 'draft');
        };
        CREATE PROPERTY is_featured -> bool {
          SET default := false;
        };
        CREATE PROPERTY sort_order -> int32 {
          SET default := 0;
        };
        CREATE PROPERTY created_at -> datetime {
          SET default := datetime_current();
        };
        CREATE PROPERTY updated_at -> datetime {
          SET default := datetime_current();
        };
      }
    `);
    console.log('✅ Novel type created');

    // Create User type
    console.log('Creating User type...');
    await client.execute(`
      CREATE TYPE User {
        CREATE REQUIRED PROPERTY email -> str {
          CREATE CONSTRAINT exclusive;
        };
        CREATE REQUIRED PROPERTY password_hash -> str;
        CREATE REQUIRED PROPERTY username -> str {
          CREATE CONSTRAINT exclusive;
        };
        CREATE PROPERTY is_admin -> bool {
          SET default := false;
        };
        CREATE PROPERTY role -> str {
          SET default := 'reader';
          CREATE CONSTRAINT one_of('admin', 'writer', 'reader');
        };
        CREATE PROPERTY pen_name -> str;
        CREATE PROPERTY created_at -> datetime {
          SET default := datetime_current();
        };
        CREATE PROPERTY last_login -> datetime;
        CREATE PROPERTY is_active -> bool {
          SET default := true;
        };
      }
    `);
    console.log('✅ User type created');

    // Create Chapter type
    console.log('Creating Chapter type...');
    await client.execute(`
      CREATE TYPE Chapter {
        CREATE LINK novel -> Novel;
        CREATE REQUIRED PROPERTY title -> str;
        CREATE REQUIRED PROPERTY chapter_number -> int32;
        CREATE REQUIRED PROPERTY content -> str;
        CREATE PROPERTY excerpt -> str;
        CREATE PROPERTY word_count -> int32;
        CREATE PROPERTY is_published -> bool {
          SET default := false;
        };
        CREATE PROPERTY published_at -> datetime;
        CREATE PROPERTY created_at -> datetime {
          SET default := datetime_current();
        };
        CREATE PROPERTY updated_at -> datetime {
          SET default := datetime_current();
        };
      }
    `);
    console.log('✅ Chapter type created');

    // Create Character type
    console.log('Creating Character type...');
    await client.execute(`
      CREATE TYPE Character {
        CREATE LINK novel -> Novel;
        CREATE REQUIRED PROPERTY name -> str;
        CREATE PROPERTY description -> str;
        CREATE PROPERTY bio -> str;
        CREATE PROPERTY role_type -> str {
          SET default := 'Side';
          CREATE CONSTRAINT one_of('MC', 'Antagonist', 'Side', 'Supporting');
        };
        CREATE PROPERTY character_type -> str {
          SET default := 'human';
          CREATE CONSTRAINT one_of('demon', 'fae', 'human', 'hybrid', 'other');
        };
        CREATE PROPERTY age -> str;
        CREATE PROPERTY occupation -> str;
        CREATE PROPERTY location -> str;
        CREATE PROPERTY personality_traits -> str;
        CREATE PROPERTY abilities -> str;
        CREATE PROPERTY relationships -> str;
        CREATE PROPERTY appearance -> str;
        CREATE PROPERTY backstory -> str;
        CREATE PROPERTY motivation -> str;
        CREATE PROPERTY theme_color -> str {
          SET default := '#ef4444';
        };
        CREATE PROPERTY image_url -> str;
        CREATE PROPERTY is_published -> bool {
          SET default := false;
        };
        CREATE PROPERTY sort_order -> int32 {
          SET default := 0;
        };
        CREATE PROPERTY created_at -> datetime {
          SET default := datetime_current();
        };
        CREATE PROPERTY updated_at -> datetime {
          SET default := datetime_current();
        };
      }
    `);
    console.log('✅ Character type created');

    // Create Session type
    console.log('Creating Session type...');
    await client.execute(`
      CREATE TYPE Session {
        CREATE REQUIRED PROPERTY session_id -> str {
          CREATE CONSTRAINT exclusive;
        };
        CREATE REQUIRED LINK user -> User;
        CREATE REQUIRED PROPERTY expires_at -> datetime;
        CREATE PROPERTY created_at -> datetime {
          SET default := datetime_current();
        };
      }
    `);
    console.log('✅ Session type created');

    // Create ReadingProgress type
    console.log('Creating ReadingProgress type...');
    await client.execute(`
      CREATE TYPE ReadingProgress {
        CREATE REQUIRED LINK user -> User;
        CREATE REQUIRED LINK chapter -> Chapter;
        CREATE PROPERTY progress_percentage -> float32 {
          SET default := 0.0;
        };
        CREATE PROPERTY completed_at -> datetime;
        CREATE PROPERTY created_at -> datetime {
          SET default := datetime_current();
        };
        CREATE PROPERTY updated_at -> datetime {
          SET default := datetime_current();
        };
        CREATE CONSTRAINT exclusive ON ((.user, .chapter));
      }
    `);
    console.log('✅ ReadingProgress type created');

    // Create a default novel for the existing chapters
    console.log('Creating default novel...');
    await client.execute(`
      INSERT Novel {
        title := 'Forged Pacts',
        slug := 'forged-pacts',
        description := 'A dark fantasy novel about forged pacts and supernatural beings.',
        genre := 'Dark Fantasy',
        status := 'active',
        is_featured := true
      }
    `);
    console.log('✅ Default novel created');

    console.log('🎉 Schema applied successfully!');

  } catch (error) {
    console.error('❌ Error applying schema:', error);
  }
}

applySchema();
