import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-edgedb';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Auth check API error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
