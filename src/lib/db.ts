import fs from 'fs';
import path from 'path';
import { 
  DatabaseSchema, 
  Task, 
  TeamMember, 
  Project, 
  SheetNotificationRow, 
  SheetActivityLogRow, 
  GoogleSheetsConfig 
} from './types';
import { exportSheetsToCsvFiles } from './googleSheets';

const IS_VERCEL = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const SEED_FILE = path.join(process.cwd(), 'data', 'store.json');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Apex Skyline Tower (Phase 3)',
    code: 'AST-P3',
    location: '450 Metropolis Ave, Downtown Core',
    manager: 'Arthur Sterling (Chief Superintendent)',
    status: 'active',
    icon: '🏢',
  },
  {
    id: 'proj-2',
    name: 'Oakridge Luxury Residential Villas',
    code: 'ORV-2026',
    location: '88 Meadowbrook Ridge, North Sector',
    manager: 'Clara Oswald (Senior PM)',
    status: 'active',
    icon: '🏡',
  },
  {
    id: 'proj-3',
    name: 'St. Jude Hospital West Wing Expansion',
    code: 'SJH-EXP',
    location: '120 Health Sciences Blvd',
    manager: 'Frank DeLuca (Site Director)',
    status: 'active',
    icon: '🏥',
  },
];

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Sophia Al-Mansoor, AIA',
    email: 'sophia.almansoor@apexconstruct.demo',
    role: 'Principal Architectural Designer',
    trade: 'Architectural Design',
    phone: '+1 (555) 234-9081',
    avatar: 'SA',
    company: 'Studio A - High-Rise Architectural Lab',
    licenseNo: 'AIA #94210 / LEED AP',
    officeLocation: 'HQ 4th Floor - Studio 402',
  },
  {
    id: 'mem-2',
    name: 'Dr. Jonathan Vance, PE, SE',
    email: 'jonathan.vance@apexconstruct.demo',
    role: 'Chief Structural Engineer',
    trade: 'Structural Engineering',
    phone: '+1 (555) 872-4911',
    avatar: 'JV',
    company: 'Structural Engineering Division',
    licenseNo: 'PE / SE #58392',
    officeLocation: 'HQ 3rd Floor - Eng Bay 2',
  },
  {
    id: 'mem-3',
    name: 'Liam Tanaka, PE',
    email: 'liam.tanaka@apexconstruct.demo',
    role: 'Lead MEP Systems Engineer',
    trade: 'MEP Engineering',
    phone: '+1 (555) 621-0988',
    avatar: 'LT',
    company: 'Mechanical & Electrical Systems Group',
    licenseNo: 'PE #71890',
    officeLocation: 'HQ 3rd Floor - MEP Lab',
  },
  {
    id: 'mem-4',
    name: 'Maya Lin-Rodriguez',
    email: 'maya.lin@apexconstruct.demo',
    role: 'Senior BIM / VDC Manager',
    trade: 'BIM & VDC Coordination',
    phone: '+1 (555) 438-7729',
    avatar: 'ML',
    company: 'Virtual Design & Construction Dept',
    licenseNo: 'Autodesk Certified Professional (Revit)',
    officeLocation: 'HQ 4th Floor - BIM Hub',
  },
  {
    id: 'mem-5',
    name: 'Carlos Mendoza, PE',
    email: 'carlos.mendoza@apexconstruct.demo',
    role: 'Civil & Geotechnical Engineer',
    trade: 'Civil & Geotechnical',
    phone: '+1 (555) 912-3401',
    avatar: 'CM',
    company: 'Infrastructure & Site Engineering Group',
    licenseNo: 'PE #43120',
    officeLocation: 'HQ 2nd Floor - Civil Office',
  },
  {
    id: 'mem-6',
    name: 'Elena Rostova, RA',
    email: 'elena.rostova@apexconstruct.demo',
    role: 'Senior Building Code & Permitting Officer',
    trade: 'Building Code & Permitting',
    phone: '+1 (555) 704-5518',
    avatar: 'ER',
    company: 'Regulatory & Permitting Affairs',
    licenseNo: 'Registered Architect #66201',
    officeLocation: 'HQ 5th Floor - Compliance Desk',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    title: 'Review 3D ETABS Seismic Shear Wall Calculations & Stamped Report - Tower Core',
    description: 'Perform non-linear response history analysis on Level 12-28 core shear walls to verify drift limits under ASCE 7-22 lateral seismic loading. Sign and stamp calculation package.',
    projectId: 'proj-1',
    assigneeId: 'mem-2',
    status: 'in_progress',
    priority: 'critical',
    trade: 'Structural Engineering',
    zone: 'Calc Package: SEC-C300 (Rev 2)',
    dueDate: '2026-10-24',
    estimatedHours: 28,
    safetyRisk: 'High Engineering Liability',
    blueprintRef: 'ETABS Model v22.4 / Sheet S-201',
    subtasks: [
      { id: 'st-1', title: 'Verify base shear coefficient against geotechnical soil class D', completed: true },
      { id: 'st-2', title: 'Check boundary element confining rebar ratios', completed: true },
      { id: 'st-3', title: 'Format calculation book for city structural peer review', completed: false },
      { id: 'st-4', title: 'Apply digital PE/SE stamp & signature', completed: false },
    ],
    lastNotifiedAt: '2026-10-18T14:30:00.000Z',
    createdAt: '2026-10-17T09:00:00.000Z',
    updatedAt: '2026-10-18T14:30:00.000Z',
  },
  {
    id: 'task-102',
    title: 'Revit Architectural Shell & Core LOD 350 Model Coordination for Permit Submission',
    description: 'Integrate exterior curtain wall mullion details, elevator shaft dimensions, and fire-rated egress stair enclosures into central Revit BIM model. Export IFC and NWD clash federated files.',
    projectId: 'proj-1',
    assigneeId: 'mem-1',
    status: 'ready',
    priority: 'high',
    trade: 'Architectural Design',
    zone: 'Revit Central Model: AST-ARCH-2026',
    dueDate: '2026-10-22',
    estimatedHours: 32,
    safetyRisk: 'Permit Critical',
    blueprintRef: 'Sheets A-101 through A-140',
    subtasks: [
      { id: 'st-5', title: 'Align floor-to-floor datum levels with structural grid', completed: true },
      { id: 'st-6', title: 'Audit door schedule fire-rating ratings against life safety plan', completed: false },
      { id: 'st-7', title: 'Issue 90% Construction Documents PDF package', completed: false },
    ],
    lastNotifiedAt: '2026-10-18T10:15:00.000Z',
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:15:00.000Z',
  },
  {
    id: 'task-103',
    title: 'MEP Chilled Water Pipe Routing Clash Detection & Energy Model Simulation',
    description: 'Run Navisworks clash report between 10" chilled water risers and structural transfer girders on Floor 6. Update Trane Trace 700 HVAC load calculations for ASHRAE 90.1 energy compliance.',
    projectId: 'proj-3',
    assigneeId: 'mem-3',
    status: 'in_progress',
    priority: 'high',
    trade: 'MEP Engineering',
    zone: 'Building Systems: Level 6 Transfer Deck',
    dueDate: '2026-10-26',
    estimatedHours: 20,
    safetyRisk: 'Code Compliance Review',
    blueprintRef: 'Revit MEP-601 / Clash Report #14',
    subtasks: [
      { id: 'st-8', title: 'Isolate hard clashes with structural steel beams', completed: true },
      { id: 'st-9', title: 'Re-route return ductwork loop around elevator vestibule', completed: false },
      { id: 'st-10', title: 'Issue coordination change bulletin to architecture team', completed: false },
    ],
    lastNotifiedAt: '2026-10-17T11:45:00.000Z',
    createdAt: '2026-10-16T15:00:00.000Z',
    updatedAt: '2026-10-17T11:45:00.000Z',
  },
  {
    id: 'task-104',
    title: 'Prepare Life Safety & Egress Capacity Calculations for IBC Chapter 10 Permit Review',
    description: 'Calculate occupant load factors, stair egress capacity, common path of travel, and exit separation distances for municipal Department of Buildings permit application.',
    projectId: 'proj-1',
    assigneeId: 'mem-6',
    status: 'inspection',
    priority: 'critical',
    trade: 'Building Code & Permitting',
    zone: 'Regulatory Review: Permit Dossier G-002',
    dueDate: '2026-10-21',
    estimatedHours: 16,
    safetyRisk: 'Permit Critical',
    blueprintRef: 'Life Safety Plan LS-101 to LS-105',
    subtasks: [
      { id: 'st-11', title: 'Check travel distance to exit discharge on podium levels', completed: true },
      { id: 'st-12', title: 'Verify smoke barrier door magnetic release specs', completed: true },
      { id: 'st-13', title: 'Compile plan examiner response memorandum', completed: false },
    ],
    lastNotifiedAt: '2026-10-18T08:00:00.000Z',
    createdAt: '2026-10-18T08:00:00.000Z',
    updatedAt: '2026-10-18T08:00:00.000Z',
  },
  {
    id: 'task-105',
    title: 'Civil Grading & Stormwater Retention Calculations for Site Drainage Plan',
    description: 'Compute 50-year and 100-year storm event runoff coefficients using the Rational Method. Size underground detention vault and stormwater bio-retention swales.',
    projectId: 'proj-2',
    assigneeId: 'mem-5',
    status: 'backlog',
    priority: 'medium',
    trade: 'Civil & Geotechnical',
    zone: 'Civil Plan: C-201 to C-208',
    dueDate: '2026-10-29',
    estimatedHours: 24,
    safetyRisk: 'Code Compliance Review',
    blueprintRef: 'Civil 3D Surface Model (Rev 3)',
    subtasks: [
      { id: 'st-14', title: 'Import geotechnical percolation test data', completed: false },
      { id: 'st-15', title: 'Size orifice plate on outflow weir box', completed: false },
      { id: 'st-16', title: 'Submit drainage narrative to county water resources board', completed: false },
    ],
    lastNotifiedAt: '2026-10-16T16:00:00.000Z',
    createdAt: '2026-10-16T16:00:00.000Z',
    updatedAt: '2026-10-16T16:00:00.000Z',
  },
  {
    id: 'task-106',
    title: 'BIM Federated Model Clash Resolution Meeting & Master Coordination Matrix',
    description: 'Conduct bi-weekly BIM coordination review with all lead engineers. Log resolved clashes in Navisworks and assign unresolved spatial conflicts with revision deadlines.',
    projectId: 'proj-3',
    assigneeId: 'mem-4',
    status: 'ready',
    priority: 'medium',
    trade: 'BIM & VDC Coordination',
    zone: 'BIM 360 Cloud Coordination Hub',
    dueDate: '2026-10-23',
    estimatedHours: 12,
    safetyRisk: 'Code Compliance Review',
    blueprintRef: 'Federated Model v18 (NWF)',
    subtasks: [
      { id: 'st-17', title: 'Export clash batch #12 report', completed: true },
      { id: 'st-18', title: 'Coordinate structural column penetrations with architectural ceiling cavity', completed: false },
      { id: 'st-19', title: 'Issue updated viewpoint BCF file to engineering leads', completed: false },
    ],
    lastNotifiedAt: '2026-10-17T13:20:00.000Z',
    createdAt: '2026-10-17T13:00:00.000Z',
    updatedAt: '2026-10-17T13:20:00.000Z',
  },
];

