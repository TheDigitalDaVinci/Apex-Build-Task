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

    const projectIndex = db.projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (db.projects.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the only remaining project. Please create a new project before removing this one.' },
        { status: 400 }
      );
    }

    const deletedProject = db.projects[projectIndex];
    db.projects.splice(projectIndex, 1);

    // Fallback project for existing tasks
    const fallbackProjectId = db.projects[0].id;
    let reassignedTasksCount = 0;

    db.tasks.forEach((task) => {
      if (task.projectId === id) {
        task.projectId = fallbackProjectId;
        task.updatedAt = new Date().toISOString();
        reassignedTasksCount++;
      }
    });

    // Record removal in Google Sheet Activity Audit tab
    recordSheetActivity(db, {
      action: 'PROJECT_DELETED',
      entityId: id,
      entityTitle: deletedProject.name,
      fieldChanged: 'projects',
      previousValue: `${deletedProject.code} - ${deletedProject.name}`,
      newValue: 'DELETED',
      details: `Project portfolio "${deletedProject.name}" [${deletedProject.code}] removed. ${reassignedTasksCount} task(s) reassigned to "${db.projects[0].name}".`,
      operator: 'Superintendent',
    });

    saveDatabase(db);
    await syncLiveGoogleSheet(db);

    return NextResponse.json({
      success: true,
      message: `Project "${deletedProject.name}" removed and Google Sheet synchronized.`,
      fallbackProjectId,
      reassignedTasksCount,
    });
  } catch (err: any) {
    console.error('Failed to delete project:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
