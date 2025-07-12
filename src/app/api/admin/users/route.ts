import { NextRequest, NextResponse } from 'next/server';
import db, { sessionQueries } from '@/lib/database';

// GET /api/admin/users - Get all users for admin
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = db.prepare(`
      SELECT 
        id, email, username, is_admin, role, pen_name, is_active, created_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
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

    if (!email || !username || !password) {
      return NextResponse.json({ 
        error: 'Email, username, and password are required' 
      }, { status: 400 });
    }

    // Check if user with same email or username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      return NextResponse.json({ 
        error: 'A user with this email or username already exists' 
      }, { status: 400 });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (email, username, password_hash, is_admin, role, pen_name, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      email, 
      username, 
      passwordHash, 
      is_admin ? 1 : 0, 
      role || 'reader',
      pen_name || null,
      is_active !== false ? 1 : 0
    );

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: result.lastInsertRowid, 
        email, 
        username, 
        is_admin: Boolean(is_admin), 
        role: role || 'reader',
        pen_name: pen_name || null,
        is_active: Boolean(is_active ?? true) 
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}
