import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth-edgedb';

export async function POST(request: NextRequest) {
  try {
    await logoutUser();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
