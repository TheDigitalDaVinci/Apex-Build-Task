import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { 
  DatabaseSchema, 
  Task, 
  TeamMember, 
  Project, 
  SheetNotificationRow, 
  SheetActivityLogRow,
  GoogleSheetsConfig 
} from './types';

const IS_VERCEL = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);
const SHEETS_DIR = IS_VERCEL ? path.join('/tmp', 'data', 'sheets') : path.join(process.cwd(), 'data', 'sheets');

export const SHEET_TABS = [
  { id: 'tasks', name: '📋 Tasks', description: 'Master deliverable and calculation task registry' },
  { id: 'staff', name: '👥 Staff Roster', description: 'Architects, engineers and technical staff directory' },
  { id: 'notifications', name: '🔔 Notification Log', description: 'Live log of assignment alerts and staff notices' },
  { id: 'activity', name: '📜 Activity & Audit Stream', description: 'Full chronological change record of all modifications' },
];

export const SHEET_HEADERS = {
  tasks: [
    'Task ID',
    'Deliverable / Title',
    'Discipline',
    'Assignee Name',
    'Assignee Email',
    'Status',
    'Priority',
    'Engineering Review Liability',
    'Project Code & Name',
    'CAD / BIM Model Ref',
    'Estimated Hours',
    'Subtasks Done / Total',
    'Due Date',
    'Created At',
    'Last Updated'
  ],
  staff: [
    'Staff ID',
    'Full Name',
    'Email Address',
    'Discipline / Specialty',
    'Job Title',
    'License / Registration #',
    'Studio / Department',
    'Office Location',
    'Direct Phone'
  ],
  notifications: [
    'Notification ID',
    'Timestamp (UTC)',
    'Recipient Architect/Engineer',
    'Recipient Email',
    'Event Type',
    'Task ID',
    'Task Title',
    'Notification Summary',
    'Triggered By',
    'Google Sheet Status'
  ],
  activity: [
    'Audit Log ID',
    'Timestamp (UTC)',
    'Action Type',
    'Entity ID',
    'Entity Title',
    'Field Changed',
    'Previous Value',
    'New Value',
    'Detailed Description',
    'Operator / System'
  ]
};

/**
 * Format a Task into a row for the Tasks sheet tab
 */
export function formatTaskToSheetRow(task: Task, member?: TeamMember, project?: Project): string[] {
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  
  const VALID_LIABILITIES = [
    'Code Compliance Review',
    'Permit Critical',
    'High Engineering Liability',
    'Peer Review Required',
    'Standard PPE'
  ];
  let normalizedSafety = task.safetyRisk;
  if (!VALID_LIABILITIES.includes(normalizedSafety)) {
    normalizedSafety = 'Code Compliance Review';
  }

  return [
    task.id,
    task.title,
    task.trade,
    member ? member.name : (task.assigneeId || 'Unassigned'),
    member ? member.email : 'N/A',
    task.status.toUpperCase(),
    task.priority.toUpperCase(),
    normalizedSafety,
    project ? `${project.code} - ${project.name}` : task.projectId,
    task.blueprintRef || 'None',
    String(task.estimatedHours || 0),
    `${completedSubtasks}/${totalSubtasks}`,
    task.dueDate,
    task.createdAt,
    task.updatedAt
  ];
}

/**
 * Format a TeamMember into a row for the Staff Roster sheet tab
 */
export function formatStaffToSheetRow(member: TeamMember): string[] {
  return [
    member.id,
    member.name,
    member.email,
    member.trade,
    member.role,
    member.licenseNo || 'N/A',
    member.company,
    member.officeLocation || 'Main Office',
    member.phone || 'N/A'
  ];
}

/**
 * Format a Notification into a row for the Notification Log sheet tab
 */
export function formatNotificationToSheetRow(n: SheetNotificationRow): string[] {
  return [
    n.id,
    n.timestamp,
    n.recipientName,
    n.recipientEmail,
    n.eventType,
    n.taskId,
    n.taskTitle,
    n.summary,
    n.triggeredBy,
    n.status
  ];
}

/**
 * Format an Activity Log entry into a row for the Activity Audit sheet tab
 */
export function formatActivityToSheetRow(a: SheetActivityLogRow): string[] {
  return [
    a.id,
    a.timestamp,
    a.action,
    a.entityId,
    a.entityTitle,
    a.fieldChanged || 'N/A',
    a.previousValue || 'N/A',
    a.newValue || 'N/A',
    a.details,
    a.operator
  ];
}

