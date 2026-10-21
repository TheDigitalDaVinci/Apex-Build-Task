import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { recordSheetNotification, recordSheetActivity, syncLiveGoogleSheet } from '@/lib/googleSheets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDatabase();
  const task = db.tasks.find(t => t.id === id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDatabase();

    const taskIndex = db.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const currentTask = db.tasks[taskIndex];
    const previousAssigneeId = currentTask.assigneeId;
    const previousStatus = currentTask.status;

    const updatedTask = {
      ...currentTask,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const assigneeChanged = Boolean(body.assigneeId && body.assigneeId !== previousAssigneeId);
    const statusChanged = Boolean(body.status && body.status !== previousStatus);

    let sheetNotif = null;

    // 1. If assignee changed or notification requested, log to Google Sheet Notifications tab
    if (assigneeChanged || (body.notifyAssignee && updatedTask.assigneeId)) {
      const member = db.members.find(m => m.id === updatedTask.assigneeId);
      if (member) {
        updatedTask.lastNotifiedAt = new Date().toISOString();
        sheetNotif = recordSheetNotification(db, {
          recipientName: member.name,
          recipientEmail: member.email,
          recipientRole: member.role,
          eventType: 'TASK_ASSIGNED',
          taskId: updatedTask.id,
          taskTitle: updatedTask.title,
          summary: assigneeChanged 
            ? `Deliverable reassigned to ${member.name}. Status: ${updatedTask.status.toUpperCase()}, Due: ${updatedTask.dueDate}.` 
            : `Deliverable updated: ${updatedTask.title}. Review liability: ${updatedTask.safetyRisk}.`,
          triggeredBy: 'Engineering Dispatcher',
        });
      }
    }

    // 2. If status changed, log to Google Sheet Activity tab
    if (statusChanged) {
      recordSheetActivity(db, {
        action: 'STATUS_CHANGED',
        entityId: updatedTask.id,
        entityTitle: updatedTask.title,
        fieldChanged: 'status',
        previousValue: previousStatus.toUpperCase(),
        newValue: updatedTask.status.toUpperCase(),
        details: `Task status changed from ${previousStatus.toUpperCase()} to ${updatedTask.status.toUpperCase()}`,
        operator: 'Lead Engineer',
      });
    }

    // 3. If other fields changed
    if (!statusChanged && !assigneeChanged) {
      recordSheetActivity(db, {
        action: 'TASK_UPDATED',
        entityId: updatedTask.id,
        entityTitle: updatedTask.title,
        fieldChanged: 'deliverable_specs',
        details: `Deliverable specifications and details updated`,
        operator: 'Lead Architect',
      });
    }

    db.tasks[taskIndex] = updatedTask;
    saveDatabase(db);
    const syncRes = await syncLiveGoogleSheet(db);

    return NextResponse.json({
      success: true,
      task: updatedTask,
      sheetNotification: sheetNotif,
      message: syncRes?.message || (sheetNotif 
        ? `Task updated and assignment notification logged in Google Sheet for ${sheetNotif.recipientName}` 
        : 'Task updated and changes logged to Google Sheet')
    });
  } catch (err: any) {
    console.error('Failed to update task:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const taskIndex = db.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const deletedTask = db.tasks[taskIndex];
    db.tasks.splice(taskIndex, 1);

    // Log deletion to Google Sheet Activity tab
    recordSheetActivity(db, {
      action: 'TASK_DELETED',
      entityId: id,
      entityTitle: deletedTask.title,
      fieldChanged: 'lifecycle',
      previousValue: 'ACTIVE',
      newValue: 'DELETED',
      details: `Deliverable [${id}] "${deletedTask.title}" removed from workspace`,
      operator: 'Superintendent',
    });

    saveDatabase(db);
    await syncLiveGoogleSheet(db);

    return NextResponse.json({ success: true, message: 'Task deleted and logged to Google Sheet audit stream' });
  } catch (err: any) {
    console.error('Failed to delete task:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