const INITIAL_SHEET_NOTIFICATIONS: SheetNotificationRow[] = [
  {
    id: 'notif-101',
    timestamp: '2026-10-18T14:30:00.000Z',
    recipientName: 'Dr. Jonathan Vance, PE, SE',
    recipientEmail: 'jonathan.vance@apexconstruct.demo',
    recipientRole: 'Chief Structural Engineer',
    eventType: 'TASK_ASSIGNED',
    taskId: 'task-101',
    taskTitle: 'Review 3D ETABS Seismic Shear Wall Calculations & Stamped Report - Tower Core',
    summary: 'Assigned High Engineering Liability deliverable. Due: 2026-10-24. Requires PE/SE digital stamp.',
    triggeredBy: 'Engineering Dispatcher',
    status: 'LOGGED_TO_SHEET',
  },
  {
    id: 'notif-102',
    timestamp: '2026-10-18T10:15:00.000Z',
    recipientName: 'Sophia Al-Mansoor, AIA',
    recipientEmail: 'sophia.almansoor@apexconstruct.demo',
    recipientRole: 'Principal Architectural Designer',
    eventType: 'TASK_ASSIGNED',
    taskId: 'task-102',
    taskTitle: 'Revit Architectural Shell & Core LOD 350 Model Coordination for Permit Submission',
    summary: 'Assigned Permit Critical deliverable. Due: 2026-10-22. Central model AST-ARCH-2026.',
    triggeredBy: 'Project Director',
    status: 'LOGGED_TO_SHEET',
  },
  {
    id: 'notif-103',
    timestamp: '2026-10-17T11:45:00.000Z',
    recipientName: 'Liam Tanaka, PE',
    recipientEmail: 'liam.tanaka@apexconstruct.demo',
    recipientRole: 'Lead MEP Systems Engineer',
    eventType: 'TASK_ASSIGNED',
    taskId: 'task-103',
    taskTitle: 'MEP Chilled Water Pipe Routing Clash Detection & Energy Model Simulation',
    summary: 'Assigned Code Compliance Review. Level 6 Transfer Deck coordination.',
    triggeredBy: 'Engineering Dispatcher',
    status: 'LOGGED_TO_SHEET',
  },
  {
    id: 'notif-104',
    timestamp: '2026-10-18T08:00:00.000Z',
    recipientName: 'Elena Rostova, RA',
    recipientEmail: 'elena.rostova@apexconstruct.demo',
    recipientRole: 'Senior Building Code & Permitting Officer',
    eventType: 'TASK_ASSIGNED',
    taskId: 'task-104',
    taskTitle: 'Prepare Life Safety & Egress Capacity Calculations for IBC Chapter 10 Permit Review',
    summary: 'Assigned Permit Critical deliverable. Due: 2026-10-21. Urgent permit package G-002.',
    triggeredBy: 'Chief Architect',
    status: 'LOGGED_TO_SHEET',
  },
  {
    id: 'notif-105',
    timestamp: '2026-10-16T16:00:00.000Z',
    recipientName: 'Carlos Mendoza, PE',
    recipientEmail: 'carlos.mendoza@apexconstruct.demo',
    recipientRole: 'Civil & Geotechnical Engineer',
    eventType: 'TASK_ASSIGNED',
    taskId: 'task-105',
    taskTitle: 'Civil Grading & Stormwater Retention Calculations for Site Drainage Plan',
    summary: 'Assigned Civil Engineering package. 50-year runoff analysis.',
    triggeredBy: 'Senior PM',
    status: 'LOGGED_TO_SHEET',
  },
];

