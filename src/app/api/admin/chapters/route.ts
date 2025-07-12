import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-edgedb';
import { chapterQueries } from '@/lib/edgedb-content-queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get novel_id from search params
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novel_id');

    let chapters;
    if (novelId) {
      chapters = await chapterQueries.getAll({ novel_id: novelId });
    } else {
      chapters = await chapterQueries.getAll();
    }
    
    return NextResponse.json({ 
      success: true, 
      chapters 
    });

  } catch (error) {
    console.error('Admin chapters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { title, chapter_number, content, excerpt, word_count, is_published, novel_id } = await request.json();

    if (!title || !chapter_number || !content) {
      return NextResponse.json({ error: 'Title, chapter number, and content are required' }, { status: 400 });
    }

    const chapterData = {
      title,
      chapter_number: parseInt(chapter_number),
      content,
      excerpt: excerpt || '',
      word_count: word_count || 0,
      is_published: is_published || false,
      novel_id: novel_id || undefined
    };

    const newChapter = await chapterQueries.create(chapterData);

    return NextResponse.json({ 
      success: true,
      chapter: newChapter
    });

  } catch (error) {
    console.error('Create chapter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
