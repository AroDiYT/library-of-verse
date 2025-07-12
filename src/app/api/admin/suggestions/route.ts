import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/admin/suggestions - Get all suggestions for admin review
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const suggestions = db.prepare(`
      SELECT 
        s.*,
        u.username,
        COUNT(sv.id) as votes
      FROM suggestions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN suggestion_votes sv ON s.id = sv.suggestion_id
      GROUP BY s.id, s.title, s.description, s.category, s.status, s.priority, s.user_id, s.admin_notes, s.created_at, s.updated_at, u.username
      ORDER BY s.created_at DESC
    `).all();

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching admin suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/suggestions - Update suggestion status/priority/notes
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, status, priority, admin_notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Suggestion ID is required' }, { status: 400 });
    }

    const updateSuggestion = db.prepare(`
      UPDATE suggestions 
      SET status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          admin_notes = COALESCE(?, admin_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = updateSuggestion.run(status, priority, admin_notes, id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    // Get updated suggestion
    const updatedSuggestion = db.prepare(`
      SELECT 
        s.*,
        u.username,
        COUNT(sv.id) as votes
      FROM suggestions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN suggestion_votes sv ON s.id = sv.suggestion_id
      WHERE s.id = ?
      GROUP BY s.id, s.title, s.description, s.category, s.status, s.priority, s.user_id, s.admin_notes, s.created_at, s.updated_at, u.username
    `).get(id);

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    console.error('Error updating suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
