import { NextRequest, NextResponse } from 'next/server';
import db, { sessionQueries } from '@/lib/database';

// GET /api/admin/characters - Get all characters for admin
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

    const characters = db.prepare(`
      SELECT 
        id, name, description, bio, role_type, character_type, age, occupation, location,
        personality_traits, abilities, relationships, appearance, backstory, motivation,
        theme_color, image_url, is_published, sort_order, created_at, updated_at
      FROM characters 
      ORDER BY sort_order ASC, role_type ASC, name ASC
    `).all();

    return NextResponse.json({ 
      success: true, 
      characters 
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch characters' 
    }, { status: 500 });
  }
}

// POST /api/admin/characters - Create new character
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, description, bio, role_type, character_type, age, occupation, location,
      personality_traits, abilities, relationships, appearance, backstory, motivation,
      theme_color, image_url, is_published, sort_order
    } = body;

    if (!name) {
      return NextResponse.json({ 
        error: 'Character name is required' 
      }, { status: 400 });
    }

    // Check if character with same name already exists
    const existingCharacter = db.prepare('SELECT id FROM characters WHERE name = ?').get(name);
    if (existingCharacter) {
      return NextResponse.json({ 
        error: 'A character with this name already exists' 
      }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO characters (
        name, description, bio, role_type, character_type, age, occupation, location,
        personality_traits, abilities, relationships, appearance, backstory, motivation,
        theme_color, image_url, is_published, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      name, description || null, bio || null, role_type || 'Side', character_type || 'human',
      age || null, occupation || null, location || null, personality_traits || null,
      abilities || null, relationships || null, appearance || null, backstory || null,
      motivation || null, theme_color || '#ef4444', image_url || null, 
      is_published ? 1 : 0, sort_order || 0
    );

    return NextResponse.json({ 
      success: true, 
      character: { id: result.lastInsertRowid, ...body }
    });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ 
      error: 'Failed to create character' 
    }, { status: 500 });
  }
}
