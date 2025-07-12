import { NextRequest, NextResponse } from 'next/server';
import db, { sessionQueries } from '@/lib/database';

// GET /api/admin/users/[id] - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const user = db.prepare(`
      SELECT 
        id, email, username, is_admin, role, pen_name, is_active, created_at, last_login
      FROM users 
      WHERE id = ?
    `).get(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, username, password, is_admin, role, pen_name, is_active } = body;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-demotion (admin can't remove their own admin status)
    if (session.user_id === parseInt(id) && is_admin === false) {
      return NextResponse.json({ 
        error: 'You cannot remove your own admin privileges' 
      }, { status: 400 });
    }

    // Check for duplicate email/username if they're being changed
    if (email || username) {
      const duplicateCheck = db.prepare(`
        SELECT id FROM users 
        WHERE (email = ? OR username = ?) AND id != ?
      `).get(email || '', username || '', id);
      
      if (duplicateCheck) {
        return NextResponse.json({ 
          error: 'A user with this email or username already exists' 
        }, { status: 400 });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (password) {
      const bcrypt = require('bcryptjs');
      const passwordHash = bcrypt.hashSync(password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }
    if (is_admin !== undefined) {
      updates.push('is_admin = ?');
      values.push(is_admin ? 1 : 0);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (pen_name !== undefined) {
      updates.push('pen_name = ?');
      values.push(pen_name || null);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);

    // Get updated user
    const updatedUser = db.prepare(`
      SELECT 
        id, email, username, is_admin, is_active, created_at, last_login
      FROM users 
      WHERE id = ?
    `).get(id);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Prevent self-deletion
    if (session.user_id === parseInt(id)) {
      return NextResponse.json({ 
        error: 'You cannot delete your own account' 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user sessions first
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    
    // Delete user reading progress
    db.prepare('DELETE FROM reading_progress WHERE user_id = ?').run(id);
    
    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
