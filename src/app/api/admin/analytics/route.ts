import { NextRequest, NextResponse } from 'next/server';
import db, { sessionQueries } from '@/lib/database';

// GET /api/admin/analytics - Get analytics data for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Summary statistics
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const totalChapters = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE is_published = 1').get() as { count: number };
    const totalCharacters = db.prepare('SELECT COUNT(*) as count FROM characters WHERE is_published = 1').get() as { count: number };
    const totalViews = db.prepare('SELECT COUNT(*) as count FROM reading_progress').get() as { count: number };
    const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM sessions 
      WHERE created_at >= datetime('now', '-30 days')
    `).get() as { count: number };

    // Daily login activity
    const dailyLogins = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM sessions 
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all() as { date: string; count: number }[];

    // User registrations over time
    const userRegistrations = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all() as { date: string; count: number }[];

    // Most viewed chapters
    const chapterViews = db.prepare(`
      SELECT 
        c.id as chapter_id,
        c.title as chapter_title,
        COUNT(rp.id) as view_count
      FROM chapters c
      LEFT JOIN reading_progress rp ON c.id = rp.chapter_id
      WHERE c.is_published = 1
      GROUP BY c.id, c.title
      ORDER BY view_count DESC
      LIMIT 10
    `).all() as { chapter_id: number; chapter_title: string; view_count: number }[];

    // Reading progress by user
    const readingProgress = db.prepare(`
      SELECT 
        u.id as user_id,
        u.username,
        COUNT(DISTINCT rp.chapter_id) as chapters_read,
        (SELECT COUNT(*) FROM chapters WHERE is_published = 1) as total_chapters
      FROM users u
      LEFT JOIN reading_progress rp ON u.id = rp.user_id
      WHERE u.is_admin = 0
      GROUP BY u.id, u.username
    `).all() as { user_id: number; username: string; chapters_read: number; total_chapters: number }[];

    // Calculate average reading time (estimated based on word count and typical reading speed)
    const avgWordCount = db.prepare(`
      SELECT AVG(word_count) as avg_words
      FROM chapters 
      WHERE is_published = 1 AND word_count > 0
    `).get() as { avg_words: number };

    const avgReadingTime = avgWordCount.avg_words ? (avgWordCount.avg_words / 200) : 0; // 200 WPM average

    // Fill in missing dates for charts
    const fillMissingDates = (data: { date: string; count: number }[], days: number) => {
      const result = [];
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existingData = data.find(d => d.date === dateStr);
        result.push({
          date: dateStr,
          count: existingData ? existingData.count : 0
        });
      }
      
      return result;
    };

    const analytics = {
      dailyLogins: fillMissingDates(dailyLogins, days),
      userRegistrations: fillMissingDates(userRegistrations, days),
      chapterViews,
      readingProgress,
      summary: {
        totalUsers: totalUsers.count,
        totalChapters: totalChapters.count,
        totalCharacters: totalCharacters.count,
        totalViews: totalViews.count,
        activeUsers: activeUsers.count,
        avgReadingTime
      }
    };

    return NextResponse.json({ 
      success: true, 
      analytics 
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}