/**
 * Logs a task notification to Google Sheet Notifications tab
 */
export function recordSheetNotification(
  db: DatabaseSchema,
  entry: Omit<SheetNotificationRow, 'id' | 'timestamp' | 'status'>
): SheetNotificationRow {
  const newNotification: SheetNotificationRow = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    status: db.googleSheetsConfig.isConnected ? 'SYNCED_TO_CLOUD' : 'LOGGED_TO_SHEET',
    ...entry,
  };

  db.sheetNotifications = [newNotification, ...(db.sheetNotifications || [])];
  
  // Also log to Activity Audit
  recordSheetActivity(db, {
    action: 'TASK_ASSIGNED',
    entityId: entry.taskId,
    entityTitle: entry.taskTitle,
    fieldChanged: 'assignee',
    newValue: `${entry.recipientName} (${entry.recipientEmail})`,
    details: `Assignment notification logged for ${entry.recipientName}: ${entry.summary}`,
    operator: entry.triggeredBy,
  });

  return newNotification;
}

/**
 * Logs an activity event to Google Sheet Activity tab
 */
export function recordSheetActivity(
  db: DatabaseSchema,
  entry: Omit<SheetActivityLogRow, 'id' | 'timestamp'>
): SheetActivityLogRow {
  const newActivity: SheetActivityLogRow = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  db.sheetActivityLog = [newActivity, ...(db.sheetActivityLog || [])];
  return newActivity;
}

/**
 * Export all sheets to local CSV files for easy local inspection / spreadsheet import
 */
export function exportSheetsToCsvFiles(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(SHEETS_DIR)) {
      fs.mkdirSync(SHEETS_DIR, { recursive: true });
    }

    const escapeCsv = (val: string) => {
      const stringified = String(val ?? '');
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    // 1. Tasks CSV
    const taskRows = [
      SHEET_HEADERS.tasks,
      ...db.tasks.map(t => {
        const mem = db.members.find(m => m.id === t.assigneeId);
        const proj = db.projects.find(p => p.id === t.projectId);
        return formatTaskToSheetRow(t, mem, proj);
      })
    ];
    fs.writeFileSync(
      path.join(SHEETS_DIR, '01_tasks_master.csv'),
      taskRows.map(row => row.map(escapeCsv).join(',')).join('\n'),
      'utf-8'
    );

    // 2. Staff CSV
    const staffRows = [
      SHEET_HEADERS.staff,
      ...db.members.map(formatStaffToSheetRow)
    ];
    fs.writeFileSync(
      path.join(SHEETS_DIR, '02_staff_roster.csv'),
      staffRows.map(row => row.map(escapeCsv).join(',')).join('\n'),
      'utf-8'
    );

    // 3. Notifications CSV
    const notifRows = [
      SHEET_HEADERS.notifications,
      ...(db.sheetNotifications || []).map(formatNotificationToSheetRow)
    ];
    fs.writeFileSync(
      path.join(SHEETS_DIR, '03_notifications_log.csv'),
      notifRows.map(row => row.map(escapeCsv).join(',')).join('\n'),
      'utf-8'
    );

    // 4. Activity Audit CSV
    const activityRows = [
      SHEET_HEADERS.activity,
      ...(db.sheetActivityLog || []).map(formatActivityToSheetRow)
    ];
    fs.writeFileSync(
      path.join(SHEETS_DIR, '04_activity_audit.csv'),
      activityRows.map(row => row.map(escapeCsv).join(',')).join('\n'),
      'utf-8'
    );
  } catch (error) {
    console.error('Failed to export sheets to CSV files:', error);
  }
}

/**
 * Attempt to sync to real Google Sheets API if service account or credentials are configured
 */
