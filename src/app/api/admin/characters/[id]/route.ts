import { NextRequest, NextResponse } from 'next/server';
import db, { sessionQueries } from '@/lib/database';

// GET /api/admin/characters/[id] - Get single character
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const character = db.prepare(`
      SELECT 
        id, name, description, bio, role_type, character_type, age, occupation, location,
        personality_traits, abilities, relationships, appearance, backstory, motivation,
        theme_color, image_url, is_published, sort_order, created_at, updated_at
      FROM characters 
      WHERE id = ?
    `).get(params.id);

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      character 
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch character' 
    }, { status: 500 });
  }
}

// PUT /api/admin/characters/[id] - Update character
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
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

    // Check if another character with same name already exists
    const existingCharacter = db.prepare('SELECT id FROM characters WHERE name = ? AND id != ?').get(name, params.id);
    if (existingCharacter) {
      return NextResponse.json({ 
        error: 'A character with this name already exists' 
      }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE characters SET
        name = ?, description = ?, bio = ?, role_type = ?, character_type = ?, age = ?, 
        occupation = ?, location = ?, personality_traits = ?, abilities = ?, relationships = ?, 
        appearance = ?, backstory = ?, motivation = ?, theme_color = ?, image_url = ?, 
        is_published = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      name, description || null, bio || null, role_type || 'Side', character_type || 'human',
      age || null, occupation || null, location || null, personality_traits || null,
      abilities || null, relationships || null, appearance || null, backstory || null,
      motivation || null, theme_color || '#ef4444', image_url || null, 
      is_published ? 1 : 0, sort_order || 0, params.id
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Character updated successfully'
    });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ 
      error: 'Failed to update character' 
    }, { status: 500 });
  }
}

// DELETE /api/admin/characters/[id] - Delete character
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = sessionQueries.findById.get(sessionId) as any;
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
    const result = stmt.run(params.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Character deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ 
      error: 'Failed to delete character' 
    }, { status: 500 });
  }
}
