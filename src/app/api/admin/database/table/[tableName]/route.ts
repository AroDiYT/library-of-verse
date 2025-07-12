import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableName: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const tableName = resolvedParams.tableName;

    // Security check - only allow specific tables
    const allowedTables = [
      'novels', 'users', 'chapters', 'content_sections', 'region_cards', 
      'suggestions', 'suggestion_votes', 'reading_progress'
    ];

    if (!allowedTables.includes(tableName)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    // Get column information
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const columnNames = columns.map((col: any) => col.name);

    // Get table data with limit
    const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT 100`).all();

    return NextResponse.json({
      columns: columnNames,
      rows: rows,
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
