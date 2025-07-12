import { NextRequest, NextResponse } from 'next/server';
import { sessionQueries } from '@/lib/edgedb-queries';
import { chapterQueries } from '@/lib/edgedb-content-queries';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = await sessionQueries.findById(sessionId) as any;
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const chapterId = resolvedParams.id;
    const { title, chapter_number, content, excerpt, word_count, is_published } = await request.json();

    if (!title || !chapter_number || !content) {
      return NextResponse.json({ error: 'Title, chapter number, and content are required' }, { status: 400 });
    }

    await chapterQueries.update(chapterId, {
      title,
      content,
      excerpt: excerpt || '',
      word_count: word_count || 0,
      is_published: is_published || false
    });

    return NextResponse.json({ 
      success: true,
      message: 'Chapter updated successfully'
    });

  } catch (error) {
    console.error('Update chapter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = await sessionQueries.findById(sessionId) as any;
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const chapterId = resolvedParams.id;
    
    await chapterQueries.delete(chapterId);

    return NextResponse.json({ 
      success: true,
      message: 'Chapter deleted successfully'
    });

  } catch (error) {
    console.error('Delete chapter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
