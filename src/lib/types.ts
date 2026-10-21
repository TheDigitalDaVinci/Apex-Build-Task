export type TaskStatus = 'backlog' | 'ready' | 'in_progress' | 'inspection' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TradeType = 
  | 'Architectural Design'
  | 'Structural Engineering'
  | 'MEP Engineering'
  | 'Civil & Geotechnical'
  | 'BIM & VDC Coordination'
  | 'Building Code & Permitting'
  | 'Facade & Building Envelope'
  | 'Sustainability & LEED'
  | 'Project Management';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  trade: TradeType;
  zone: string; // e.g. "Drawing Package 3", "Tower Core - Foundation Specs"
  dueDate: string;
  estimatedHours: number;
  safetyRisk: 'Standard PPE' | 'Fall Hazard (Harness)' | 'Hot Work Permit' | 'Confined Space' | 'Electrical Hazard' | 'High Engineering Liability' | 'Permit Critical' | 'Code Compliance Review';
  blueprintRef?: string; // Software Model / CAD Sheet (e.g., "Revit 2026 Model - S-101 to S-120")
  subtasks: Subtask[];
  lastNotifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  sheetRowIndex?: number; // Google Sheet Row Index
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  trade: TradeType;
  phone: string;
  avatar: string;
  company: string; // Studio / Department (e.g., "Structural Engineering Studio", "High-Rise Design Lab")
  licenseNo?: string; // PE / AIA Registration #
  officeLocation?: string; // Office Desk / Studio Room
  sheetRowIndex?: number;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  status: 'active' | 'planning' | 'near_completion';
  icon: string;
}

export interface SheetNotificationRow {
  id: string;
  timestamp: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole: string;
  eventType: 'TASK_ASSIGNED' | 'STATUS_CHANGED' | 'DEADLINE_UPDATED' | 'LIABILITY_REVIEW_FLAGGED' | 'SUBTASK_COMPLETED';
  taskId: string;
  taskTitle: string;
  summary: string;
  triggeredBy: string;
  status: 'LOGGED_TO_SHEET' | 'SYNCED_TO_CLOUD' | 'PENDING';
}

export interface SheetActivityLogRow {
  id: string;
  timestamp: string;
  action: 'TASK_CREATED' | 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'STATUS_CHANGED' | 'STAFF_REGISTERED' | 'STAFF_REMOVED' | 'PROJECT_CREATED' | 'PROJECT_DELETED' | 'SUBTASK_TOGGLED';
  entityId: string;
  entityTitle: string;
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  details: string;
  operator: string;
}

export interface GoogleSheetsConfig {
  isConnected: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  webAppUrl?: string; // Google Apps Script Web App Deployment URL (for direct push)
  appUrl?: string; // Production Website URL for email notification buttons
  lastSyncedAt?: string;
  syncMode: 'cloud_api' | 'local_mirror' | 'service_account';
  apiKey?: string;
  serviceAccountEmail?: string;
  serviceAccountKey?: string;
  autoSyncOnChange: boolean;
  totalSyncedRows: number;
}

export interface DatabaseSchema {
  projects: Project[];
  members: TeamMember[];
  tasks: Task[];
  sheetNotifications: SheetNotificationRow[];
  sheetActivityLog: SheetActivityLogRow[];
  googleSheetsConfig: GoogleSheetsConfig;
}

export type UserSession = 
  | { role: 'admin'; name: string; email: string }
  | { role: 'staff'; member: TeamMember };