const INITIAL_SHEET_ACTIVITY: SheetActivityLogRow[] = [
  {
    id: 'audit-001',
    timestamp: '2026-10-18T14:30:00.000Z',
    action: 'TASK_ASSIGNED',
    entityId: 'task-101',
    entityTitle: 'Review 3D ETABS Seismic Shear Wall Calculations',
    fieldChanged: 'assignee',
    previousValue: 'Unassigned',
    newValue: 'Dr. Jonathan Vance, PE, SE (jonathan.vance@apexconstruct.demo)',
    details: 'Task assigned to Dr. Jonathan Vance. Notification logged to Google Sheet Notifications tab.',
    operator: 'Engineering Dispatcher',
  },
  {
    id: 'audit-002',
    timestamp: '2026-10-18T10:15:00.000Z',
    action: 'STATUS_CHANGED',
    entityId: 'task-102',
    entityTitle: 'Revit Architectural Shell & Core LOD 350 Model Coordination',
    fieldChanged: 'status',
    previousValue: 'BACKLOG',
    newValue: 'READY',
    details: 'Status transitioned from Backlog to Ready for permit submission review.',
    operator: 'Sophia Al-Mansoor, AIA',
  },
  {
    id: 'audit-003',
    timestamp: '2026-10-18T08:00:00.000Z',
    action: 'TASK_CREATED',
    entityId: 'task-104',
    entityTitle: 'Prepare Life Safety & Egress Capacity Calculations',
    fieldChanged: 'lifecycle',
    newValue: 'CREATED',
    details: 'New permit critical calculation task created and appended to Google Sheet Tasks tab.',
    operator: 'Chief Architect',
  },
  {
    id: 'audit-004',
    timestamp: '2026-10-17T09:00:00.000Z',
    action: 'STAFF_REGISTERED',
    entityId: 'mem-2',
    entityTitle: 'Dr. Jonathan Vance, PE, SE',
    fieldChanged: 'roster',
    newValue: 'ACTIVE_STAFF',
    details: 'Staff member registered in Google Sheet Staff Roster tab with License PE / SE #58392.',
    operator: 'HR & Studio Administration',
  },
];

