import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/content - Get content sections (public and admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionType = searchParams.get('type');
    const sectionKey = searchParams.get('key');
    const novelId = searchParams.get('novel_id') || '1'; // Default to novel 1
    const user = await getCurrentUser();

    let query = `
      SELECT id, novel_id, section_key, title, content, content_type, section_type, 
             is_published, sort_order, metadata, created_at, updated_at
      FROM content_sections
    `;
    const params: any[] = [];

    // Build WHERE clause
    const conditions: string[] = [];
    
    // Filter by novel_id
    conditions.push('novel_id = ?');
    params.push(parseInt(novelId));
    
    // Only show published content to regular users, 
    // but allow writers to see their own content and admins to see all
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      conditions.push('is_published = ?');
      params.push(1);
    } else if (user?.role === 'writer') {
      // Writers can only see content for novels they own
      const writerNovels = db.prepare('SELECT id FROM novels WHERE author_id = ?').all(user.id) as Array<{id: number}>;
      const novelIds = writerNovels.map(n => n.id);
      if (novelIds.length === 0) {
        return NextResponse.json([]);
      }
      // Override novel_id filter if writer doesn't own the novel
      if (!novelIds.includes(parseInt(novelId))) {
        return NextResponse.json([]);
      }
    }

    if (sectionType) {
      conditions.push('section_type = ?');
      params.push(sectionType);
    }

    if (sectionKey) {
      conditions.push('section_key = ?');
      params.push(sectionKey);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sort_order ASC, created_at ASC';

    const sections = db.prepare(query).all(...params);
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching content sections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/content - Create new content section (admin and writers)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { section_key, title, content, content_type, section_type, is_published, sort_order, metadata, novel_id } = await request.json();

    if (!section_key || !title || !content || !section_type) {
      return NextResponse.json({ 
        error: 'section_key, title, content, and section_type are required' 
      }, { status: 400 });
    }

    const targetNovelId = novel_id || 1;

    // If user is a writer, verify they own the novel
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(targetNovelId) as any;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'You can only create content for your own novels' }, { status: 403 });
      }
    }

    const insertSection = db.prepare(`
      INSERT INTO content_sections (novel_id, section_key, title, content, content_type, section_type, is_published, sort_order, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertSection.run(
      targetNovelId,
      section_key,
      title,
      content,
      content_type || 'markdown',
      section_type,
      is_published !== undefined ? (is_published ? 1 : 0) : 1,
      sort_order || 0,
      metadata ? JSON.stringify(metadata) : null
    );

    // Get the created section
    const newSection = db.prepare('SELECT * FROM content_sections WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(newSection, { status: 201 });
  } catch (error: any) {
    console.error('Error creating content section:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Section key already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
