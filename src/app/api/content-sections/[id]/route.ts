import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/content-sections/[id] - Get specific content section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const sectionId = parseInt(id);

    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'Invalid content section ID' }, { status: 400 });
    }

    // Get the content section first to check novel ownership
    const contentSection = db.prepare('SELECT * FROM content_sections WHERE id = ?').get(sectionId) as any;
    if (!contentSection) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    // Check permissions
    if (user?.is_admin) {
      // Admin can see everything
    } else if (user?.role === 'writer') {
      // Check if writer owns the novel this content section belongs to
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(contentSection.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        // Writer doesn't own this novel, only show if published
        if (!contentSection.is_published) {
          return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
        }
      }
    } else {
      // Regular user, only show published content
      if (!contentSection.is_published) {
        return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
      }
    }

    return NextResponse.json(contentSection);
  } catch (error) {
    console.error('Error fetching content section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/content-sections/[id] - Update content section (admin or owner writer)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.is_admin && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const sectionId = parseInt(id);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'Invalid content section ID' }, { status: 400 });
    }

    // Check if content section exists and get its novel_id
    const existingSection = db.prepare('SELECT * FROM content_sections WHERE id = ?').get(sectionId) as any;
    if (!existingSection) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    // Check if writer owns the novel (if not admin)
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(existingSection.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'Content section not found or access denied' }, { status: 404 });
      }
    }

    const {
      section_key, title, content, content_type, section_type,
      is_published, sort_order, metadata
    } = await request.json();

    // Check if section_key change conflicts with existing section in same novel
    if (section_key && section_key !== existingSection.section_key) {
      const conflictingSection = db.prepare('SELECT id FROM content_sections WHERE section_key = ? AND novel_id = ? AND id != ?')
        .get(section_key, existingSection.novel_id, sectionId);
      if (conflictingSection) {
        return NextResponse.json({ 
          error: 'A content section with this key already exists for this novel' 
        }, { status: 400 });
      }
    }

    const updateSection = db.prepare(`
      UPDATE content_sections 
      SET section_key = COALESCE(?, section_key),
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
      section_key, title, content, content_type, section_type,
      is_published !== undefined ? (is_published ? 1 : 0) : undefined,
      sort_order, metadata, sectionId
    );

    // Get updated content section
    const updatedSection = db.prepare('SELECT * FROM content_sections WHERE id = ?').get(sectionId);
    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating content section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/content-sections/[id] - Delete content section (admin or owner writer)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.is_admin && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const sectionId = parseInt(id);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'Invalid content section ID' }, { status: 400 });
    }

    // Check if content section exists and get its novel_id
    const existingSection = db.prepare('SELECT novel_id FROM content_sections WHERE id = ?').get(sectionId) as { novel_id: number } | undefined;
    if (!existingSection) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    // Check if writer owns the novel (if not admin)
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(existingSection.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'Content section not found or access denied' }, { status: 404 });
      }
    }

    const result = db.prepare('DELETE FROM content_sections WHERE id = ?').run(sectionId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Content section not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Content section deleted successfully' });
  } catch (error) {
    console.error('Error deleting content section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
