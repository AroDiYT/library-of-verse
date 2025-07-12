import { NextRequest, NextResponse } from 'next/server';
import { chapterQueries } from '@/lib/edgedb-content-queries';
import { getCurrentUser } from '@/lib/auth-edgedb';

interface Chapter {
  id: number;
  novel_id: number;
  title: string;
  chapter_number: number;
  content: string;
  excerpt?: string;
  word_count?: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication using proper auth function
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const chapterId = parseInt(id);
    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 });
    }

    // Get the chapter
    const chapter = chapterQueries.getById.get(chapterId) as Chapter | undefined;
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Only return published chapters for non-admin users unless they own the novel
    if (!chapter.is_published && user.role !== 'admin') {
      // If it's a writer, check if they own the novel
      if (user.role === 'writer') {
        const novel = db.prepare('SELECT id FROM novels WHERE id = ? AND author_id = ?').get(chapter.novel_id, user.id);
        if (!novel) {
          return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
    }

    // Get next and previous chapters based on user permissions
    let nextChapter: Chapter | undefined = undefined;
    let prevChapter: Chapter | undefined = undefined;

    if (user.role === 'admin') {
      // For admin, get all chapters within the same novel
      nextChapter = chapterQueries.getNextChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
      prevChapter = chapterQueries.getPrevChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
    } else if (user.role === 'writer') {
      // For writers, check if they own the novel
      const novel = db.prepare('SELECT id FROM novels WHERE id = ? AND author_id = ?').get(chapter.novel_id, user.id);
      if (novel) {
        // Writer owns the novel, can see all chapters
        nextChapter = chapterQueries.getNextChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
        prevChapter = chapterQueries.getPrevChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
      } else {
        // Writer doesn't own the novel, only see published chapters
        nextChapter = chapterQueries.getNextPublishedChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
        prevChapter = chapterQueries.getPrevPublishedChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
      }
    } else {
      // For regular users, only get published chapters within the same novel
      nextChapter = chapterQueries.getNextPublishedChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
      prevChapter = chapterQueries.getPrevPublishedChapter.get(chapter.chapter_number, chapter.novel_id) as Chapter | undefined;
    }

    return NextResponse.json({
      chapter,
      nextChapter,
      prevChapter
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/chapters/[id] - Update chapter (admin or owner writer)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const chapterId = parseInt(id);
    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 });
    }

    // Check if chapter exists
    const existingChapter = chapterQueries.getById.get(chapterId) as Chapter | undefined;
    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if writer owns the novel (if not admin)
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(existingChapter.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'Chapter not found or access denied' }, { status: 404 });
      }
    }

    const { 
      title, 
      chapter_number, 
      content, 
      excerpt, 
      is_published 
    } = await request.json();

    // Calculate word count if content is provided
    const word_count = content ? content.split(/\s+/).filter((word: string) => word.length > 0).length : existingChapter.word_count;
    
    // Handle publishing
    let published_at: string | null = existingChapter.published_at || null;
    if (is_published !== undefined) {
      if (is_published && !existingChapter.is_published) {
        // Just being published
        published_at = new Date().toISOString();
      } else if (!is_published) {
        // Being unpublished
        published_at = null;
      }
    }

    const updateChapter = db.prepare(`
      UPDATE chapters 
      SET title = COALESCE(?, title),
          chapter_number = COALESCE(?, chapter_number),
          content = COALESCE(?, content),
          excerpt = COALESCE(?, excerpt),
          word_count = COALESCE(?, word_count),
          is_published = COALESCE(?, is_published),
          published_at = COALESCE(?, published_at),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateChapter.run(
      title,
      chapter_number,
      content,
      excerpt,
      word_count,
      is_published !== undefined ? (is_published ? 1 : 0) : undefined,
      published_at,
      chapterId
    );

    // Get updated chapter
    const updatedChapter = chapterQueries.getById.get(chapterId);
    return NextResponse.json(updatedChapter);
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Chapter number already exists for this novel' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chapters/[id] - Delete chapter (admin or owner writer)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const chapterId = parseInt(id);
    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 });
    }

    // Check if chapter exists
    const existingChapter = chapterQueries.getById.get(chapterId) as Chapter | undefined;
    if (!existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if writer owns the novel (if not admin)
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(existingChapter.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'Chapter not found or access denied' }, { status: 404 });
      }
    }

    const result = db.prepare('DELETE FROM chapters WHERE id = ?').run(chapterId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
