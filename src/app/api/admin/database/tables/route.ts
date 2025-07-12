import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get list of tables
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      ORDER BY name
    `).all();

    // Get column info for each table
    const tablesWithColumns = tables.map((table: any) => {
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      return {
        name: table.name,
        columns: columns.map((col: any) => col.name),
      };
    });

    return NextResponse.json(tablesWithColumns);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
