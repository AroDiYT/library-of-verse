import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/content-sections - Get content sections based on user permissions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novel_id');
    const sectionType = searchParams.get('section_type');

    let query = 'SELECT * FROM content_sections';
    const params: any[] = [];
    const conditions: string[] = [];

    if (novelId) {
      conditions.push('novel_id = ?');
      params.push(parseInt(novelId));
    }

    if (sectionType) {
      conditions.push('section_type = ?');
      params.push(sectionType);
    }

    if (user?.is_admin) {
      // Admins can see all content
    } else if (user?.role === 'writer') {
      // Writers can see content from their own novels
      if (novelId) {
        // Check if writer owns the novel
        const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(parseInt(novelId)) as { author_id: number } | undefined;
        if (!novel || novel.author_id !== user.id) {
          conditions.push('is_published = 1');
        }
      } else {
        // Get content from writer's own novels
        query = `
          SELECT cs.* FROM content_sections cs 
          JOIN novels n ON cs.novel_id = n.id 
          WHERE n.author_id = ?
        `;
        params.unshift(user.id);
        if (sectionType) {
          query += ' AND cs.section_type = ?';
        }
      }
    } else {
      // Regular users only see published content
      conditions.push('is_published = 1');
    }

    if (conditions.length > 0 && !query.includes('WHERE')) {
      query += ' WHERE ' + conditions.join(' AND ');
    } else if (conditions.length > 0 && user?.role === 'writer' && !novelId) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sort_order ASC, created_at ASC';

    const contentSections = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, contentSections });
  } catch (error) {
    console.error('Error fetching content sections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/content-sections - Create new content section (admin or writer)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.is_admin && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const {
      novel_id, section_key, title, content, content_type, section_type,
      is_published, sort_order, metadata
    } = await request.json();

    if (!novel_id || !section_key || !title || !content || !section_type) {
      return NextResponse.json({ 
        error: 'novel_id, section_key, title, content, and section_type are required' 
      }, { status: 400 });
    }

    // Check if writer owns the novel (if not admin)
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'Novel not found or access denied' }, { status: 404 });
      }
    }

    // Check if section_key already exists for this novel
    const existingSection = db.prepare('SELECT id FROM content_sections WHERE section_key = ? AND novel_id = ?').get(section_key, novel_id);
    if (existingSection) {
      return NextResponse.json({ 
        error: 'A content section with this key already exists for this novel' 
      }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO content_sections (
        novel_id, section_key, title, content, content_type, section_type,
        is_published, sort_order, metadata, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      novel_id, section_key, title, content, content_type || 'markdown', section_type,
      is_published ? 1 : 0, sort_order || 0, metadata || null
    );

    // Get the created content section
    const newContentSection = db.prepare('SELECT * FROM content_sections WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, contentSection: newContentSection }, { status: 201 });
  } catch (error) {
    console.error('Error creating content section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
