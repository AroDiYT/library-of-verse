import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import client from '../src/lib/edgedb';

async function testEdgeDBConnection() {
  try {
    console.log('Testing EdgeDB connection...');
    console.log('EDGEDB_INSTANCE:', process.env.EDGEDB_INSTANCE ? 'set' : 'not set');
    console.log('EDGEDB_SECRET_KEY:', process.env.EDGEDB_SECRET_KEY ? 'set' : 'not set');
    
    // Test basic connection
    const result = await client.querySingle('select 1 + 1');
    console.log('✅ EdgeDB connection successful, test query result:', result);
    
    // Test schema exists
    const tables = await client.query(`
      select schema::ObjectType {
        name
      }
      filter .name like 'default::%'
      order by .name
    `);
    
    console.log('📋 Available types in schema:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.name}`);
    });

    // Create a test novel if schema is ready
    try {
      const testNovel = await client.querySingle(`
        insert Novel {
          title := "Test Novel",
          slug := "test-novel-" + <str>random(),
          description := "A test novel for EdgeDB migration",
          genre := "Test",
          status := "draft"
        }
      `);
      
      console.log('✅ Test novel created:', testNovel);

      // Clean up test novel
      await client.querySingle(`
        delete Novel filter .slug like "test-novel-%"
      `);
      
      console.log('🧹 Test novel cleaned up');
      
    } catch (schemaError) {
      console.log('⚠️ Schema not yet applied. Please run: npx edgedb migrate');
      console.log('Schema error:', schemaError);
    }

  } catch (error) {
    console.error('❌ EdgeDB connection failed:', error);
    console.log('\n🔧 Please check:');
    console.log('1. Your EdgeDB instance is running');
    console.log('2. Environment variables are set correctly');
    console.log('3. Network connectivity to EdgeDB');
  }
}

// Run the test
testEdgeDBConnection();
