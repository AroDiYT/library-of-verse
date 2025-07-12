import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/writer-applications - Get all applications (admin only) or user's own application
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = 'SELECT wa.*, u.username, u.email FROM writer_applications wa LEFT JOIN users u ON wa.user_id = u.id';
    const params: any[] = [];

    if (user.role === 'admin') {
      // Admin can see all applications
      if (status) {
        query += ' WHERE wa.status = ?';
        params.push(status);
      }
    } else {
      // Users can only see their own applications
      query += ' WHERE wa.user_id = ?';
      params.push(user.id);
      
      if (status) {
        query += ' AND wa.status = ?';
        params.push(status);
      }
    }

    query += ' ORDER BY wa.created_at DESC';

    const applications = db.prepare(query).all(...params);
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching writer applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/writer-applications - Submit writer application
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { 
      pen_name, 
      writing_experience, 
      genre_interests, 
      sample_work, 
      why_verse 
    } = await request.json();

    if (!pen_name || !writing_experience || !why_verse) {
      return NextResponse.json({ 
        error: 'Pen name, writing experience, and why you want to write for Verse are required' 
      }, { status: 400 });
    }

    // Check if user already has a pending application
    const existingApp = db.prepare('SELECT id FROM writer_applications WHERE user_id = ? AND status = ?').get(user.id, 'pending');
    if (existingApp) {
      return NextResponse.json({ 
        error: 'You already have a pending writer application' 
      }, { status: 400 });
    }

    // Create a message for the application
    const insertMessage = db.prepare(`
      INSERT INTO messages (user_id, type, subject, message)
      VALUES (?, ?, ?, ?)
    `);

    const messageSubject = `Writer Application from ${pen_name}`;
    const messageText = `New writer application submitted by ${user.username} (${user.email})\n\nPen Name: ${pen_name}\n\nWhy Verse: ${why_verse}`;

    const messageResult = insertMessage.run(user.id, 'writer_application', messageSubject, messageText);

    // Create the writer application
    const insertApplication = db.prepare(`
      INSERT INTO writer_applications (
        user_id, 
        message_id, 
        pen_name, 
        writing_experience, 
        genre_interests, 
        sample_work, 
        why_verse
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const appResult = insertApplication.run(
      user.id,
      messageResult.lastInsertRowid,
      pen_name,
      writing_experience,
      genre_interests || null,
      sample_work || null,
      why_verse
    );

    const newApplication = db.prepare('SELECT * FROM writer_applications WHERE id = ?').get(appResult.lastInsertRowid);
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating writer application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
