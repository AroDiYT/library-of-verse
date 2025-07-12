import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-edgedb';
import { characterQueries } from '@/lib/edgedb-content-queries';

// GET /api/characters - Get characters based on user permissions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novel_id');

    if (!novelId) {
      return NextResponse.json({ error: 'Novel ID is required' }, { status: 400 });
    }

    let characters;

    if (user?.role === 'admin') {
      // Admins can see all characters
      characters = await characterQueries.getByNovel(novelId, true);
    } else if (user?.role === 'writer') {
      // TODO: Check if writer owns the novel - for now allow all
      characters = await characterQueries.getByNovel(novelId, true);
    } else {
      // Regular users only see published characters
      characters = await characterQueries.getByNovel(novelId, false);
    }

    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/characters - Create new character (admin or writer)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'admin' && user?.role !== 'writer') {
      return NextResponse.json({ error: 'Writer or admin access required' }, { status: 403 });
    }

    const {
      name, description, bio, role_type, character_type, age, occupation, location,
      personality_traits, abilities, relationships, appearance, backstory, motivation,
      theme_color, image_url, is_published, sort_order, novel_id
    } = await request.json();

    if (!name || !novel_id) {
      return NextResponse.json({ 
        error: 'Character name and novel_id are required' 
      }, { status: 400 });
    }

    // TODO: Check if writer owns the novel (if not admin)
    // For now, allow all writers to create characters

    const newCharacter = await characterQueries.create({
      novel_id,
      name,
      description,
      bio,
      role_type: role_type || 'Side',
      character_type: character_type || 'human',
      age,
      occupation,
      location,
      personality_traits,
      abilities,
      relationships,
      appearance,
      backstory,
      motivation,
      theme_color: theme_color || '#ef4444',
      image_url,
      is_published: is_published || false,
      sort_order: sort_order || 0
    });

    return NextResponse.json({ success: true, character: newCharacter }, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
