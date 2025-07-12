import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/suggestions - Get all suggestions with vote counts
export async function GET() {
  try {
    const user = await getCurrentUser();

    const suggestions = db.prepare(`
      SELECT 
        s.*,
        u.username,
        COUNT(sv.id) as votes,
        CASE WHEN ? IS NOT NULL THEN
          (SELECT COUNT(*) FROM suggestion_votes WHERE suggestion_id = s.id AND user_id = ?) > 0
        ELSE 0 END as user_voted
      FROM suggestions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN suggestion_votes sv ON s.id = sv.suggestion_id
      GROUP BY s.id, s.title, s.description, s.category, s.status, s.priority, s.user_id, s.admin_notes, s.created_at, s.updated_at, u.username
      ORDER BY votes DESC, s.created_at DESC
    `).all(user?.id || null, user?.id || null);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/suggestions - Create a new suggestion
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { title, description, category } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const insertSuggestion = db.prepare(`
      INSERT INTO suggestions (title, description, category, user_id)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertSuggestion.run(title, description, category || 'Feature', user.id);

    // Get the created suggestion with user info
    const newSuggestion = db.prepare(`
      SELECT 
        s.*,
        u.username,
        0 as votes,
        0 as user_voted
      FROM suggestions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
