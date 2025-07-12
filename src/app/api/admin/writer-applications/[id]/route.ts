import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/database';

// PUT /api/admin/writer-applications/[id] - Approve or reject writer application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
    }

    const { status, author_group, admin_notes } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status must be either "approved" or "rejected"' 
      }, { status: 400 });
    }

    // Get the application
    const application = db.prepare('SELECT * FROM writer_applications WHERE id = ?').get(applicationId) as any;
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Application has already been processed' 
      }, { status: 400 });
    }

    // Update the application
    db.prepare(`
      UPDATE writer_applications 
      SET status = ?, 
          author_group = ?, 
          admin_notes = ?, 
          reviewed_at = CURRENT_TIMESTAMP,
          reviewed_by = ?
      WHERE id = ?
    `).run(status, author_group || null, admin_notes || null, user.id, applicationId);

    // If approved, update the user's role and pen name
    if (status === 'approved') {
      db.prepare('UPDATE users SET role = ?, pen_name = ? WHERE id = ?').run('writer', application.pen_name, application.user_id);
    }

    // Get updated application
    const updatedApplication = db.prepare('SELECT * FROM writer_applications WHERE id = ?').get(applicationId);

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Error updating writer application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
