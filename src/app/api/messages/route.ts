import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/messages - Get all messages (admin only) or user's own messages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let query = 'SELECT m.*, u.username, u.email FROM messages m LEFT JOIN users u ON m.user_id = u.id';
    const params: any[] = [];

    if (user.role === 'admin') {
      // Admin can see all messages
      const conditions = [];
      if (type) {
        conditions.push('m.type = ?');
        params.push(type);
      }
      if (status) {
        conditions.push('m.status = ?');
        params.push(status);
      }
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    } else {
      // Users can only see their own messages
      query += ' WHERE m.user_id = ?';
      params.push(user.id);
      
      if (type) {
        query += ' AND m.type = ?';
        params.push(type);
      }
    }

    query += ' ORDER BY m.created_at DESC';

    const messages = db.prepare(query).all(...params);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/messages - Create new message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { type, subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ 
        error: 'Subject and message are required' 
      }, { status: 400 });
    }

    const insertMessage = db.prepare(`
      INSERT INTO messages (user_id, type, subject, message)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertMessage.run(
      user?.id || null,
      type || 'contact',
      subject,
      message
    );

    const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
