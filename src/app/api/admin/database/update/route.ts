import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { table, data } = await request.json();

    // Security check - only allow specific tables
    const allowedTables = [
      'novels', 'users', 'chapters', 'content_sections', 'region_cards', 
      'suggestions', 'suggestion_votes', 'reading_progress'
    ];

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    if (!data.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Get column information to build dynamic query
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    const columnNames = columns.map((col: any) => col.name).filter(name => name !== 'id');

    // Build SET clause
    const setClause = columnNames
      .filter(col => data.hasOwnProperty(col))
      .map(col => `${col} = ?`)
      .join(', ');

    const values = columnNames
      .filter(col => data.hasOwnProperty(col))
      .map(col => data[col]);

    values.push(data.id);

    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    db.prepare(query).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { table, id } = await request.json();

    // Security check - only allow specific tables
    const allowedTables = [
      'novels', 'users', 'chapters', 'content_sections', 'region_cards', 
      'suggestions', 'suggestion_votes', 'reading_progress'
    ];

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const query = `DELETE FROM ${table} WHERE id = ?`;
    db.prepare(query).run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
