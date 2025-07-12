import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { userQueries } from '../src/lib/edgedb-queries';
import { hashPassword } from '../src/lib/auth-edgedb';

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user for EdgeDB...');
    
    // Check if admin user exists
    const existingAdmin = await userQueries.findByEmail('admin@forgedpacts.com');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminPassword = hashPassword('admin123');
    const adminUser = await userQueries.create({
      email: 'admin@forgedpacts.com',
      password_hash: adminPassword,
      username: 'admin',
      role: 'admin',
      is_admin: true
    }) as any;
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@forgedpacts.com');
    console.log('🔐 Password: admin123');
    console.log('👤 User ID:', adminUser?.id);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
