import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/content/[id] - Get specific content section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid content section ID' }, { status: 400 });
    }

    // Get section with novel info for permissions check
    const section = db.prepare(`
      SELECT cs.*, n.author_id 
      FROM content_sections cs 
      JOIN novels n ON cs.novel_id = n.id 
      WHERE cs.id = ?
    `).get(id) as any;

    if (!section) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    // Check permissions
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      // Regular users can only see published content
      if (!section.is_published) {
        return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
      }
    } else if (user?.role === 'writer') {
      // Writers can only see content for their own novels
      if (section.author_id !== user.id) {
        return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
      }
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching content section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/content/[id] - Update content section (admin and writers)
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
      return NextResponse.json({ error: 'Invalid content section ID' }, { status: 400 });
    }

    const { section_key, title, content, content_type, section_type, is_published, sort_order, metadata, novel_id } = await request.json();

    // Check if section exists and get novel info
    const existingSection = db.prepare(`
      SELECT cs.*, n.author_id 
      FROM content_sections cs 
      JOIN novels n ON cs.novel_id = n.id 
      WHERE cs.id = ?
    `).get(id) as any;
    
    if (!existingSection) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    // If user is a writer, verify they own the novel
    if (user.role === 'writer' && existingSection.author_id !== user.id) {
      return NextResponse.json({ error: 'You can only edit content for your own novels' }, { status: 403 });
    }

    const updateSection = db.prepare(`
      UPDATE content_sections 
      SET novel_id = COALESCE(?, novel_id),
          section_key = COALESCE(?, section_key),
          title = COALESCE(?, title),
          content = COALESCE(?, content),
          content_type = COALESCE(?, content_type),
          section_type = COALESCE(?, section_type),
          is_published = COALESCE(?, is_published),
          sort_order = COALESCE(?, sort_order),
          metadata = COALESCE(?, metadata),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateSection.run(
      novel_id,
      section_key,
      title,
      content,
      content_type,
      section_type,
      is_published !== undefined ? (is_published ? 1 : 0) : undefined,
      sort_order,
      metadata ? JSON.stringify(metadata) : null,
      id
    );

    // Get updated section
    const updatedSection = db.prepare('SELECT * FROM content_sections WHERE id = ?').get(id);
    return NextResponse.json(updatedSection);
  } catch (error: any) {
    console.error('Error updating content section:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Section key already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/content/[id] - Delete content section (admin and writers)
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
      return NextResponse.json({ error: 'Invalid content section ID' }, { status: 400 });
    }

    // Check if section exists and get novel info
    const existingSection = db.prepare(`
      SELECT cs.*, n.author_id 
      FROM content_sections cs 
      JOIN novels n ON cs.novel_id = n.id 
      WHERE cs.id = ?
    `).get(id) as any;
    
    if (!existingSection) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    // If user is a writer, verify they own the novel
    if (user.role === 'writer' && existingSection.author_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete content for your own novels' }, { status: 403 });
    }

    const result = db.prepare('DELETE FROM content_sections WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Content section deleted successfully' });
  } catch (error) {
    console.error('Error deleting content section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
