import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// PATCH /api/messages/[id] - Update message status or add admin response
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const messageId = parseInt(idParam);
    const { status, admin_response } = await request.json();

    const updateMessage = db.prepare(`
      UPDATE messages 
      SET 
        status = COALESCE(?, status),
        admin_response = COALESCE(?, admin_response),
        admin_responder_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = updateMessage.run(
      status || null,
      admin_response || null,
      user.id,
      messageId
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const updatedMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