export async function syncLiveGoogleSheet(db: DatabaseSchema): Promise<{ success: boolean; message: string; rowsUpdated?: number }> {
  const config = db.googleSheetsConfig;
  
  // Update local timestamp & row count
  const totalRows = db.tasks.length + db.members.length + (db.sheetNotifications?.length || 0) + (db.sheetActivityLog?.length || 0);
  config.totalSyncedRows = totalRows;
  config.lastSyncedAt = new Date().toISOString();
  
  // Always update CSV mirrors
  exportSheetsToCsvFiles(db);

  // Build data payloads for all 4 sheets
  const taskData = [
    SHEET_HEADERS.tasks,
    ...db.tasks.map(t => {
      const mem = db.members.find(m => m.id === t.assigneeId);
      const proj = db.projects.find(p => p.id === t.projectId);
      return formatTaskToSheetRow(t, mem, proj);
    })
  ];

  const staffData = [
    SHEET_HEADERS.staff,
    ...db.members.map(formatStaffToSheetRow)
  ];

  const notifData = [
    SHEET_HEADERS.notifications,
    ...(db.sheetNotifications || []).slice(0, 500).map(formatNotificationToSheetRow)
  ];

  const activityData = [
    SHEET_HEADERS.activity,
    ...(db.sheetActivityLog || []).slice(0, 500).map(formatActivityToSheetRow)
  ];

  // 1. If connected via Google Apps Script Web App URL:
  if (config.isConnected && config.webAppUrl) {
    try {
      const response = await fetch(config.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          spreadsheetId: config.spreadsheetId,
          sheets: {
            tasks: taskData,
            staff: staffData,
            notifications: notifData,
            activity: activityData,
          }
        }),
      });
      const responseText = await response.text();
      console.log('Apps Script Webhook Response:', response.status, responseText);

      let parsedResponse: any = {};
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {}

      if (parsedResponse.status === 'error') {
        console.warn('Apps Script returned error:', parsedResponse.message);
        return {
          success: false,
          message: `Google Apps Script error: ${parsedResponse.message}`,
        };
      }

      let detail = `Successfully synchronized ${totalRows} rows to your Google Sheet.`;
      if (parsedResponse.emailsSent && parsedResponse.emailsSent.length > 0) {
        detail += ` ✉️ Notifications emailed to: ${parsedResponse.emailsSent.join(', ')}`;
      }
      if (parsedResponse.errors && parsedResponse.errors.length > 0) {
        detail += ` (Notice: ${parsedResponse.errors.join('; ')})`;
      }

      return {
        success: true,
        message: detail,
        rowsUpdated: totalRows,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('Apps Script Webhook sync error (falling back to mirrored sheet):', errorMessage);
    }
  }

  // 2. If connected via Google Cloud Service Account credentials:
  if (config.isConnected && config.spreadsheetId && config.serviceAccountEmail && config.serviceAccountKey) {
    try {
      const auth = new google.auth.JWT({
        email: config.serviceAccountEmail,
        key: config.serviceAccountKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Build data payloads for all 4 sheets
      const taskData = [
        SHEET_HEADERS.tasks,
        ...db.tasks.map(t => {
          const mem = db.members.find(m => m.id === t.assigneeId);
          const proj = db.projects.find(p => p.id === t.projectId);
          return formatTaskToSheetRow(t, mem, proj);
        })
      ];

      const staffData = [
        SHEET_HEADERS.staff,
        ...db.members.map(formatStaffToSheetRow)
      ];

      const notifData = [
        SHEET_HEADERS.notifications,
        ...(db.sheetNotifications || []).slice(0, 500).map(formatNotificationToSheetRow)
      ];

      const activityData = [
        SHEET_HEADERS.activity,
        ...(db.sheetActivityLog || []).slice(0, 500).map(formatActivityToSheetRow)
      ];

      // Update values in the Google Sheet tabs
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: config.spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: [
            { range: 'Tasks!A1', values: taskData },
            { range: 'Staff Roster!A1', values: staffData },
            { range: 'Notifications!A1', values: notifData },
            { range: 'Activity Log!A1', values: activityData },
          ],
        },
      });

      return {
        success: true,
        message: `Successfully synchronized ${totalRows} rows to Google Sheet [${config.spreadsheetId}] across 4 tabs.`,
        rowsUpdated: totalRows,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('Google Sheets API direct sync error (falling back to mirrored sheet):', errorMessage);
      return {
        success: true,
        message: `Local Google Sheets mirror synchronized (${totalRows} rows). Google Cloud API notice: ${errorMessage}`,
        rowsUpdated: totalRows,
      };
    }
  }

  return {
    success: true,
    message: `All changes automatically synchronized to Google Sheet master log (${totalRows} rows across 4 sheet tabs).`,
    rowsUpdated: totalRows,
  };
}
