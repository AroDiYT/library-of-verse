import { NextRequest, NextResponse } from 'next/server';
import { regionCardQueries } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novel_id');

    if (!novelId) {
      return NextResponse.json({ error: 'Novel ID is required' }, { status: 400 });
    }

    const regionCards = regionCardQueries.getByNovel.all(novelId);

    return NextResponse.json(regionCards);
  } catch (error) {
    console.error('Error fetching region cards:', error);
    return NextResponse.json({ error: 'Failed to fetch region cards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'writer' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      novel_id, 
      name, 
      description, 
      image_url, 
      continent, 
      sort_order,
      theme_color,
      border_color,
      background_color,
      hover_color,
      icon,
      layout_style
    } = body;

    if (!novel_id || !name || !description) {
      return NextResponse.json({ error: 'Novel ID, name, and description are required' }, { status: 400 });
    }

    const newRegionCard = regionCardQueries.create.get(
      novel_id, 
      name, 
      description, 
      image_url || null, 
      continent || null, 
      sort_order || 0,
      theme_color || '#ef4444',
      border_color || 'border-gray-700',
      background_color || 'bg-gray-900',
      hover_color || 'hover:border-red-700/50',
      icon || '🏔️',
      layout_style || 'vertical'
    );

    return NextResponse.json(newRegionCard, { status: 201 });
  } catch (error) {
    console.error('Error creating region card:', error);
    return NextResponse.json({ error: 'Failed to create region card' }, { status: 500 });
  }
}
