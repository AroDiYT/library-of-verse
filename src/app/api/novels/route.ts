import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/novels - Get all novels
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    let query = 'SELECT * FROM novels';
    const params: any[] = [];

    if (user?.role === 'writer') {
      // Writers can only see their own novels
      query += ' WHERE author_id = ?';
      params.push(user.id);
    } else if (user?.role !== 'admin') {
      // Regular users only see active novels
      query += ' WHERE status = ?';
      params.push('active');
    }

    query += ' ORDER BY is_featured DESC, sort_order ASC, created_at ASC';

    const novels = db.prepare(query).all(...params);
    return NextResponse.json(novels);
  } catch (error) {
    console.error('Error fetching novels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/novels - Create new novel (admin or writer)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { 
      title, 
      slug, 
      description, 
      cover_image_url, 
      genre, 
      status, 
      is_featured, 
      sort_order,
      author,
      theme_primary_color,
      theme_secondary_color,
      theme_accent_color,
      theme_background_color,
      theme_text_color
    } = await request.json();

    if (!title || !slug) {
      return NextResponse.json({ 
        error: 'title and slug are required' 
      }, { status: 400 });
    }

    const insertNovel = db.prepare(`
      INSERT INTO novels (
        title, 
        slug, 
        description, 
        cover_image_url, 
        genre, 
        status, 
        is_featured, 
        sort_order,
        author,
        author_id,
        theme_primary_color,
        theme_secondary_color,
        theme_accent_color,
        theme_background_color,
        theme_text_color
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertNovel.run(
      title,
      slug,
      description || null,
      cover_image_url || null,
      genre || 'Dark Fantasy',
      status || 'active',
      is_featured ? 1 : 0, // Convert boolean to integer for SQLite
      parseInt(sort_order?.toString()) || 0, // Ensure integer
      author || user.pen_name || user.username, // Use provided author, pen name, or fallback to username
      user.id, // Set author_id to current user
      theme_primary_color || '#8b5cf6',
      theme_secondary_color || '#c084fc',
      theme_accent_color || '#a855f7',
      theme_background_color || '#1e1b4b',
      theme_text_color || '#e2e8f0'
    );

    // Get the created novel
    const newNovel = db.prepare('SELECT * FROM novels WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(newNovel, { status: 201 });
  } catch (error: any) {
    console.error('Error creating novel:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
