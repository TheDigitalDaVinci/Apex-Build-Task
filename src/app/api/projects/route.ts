import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { Project } from '@/lib/types';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({ projects: db.projects });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, location, manager, icon = '🏗️' } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Project name and site code are required' }, { status: 400 });
    }

    const db = getDatabase();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      code,
      location: location || 'Site Location TBD',
      manager: manager || 'Site General Superintendent',
      status: 'active',
      icon,
    };

    db.projects.push(newProject);
    saveDatabase(db);

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create project:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
