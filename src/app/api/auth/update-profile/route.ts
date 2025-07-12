import { NextRequest, NextResponse } from 'next/server';
import db, { userQueries, sessionQueries } from '@/lib/database';

export async function PUT(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { username, email } = await req.json();

    if (!username || !email) {
      return NextResponse.json({ error: 'Username and email are required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Username validation
    if (username.length < 3 || username.length > 50) {
      return NextResponse.json({ error: 'Username must be between 3 and 50 characters' }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existingEmailUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, session.user_id);
    if (existingEmailUser) {
      return NextResponse.json({ error: 'Email is already taken' }, { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUsernameUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, session.user_id);
    if (existingUsernameUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Update the user
    const updateUser = db.prepare(`
      UPDATE users 
      SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    updateUser.run(username, email, session.user_id);

    // Get the updated user data
    const updatedUser = userQueries.findById.get(session.user_id) as any;

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        is_admin: updatedUser.is_admin === 1,
        created_at: updatedUser.created_at,
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
