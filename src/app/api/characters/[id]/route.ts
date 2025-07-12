import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// GET /api/characters/[id] - Get specific character
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const characterId = parseInt(id);

    if (isNaN(characterId)) {
      return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 });
    }

    let query = 'SELECT * FROM characters WHERE id = ?';
    const queryParams: any[] = [characterId];

    // Get the character first to check novel ownership
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId) as any;
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check permissions
    if (user?.role === 'admin') {
      // Admin can see everything
    } else if (user?.role === 'writer') {
      // Check if writer owns the novel this character belongs to
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(character.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        // Writer doesn't own this novel, only show if published
        if (!character.is_published) {
          return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }
      }
    } else {
      // Regular user, only show published characters
      if (!character.is_published) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
      }
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/characters/[id] - Update character (admin or owner writer)
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
    const characterId = parseInt(id);
    if (isNaN(characterId)) {
      return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 });
    }

    // Check if character exists and get its novel_id
    const existingCharacter = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId) as any;
    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check if writer owns the novel (if not admin)
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(existingCharacter.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'Character not found or access denied' }, { status: 404 });
      }
    }

    const {
      name, description, bio, role_type, character_type, age, occupation, location,
      personality_traits, abilities, relationships, appearance, backstory, motivation,
      theme_color, image_url, is_published, sort_order
    } = await request.json();

    // Check if name change conflicts with existing character in same novel
    if (name && name !== existingCharacter.name) {
      const conflictingCharacter = db.prepare('SELECT id FROM characters WHERE name = ? AND novel_id = ? AND id != ?')
        .get(name, existingCharacter.novel_id, characterId);
      if (conflictingCharacter) {
        return NextResponse.json({ 
          error: 'A character with this name already exists in this novel' 
        }, { status: 400 });
      }
    }

    const updateCharacter = db.prepare(`
      UPDATE characters 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          bio = COALESCE(?, bio),
          role_type = COALESCE(?, role_type),
          character_type = COALESCE(?, character_type),
          age = COALESCE(?, age),
          occupation = COALESCE(?, occupation),
          location = COALESCE(?, location),
          personality_traits = COALESCE(?, personality_traits),
          abilities = COALESCE(?, abilities),
          relationships = COALESCE(?, relationships),
          appearance = COALESCE(?, appearance),
          backstory = COALESCE(?, backstory),
          motivation = COALESCE(?, motivation),
          theme_color = COALESCE(?, theme_color),
          image_url = COALESCE(?, image_url),
          is_published = COALESCE(?, is_published),
          sort_order = COALESCE(?, sort_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateCharacter.run(
      name, description, bio, role_type, character_type, age, occupation, location,
      personality_traits, abilities, relationships, appearance, backstory, motivation,
      theme_color, image_url, is_published !== undefined ? (is_published ? 1 : 0) : undefined,
      sort_order, characterId
    );

    // Get updated character
    const updatedCharacter = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId);
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/characters/[id] - Delete character (admin or owner writer)
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
    const characterId = parseInt(id);
    if (isNaN(characterId)) {
      return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 });
    }

    // Check if character exists and get its novel_id
    const existingCharacter = db.prepare('SELECT novel_id FROM characters WHERE id = ?').get(characterId) as { novel_id: number } | undefined;
    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check if writer owns the novel (if not admin)
    if (user.role === 'writer') {
      const novel = db.prepare('SELECT author_id FROM novels WHERE id = ?').get(existingCharacter.novel_id) as { author_id: number } | undefined;
      if (!novel || novel.author_id !== user.id) {
        return NextResponse.json({ error: 'Character not found or access denied' }, { status: 404 });
      }
    }

    const result = db.prepare('DELETE FROM characters WHERE id = ?').run(characterId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
