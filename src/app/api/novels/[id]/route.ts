import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/novels/[id] - Get specific novel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid novel ID' }, { status: 400 });
    }

    let query = 'SELECT * FROM novels WHERE id = ?';
    const queryParams: any[] = [id];

    if (user?.role === 'writer') {
      // Writers can only see their own novels
      query += ' AND author_id = ?';
      queryParams.push(user.id);
    } else if (user?.role !== 'admin') {
      // Regular users only see active novels
      query += ' AND status = ?';
      queryParams.push('active');
    }

    const novel = db.prepare(query).get(...queryParams);

    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }

    return NextResponse.json(novel);
  } catch (error) {
    console.error('Error fetching novel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/novels/[id] - Update novel (admin or owner writer)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid novel ID' }, { status: 400 });
    }

    // Check if novel exists and if writer owns it
    let checkQuery = 'SELECT id, author_id FROM novels WHERE id = ?';
    const checkParams = [id];
    
    if (user.role === 'writer') {
      checkQuery += ' AND author_id = ?';
      checkParams.push(user.id);
    }
    
    const existingNovel = db.prepare(checkQuery).get(...checkParams);
    if (!existingNovel) {
      return NextResponse.json({ error: 'Novel not found or access denied' }, { status: 404 });
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

    const updateNovel = db.prepare(`
      UPDATE novels 
      SET title = COALESCE(?, title),
          slug = COALESCE(?, slug),
          description = COALESCE(?, description),
          cover_image_url = COALESCE(?, cover_image_url),
          genre = COALESCE(?, genre),
          status = COALESCE(?, status),
          is_featured = COALESCE(?, is_featured),
          sort_order = COALESCE(?, sort_order),
          author = COALESCE(?, author),
          theme_primary_color = COALESCE(?, theme_primary_color),
          theme_secondary_color = COALESCE(?, theme_secondary_color),
          theme_accent_color = COALESCE(?, theme_accent_color),
          theme_background_color = COALESCE(?, theme_background_color),
          theme_text_color = COALESCE(?, theme_text_color),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateNovel.run(
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
      theme_text_color,
      id
    );

    // Get updated novel
    const updatedNovel = db.prepare('SELECT * FROM novels WHERE id = ?').get(id);
    return NextResponse.json(updatedNovel);
  } catch (error: any) {
    console.error('Error updating novel:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/novels/[id] - Delete novel (admin or owner writer)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid novel ID' }, { status: 400 });
    }

    // Check if this is the default novel (id = 1) - prevent deletion
    if (id === 1) {
      return NextResponse.json({ error: 'Cannot delete the default novel' }, { status: 400 });
    }

    // Check if novel exists and if writer owns it
    let deleteQuery = 'DELETE FROM novels WHERE id = ?';
    const deleteParams = [id];
    
    if (user.role === 'writer') {
      deleteQuery += ' AND author_id = ?';
      deleteParams.push(user.id);
    }

    const result = db.prepare(deleteQuery).run(...deleteParams);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Novel not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Novel deleted successfully' });
  } catch (error) {
    console.error('Error deleting novel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
