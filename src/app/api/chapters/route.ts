import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-edgedb';
import { chapterQueries } from '@/lib/edgedb-content-queries';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get novel_id from search params
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novel_id');

    // Get chapters based on user role and novel filter
    let chapters;
    if (user.role === 'admin') {
      // Admins can see all chapters
      if (novelId) {
        chapters = await chapterQueries.getAll({ novel_id: novelId });
      } else {
        chapters = await chapterQueries.getAll();
      }
    } else if (user.role === 'writer') {
      // Writers can see all chapters (for now - TODO: implement novel ownership)
      if (novelId) {
        chapters = await chapterQueries.getAll({ novel_id: novelId });
      } else {
        chapters = await chapterQueries.getAll();
      }
    } else {
      // Regular users only see published chapters
      if (novelId) {
        chapters = await chapterQueries.getAll({ novel_id: novelId, is_published: true });
      } else {
        chapters = await chapterQueries.getAll({ is_published: true });
      }
    }

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'writer')) {
      return NextResponse.json({ error: 'Admin or writer access required' }, { status: 403 });
    }

    const {
      title, chapter_number, content, excerpt, word_count, is_published, novel_id
    } = await request.json();

    // Validation
    if (!title || !chapter_number || !content) {
      return NextResponse.json({ 
        error: 'Title, chapter number, and content are required' 
      }, { status: 400 });
    }

    // TODO: For writers, check if they own the novel
    // For now, allow all writers to create chapters

    const chapterData = {
      title,
      chapter_number: parseInt(chapter_number),
      content,
      excerpt: excerpt || '',
      word_count: word_count || 0,
      is_published: is_published || false,
      novel_id: novel_id || undefined, // Use default novel if none specified
    };

    const newChapter = await chapterQueries.create(chapterData);

    return NextResponse.json({
      success: true,
      chapter: newChapter
    });

  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
