import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { recordSheetActivity, syncLiveGoogleSheet } from '@/lib/googleSheets';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const memberIndex = db.members.findIndex((m) => m.id === id);
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const deletedMember = db.members[memberIndex];
    db.members.splice(memberIndex, 1);

    // Unassign tasks that were assigned to this member
    db.tasks.forEach((task) => {
      if (task.assigneeId === id) {
        task.assigneeId = '';
        task.updatedAt = new Date().toISOString();
      }
    });

    // Record removal in Google Sheet Activity Audit tab
    recordSheetActivity(db, {
      action: 'STAFF_REMOVED',
      entityId: id,
      entityTitle: deletedMember.name,
      fieldChanged: 'staff_roster',
      previousValue: `${deletedMember.role} (${deletedMember.email})`,
      newValue: 'REMOVED',
      details: `Staff member ${deletedMember.name} <${deletedMember.email}> removed from active roster. Associated tasks unassigned and Google Sheet Staff Roster updated.`,
      operator: 'Office Administration',
    });

    saveDatabase(db);
    await syncLiveGoogleSheet(db);

    return NextResponse.json({
      success: true,
      message: `Staff member "${deletedMember.name}" removed from roster and Google Sheet synchronized.`,
    });
  } catch (err: any) {
    console.error('Failed to delete staff member:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
