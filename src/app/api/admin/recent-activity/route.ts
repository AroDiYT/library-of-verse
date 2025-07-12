import { NextRequest, NextResponse } from 'next/server';
import db, { sessionQueries } from '@/lib/database';

// GET /api/admin/recent-activity - Get recent activity for admin dashboard
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

    // Get recent user registrations
    const recentUsers = db.prepare(`
      SELECT 
        'user_registration' as type,
        username as title,
        'New user registered' as description,
        email as details,
        created_at as timestamp
      FROM users 
      WHERE created_at >= datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    // Get recent chapter updates
    const recentChapters = db.prepare(`
      SELECT 
        'chapter_update' as type,
        title,
        CASE 
          WHEN created_at = updated_at THEN 'New chapter published'
          ELSE 'Chapter updated'
        END as description,
        'Chapter ' || chapter_number as details,
        CASE 
          WHEN created_at = updated_at THEN created_at
          ELSE updated_at
        END as timestamp
      FROM chapters 
      WHERE (created_at >= datetime('now', '-7 days') OR updated_at >= datetime('now', '-7 days'))
        AND is_published = 1
      ORDER BY 
        CASE 
          WHEN created_at = updated_at THEN created_at
          ELSE updated_at
        END DESC
      LIMIT 5
    `).all();

    // Get recent character updates
    const recentCharacters = db.prepare(`
      SELECT 
        'character_update' as type,
        name as title,
        CASE 
          WHEN created_at = updated_at THEN 'New character added'
          ELSE 'Character updated'
        END as description,
        role_type || ' character' as details,
        CASE 
          WHEN created_at = updated_at THEN created_at
          ELSE updated_at
        END as timestamp
      FROM characters 
      WHERE (created_at >= datetime('now', '-7 days') OR updated_at >= datetime('now', '-7 days'))
        AND is_published = 1
      ORDER BY 
        CASE 
          WHEN created_at = updated_at THEN created_at
          ELSE updated_at
        END DESC
      LIMIT 5
    `).all();

    // Get recent reading activity
    const recentReading = db.prepare(`
      SELECT 
        'reading_activity' as type,
        u.username || ' read ' || c.title as title,
        'Chapter completed' as description,
        'Chapter ' || c.chapter_number as details,
        rp.completed_at as timestamp
      FROM reading_progress rp
      JOIN users u ON rp.user_id = u.id
      JOIN chapters c ON rp.chapter_id = c.id
      WHERE rp.completed_at >= datetime('now', '-7 days')
        AND rp.completed_at IS NOT NULL
      ORDER BY rp.completed_at DESC
      LIMIT 10
    `).all();

    // Combine all activities and sort by timestamp
    const allActivities = [
      ...recentUsers,
      ...recentChapters,
      ...recentCharacters,
      ...recentReading
    ].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 20); // Limit to 20 most recent activities

    return NextResponse.json({ 
      success: true, 
      activities: allActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch recent activity' 
    }, { status: 500 });
  }
}
