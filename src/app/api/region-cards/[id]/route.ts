import { NextRequest, NextResponse } from 'next/server';
import { regionCardQueries } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const regionCard = regionCardQueries.getById.get(resolvedParams.id);
    
    if (!regionCard) {
      return NextResponse.json({ error: 'Region card not found' }, { status: 404 });
    }

    return NextResponse.json(regionCard);
  } catch (error) {
    console.error('Error fetching region card:', error);
    return NextResponse.json({ error: 'Failed to fetch region card' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'writer' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { 
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

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    regionCardQueries.update.run(
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
      layout_style || 'vertical',
      resolvedParams.id
    );

    const updatedCard = regionCardQueries.getById.get(resolvedParams.id);
    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating region card:', error);
    return NextResponse.json({ error: 'Failed to update region card' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'writer' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    regionCardQueries.delete.run(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting region card:', error);
    return NextResponse.json({ error: 'Failed to delete region card' }, { status: 500 });
  }
}
