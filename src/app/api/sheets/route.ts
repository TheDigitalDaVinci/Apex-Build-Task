import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { 
  SHEET_TABS, 
  SHEET_HEADERS, 
  formatTaskToSheetRow, 
  formatStaffToSheetRow, 
  formatNotificationToSheetRow, 
  formatActivityToSheetRow,
  syncLiveGoogleSheet,
  exportSheetsToCsvFiles 
} from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'all';
    const db = getDatabase();

    const tasksRows = [
      SHEET_HEADERS.tasks,
      ...db.tasks.map(t => {
        const mem = db.members.find(m => m.id === t.assigneeId);
        const proj = db.projects.find(p => p.id === t.projectId);
        return formatTaskToSheetRow(t, mem, proj);
      })
    ];

    const staffRows = [
      SHEET_HEADERS.staff,
      ...db.members.map(formatStaffToSheetRow)
    ];

    const notificationRows = [
      SHEET_HEADERS.notifications,
      ...(db.sheetNotifications || []).map(formatNotificationToSheetRow)
    ];

    const activityRows = [
      SHEET_HEADERS.activity,
      ...(db.sheetActivityLog || []).map(formatActivityToSheetRow)
    ];

    return NextResponse.json({
      config: db.googleSheetsConfig,
      tabs: SHEET_TABS,
      stats: {
        totalRows: tasksRows.length - 1 + staffRows.length - 1 + notificationRows.length - 1 + activityRows.length - 1,
        tasksCount: db.tasks.length,
        staffCount: db.members.length,
        notificationsCount: db.sheetNotifications?.length || 0,
        activityCount: db.sheetActivityLog?.length || 0,
        lastSyncedAt: db.googleSheetsConfig.lastSyncedAt,
      },
      sheets: {
        tasks: {
          headers: SHEET_HEADERS.tasks,
          rows: tasksRows.slice(1),
          total: tasksRows.length - 1
        },
        staff: {
          headers: SHEET_HEADERS.staff,
          rows: staffRows.slice(1),
          total: staffRows.length - 1
        },
        notifications: {
          headers: SHEET_HEADERS.notifications,
          rows: notificationRows.slice(1),
          total: notificationRows.length - 1
        },
        activity: {
          headers: SHEET_HEADERS.activity,
          rows: activityRows.slice(1),
          total: activityRows.length - 1
        }
      }
    });
  } catch (error) {
    console.error('Failed to get sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch Google Sheet data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const action = body.action || 'sync';

    if (action === 'connect') {
      const { spreadsheetId, spreadsheetUrl, sheetTitle, webAppUrl, serviceAccountEmail, serviceAccountKey, autoSyncOnChange } = body;
      
      let parsedId = spreadsheetId?.trim();
      let parsedUrl = spreadsheetUrl?.trim();

      // If user pasted full Google Sheet URL into spreadsheetId field
      if (parsedId && (parsedId.includes('docs.google.com') || parsedId.includes('spreadsheets/d/'))) {
        const match = parsedId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          parsedId = match[1];
          parsedUrl = `https://docs.google.com/spreadsheets/d/${parsedId}/edit`;
        }
      } else if (parsedId && !parsedUrl) {
        parsedUrl = `https://docs.google.com/spreadsheets/d/${parsedId}/edit`;
      }

      db.googleSheetsConfig = {
        ...db.googleSheetsConfig,
        isConnected: true,
        spreadsheetId: parsedId || db.googleSheetsConfig.spreadsheetId,
        spreadsheetUrl: parsedUrl || db.googleSheetsConfig.spreadsheetUrl,
        sheetTitle: sheetTitle?.trim() || db.googleSheetsConfig.sheetTitle,
        webAppUrl: webAppUrl ? webAppUrl.trim() : db.googleSheetsConfig.webAppUrl,
        serviceAccountEmail: serviceAccountEmail || db.googleSheetsConfig.serviceAccountEmail,
        serviceAccountKey: serviceAccountKey || db.googleSheetsConfig.serviceAccountKey,
        autoSyncOnChange: typeof autoSyncOnChange === 'boolean' ? autoSyncOnChange : true,
        lastSyncedAt: new Date().toISOString(),
      };

      saveDatabase(db);
      const syncResult = await syncLiveGoogleSheet(db);

      return NextResponse.json({
        success: true,
        message: 'Google Sheet connected successfully!',
        config: db.googleSheetsConfig,
        syncResult
      });
    }

    if (action === 'disconnect') {
      db.googleSheetsConfig.isConnected = false;
      saveDatabase(db);
      return NextResponse.json({
        success: true,
        message: 'Google Sheet integration switched to offline local mirror mode',
        config: db.googleSheetsConfig
      });
    }

    if (action === 'sync') {
      const syncResult = await syncLiveGoogleSheet(db);
      saveDatabase(db);
      return NextResponse.json({
        success: true,
        message: syncResult.message,
        config: db.googleSheetsConfig,
        syncResult
      });
    }

    if (action === 'test_email') {
      const targetEmail = body.to || 'nidhinzzx4@gmail.com';
      if (!db.googleSheetsConfig.webAppUrl) {
        return NextResponse.json({ error: 'Google Apps Script Web App URL is not configured' }, { status: 400 });
      }

      try {
        const testRes = await fetch(db.googleSheetsConfig.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'test_email',
            to: targetEmail
          })
        });
        const testText = await testRes.text();
        let parsed: any = {};
        try { parsed = JSON.parse(testText); } catch(e) {}

        return NextResponse.json({
          success: parsed.status === 'success',
          message: parsed.message || 'Test email dispatched via Apps Script',
          raw: parsed
        });
      } catch (err: any) {
        return NextResponse.json({ error: 'Failed to contact Apps Script: ' + err.message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update Google Sheet settings:', error);
    return NextResponse.json({ error: 'Google Sheet action failed' }, { status: 500 });
  }
}
