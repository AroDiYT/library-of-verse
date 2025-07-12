import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// POST /api/suggestions/[id]/vote - Toggle vote for a suggestion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const suggestionId = parseInt(idParam);
    if (isNaN(suggestionId)) {
      return NextResponse.json({ error: 'Invalid suggestion ID' }, { status: 400 });
    }

    // Check if suggestion exists
    const suggestion = db.prepare('SELECT id FROM suggestions WHERE id = ?').get(suggestionId);
    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    // Check if user has already voted
    const existingVote = db.prepare(
      'SELECT id FROM suggestion_votes WHERE suggestion_id = ? AND user_id = ?'
    ).get(suggestionId, user.id) as { id: number } | undefined;

    if (existingVote) {
      // Remove vote
      db.prepare('DELETE FROM suggestion_votes WHERE id = ?').run(existingVote.id);
    } else {
      // Add vote
      db.prepare('INSERT INTO suggestion_votes (suggestion_id, user_id) VALUES (?, ?)').run(
        suggestionId,
        user.id
      );
    }

    // Get updated vote count
    const voteCount = db.prepare(
      'SELECT COUNT(*) as count FROM suggestion_votes WHERE suggestion_id = ?'
    ).get(suggestionId) as { count: number };

    return NextResponse.json({ 
      voted: !existingVote,
      votes: voteCount.count 
    });
  } catch (error) {
    console.error('Error toggling vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
