import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { recordSheetNotification, recordSheetActivity, syncLiveGoogleSheet } from '@/lib/googleSheets';
import { Task } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const assigneeId = searchParams.get('assigneeId');

  const db = getDatabase();
  let tasks = db.tasks;

  if (projectId) {
    tasks = tasks.filter(t => t.projectId === projectId);
  }
  if (assigneeId) {
    tasks = tasks.filter(t => t.assigneeId === assigneeId);
  }

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const {
      title,
      description = '',
      projectId,
      assigneeId,
      status = 'ready',
      priority = 'medium',
      trade = 'Architectural Design',
      zone = 'Drawing Package 1',
      dueDate = new Date().toISOString().split('T')[0],
      estimatedHours = 8,
      safetyRisk = 'Code Compliance Review',
      blueprintRef = '',
      subtasks = [],
      notifyAssignee = true,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    // Validate and resolve assigneeId against active staff members
    let resolvedAssigneeId = assigneeId;
    if (resolvedAssigneeId && !db.members.some((m) => m.id === resolvedAssigneeId)) {
      resolvedAssigneeId = db.members[0]?.id || '';
    } else if (!resolvedAssigneeId) {
      resolvedAssigneeId = db.members[0]?.id || '';
    }

    // Validate and resolve projectId against active project sites
    let resolvedProjectId = projectId;
    if (!resolvedProjectId || !db.projects.some((p) => p.id === resolvedProjectId)) {
      resolvedProjectId = db.projects[0]?.id || '';
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      projectId: resolvedProjectId,
      assigneeId: resolvedAssigneeId,
      status,
      priority,
      trade,
      zone,
      dueDate,
      estimatedHours: Number(estimatedHours) || 8,
      safetyRisk,
      blueprintRef,
      subtasks: subtasks.map((st: any, idx: number) => ({
        id: st.id || `st-${Date.now()}-${idx}`,
        title: typeof st === 'string' ? st : st.title,
        completed: Boolean(st.completed),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastNotifiedAt: new Date().toISOString(),
    };

    db.tasks.unshift(newTask);

    // 1. Log task creation to Google Sheet Activity tab
    recordSheetActivity(db, {
      action: 'TASK_CREATED',
      entityId: newTask.id,
      entityTitle: newTask.title,
      fieldChanged: 'lifecycle',
      newValue: `Status: ${newTask.status.toUpperCase()}, Priority: ${newTask.priority.toUpperCase()}`,
      details: `New engineering deliverable created in project zone: ${newTask.zone}. Liability: ${newTask.safetyRisk}.`,
      operator: 'Project Lead',
    });

    // 2. Log notification in Google Sheet Notifications tab if assigned
    let sheetNotif = null;
    if (notifyAssignee && newTask.assigneeId) {
      const member = db.members.find(m => m.id === newTask.assigneeId);
      if (member) {
        sheetNotif = recordSheetNotification(db, {
          recipientName: member.name,
          recipientEmail: member.email,
          recipientRole: member.role,
          eventType: 'TASK_ASSIGNED',
          taskId: newTask.id,
          taskTitle: newTask.title,
          summary: `Assigned deliverable: ${newTask.title}. Priority: ${newTask.priority.toUpperCase()}, Review Liability: ${newTask.safetyRisk}, Due: ${newTask.dueDate}.`,
          triggeredBy: 'Task Assigner',
        });
      }
    }

    saveDatabase(db);
    const syncRes = await syncLiveGoogleSheet(db);

    return NextResponse.json({
      success: true,
      task: newTask,
      sheetNotification: sheetNotif,
      message: syncRes?.message || (sheetNotif 
        ? `Task logged to Google Sheet and assignment notice recorded for ${sheetNotif.recipientName} (${sheetNotif.recipientEmail})` 
        : 'Task created and logged to Google Sheet')
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create task:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
