import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { recordSheetActivity, syncLiveGoogleSheet } from '@/lib/googleSheets';
import { TeamMember } from '@/lib/types';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({ members: db.members });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      role, 
      trade = 'Architectural Design', 
      phone = '', 
      company = 'Design & Engineering Division',
      licenseNo,
      officeLocation = 'HQ Design Studio'
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const db = getDatabase();
    
    // Check if member already exists with same email
    const existing = db.members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'A staff member with this mail ID already exists' }, { status: 409 });
    }

    // Generate initials for avatar
    const initials = name
      .replace(/^(Dr\.|Engr\.|Arch\.)\s+/i, '')
      .split(' ')
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name,
      email,
      role: role || `${trade} Project Lead`,
      trade,
      phone,
      company: company || 'Design & Engineering Division',
      licenseNo: licenseNo || undefined,
      officeLocation: officeLocation || 'HQ Design Studio',
      avatar: initials || '📐',
    };

    db.members.push(newMember);

    // Record to Google Sheet Activity tab
    recordSheetActivity(db, {
      action: 'STAFF_REGISTERED',
      entityId: newMember.id,
      entityTitle: newMember.name,
      fieldChanged: 'staff_roster',
      newValue: `${newMember.role} (${newMember.trade})`,
      details: `New staff member registered: ${newMember.name} <${newMember.email}>. License: ${newMember.licenseNo || 'None'}. Logged to Google Sheet Staff Roster tab.`,
      operator: 'Office Manager',
    });

    saveDatabase(db);
    await syncLiveGoogleSheet(db);

    return NextResponse.json({ 
      success: true, 
      member: newMember,
      message: `Staff member registered and logged to Google Sheet Staff Roster tab!`
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to add team member:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