const INITIAL_GOOGLE_SHEETS_CONFIG: GoogleSheetsConfig = {
  isConnected: true,
  spreadsheetId: '1Pjvf1yxKPxwRkK5T_1407xn3sY9U9Owo7QnxvlgyMok',
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1Pjvf1yxKPxwRkK5T_1407xn3sY9U9Owo7QnxvlgyMok/edit',
  sheetTitle: 'Task Handler - Operations Hub',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbxrR8Uq4wqUZb4VEiIk8Sw9GHBvwWH6cUYWOmH1P9vee_X--NXojnmq8dXypcHjrhQl/exec',
  lastSyncedAt: new Date().toISOString(),
  syncMode: 'local_mirror',
  autoSyncOnChange: true,
  totalSyncedRows: 98,
};

export function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.warn('Could not create DATA_DIR:', e);
      }
    }

    if (!fs.existsSync(DB_FILE)) {
      // If deployed on Vercel or DB_FILE does not exist, initialize from repository SEED_FILE if present
      if (fs.existsSync(SEED_FILE)) {
        try {
          const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
          try {
            fs.writeFileSync(DB_FILE, seedContent, 'utf-8');
          } catch (writeErr) {
            console.warn('Could not cache seed file to DB_FILE:', writeErr);
          }
          return JSON.parse(seedContent) as DatabaseSchema;
        } catch (e) {
          console.warn('Could not parse seed file:', e);
        }
      }

      const initialDb: DatabaseSchema = {
        projects: INITIAL_PROJECTS,
        members: INITIAL_MEMBERS,
        tasks: INITIAL_TASKS,
        sheetNotifications: INITIAL_SHEET_NOTIFICATIONS,
        sheetActivityLog: INITIAL_SHEET_ACTIVITY,
        googleSheetsConfig: INITIAL_GOOGLE_SHEETS_CONFIG,
      };
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
        exportSheetsToCsvFiles(initialDb);
      } catch (err) {
        console.warn('Could not write initialDb to file:', err);
      }
      return initialDb;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;

    // Graceful migration from older schema:
    let modified = false;
    if (!parsed.googleSheetsConfig) {
      parsed.googleSheetsConfig = INITIAL_GOOGLE_SHEETS_CONFIG;
      modified = true;
    }
    if (!parsed.sheetNotifications || parsed.sheetNotifications.length === 0) {
      parsed.sheetNotifications = INITIAL_SHEET_NOTIFICATIONS;
      modified = true;
    }
    if (!parsed.sheetActivityLog || parsed.sheetActivityLog.length === 0) {
      parsed.sheetActivityLog = INITIAL_SHEET_ACTIVITY;
      modified = true;
    }

    if (modified) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        exportSheetsToCsvFiles(parsed);
      } catch (e) {
        console.warn('Could not write modified db:', e);
      }
    }

    return parsed;
  } catch (error) {
    console.error('Failed to read database:', error);
    return {
      projects: INITIAL_PROJECTS,
      members: INITIAL_MEMBERS,
      tasks: INITIAL_TASKS,
      sheetNotifications: INITIAL_SHEET_NOTIFICATIONS,
      sheetActivityLog: INITIAL_SHEET_ACTIVITY,
      googleSheetsConfig: INITIAL_GOOGLE_SHEETS_CONFIG,
    };
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {}
    }
    // Update synced row count
    const totalRows = (data.tasks?.length || 0) + 
      (data.members?.length || 0) + 
      (data.sheetNotifications?.length || 0) + 
      (data.sheetActivityLog?.length || 0);
    
    if (data.googleSheetsConfig) {
      data.googleSheetsConfig.totalSyncedRows = totalRows;
      data.googleSheetsConfig.lastSyncedAt = new Date().toISOString();
    }
    
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    // Mirror to CSV files as well
    exportSheetsToCsvFiles(data);
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}
