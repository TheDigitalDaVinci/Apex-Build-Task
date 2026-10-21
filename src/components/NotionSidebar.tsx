'use client';

import React from 'react';
import { Project, GoogleSheetsConfig, UserSession } from '@/lib/types';
import { GoogleSheetsIcon } from './GoogleSheetModal';
import { 
  LayoutGrid, 
  Table, 
  Users, 
  AlertTriangle, 
  ChevronDown, 
  Plus, 
  Bell, 
  FileText, 
  Radio, 
  ExternalLink, 
  Trash2,
  LogOut,
  UserCheck
} from 'lucide-react';

export type ActiveView = 'table' | 'board' | 'staff' | 'assignee' | 'critical';

interface NotionSidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProjectId: string | 'all';
  setSelectedProjectId: (id: string | 'all') => void;
  projects: Project[];
  totalTasks: number;
  criticalCount: number;
  sheetNotificationCount: number;
  membersCount: number;
  totalSyncedRows: number;
  googleSheetsConfig: GoogleSheetsConfig | null;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  onOpenSheetHub: (defaultTab?: 'tasks' | 'staff' | 'notifications' | 'activity' | 'settings') => void;
  onOpenMembers: () => void;
  onOpenNewTaskModal: () => void;
  onDeleteProject: (id: string) => Promise<void>;
  onAddProject: (name: string, code: string) => Promise<void>;
}

export function NotionSidebar({
  activeView,
  setActiveView,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  totalTasks,
  criticalCount,
  sheetNotificationCount,
  membersCount,
  totalSyncedRows,
  googleSheetsConfig,
  currentUser,
  onLogout,
  onOpenSheetHub,
  onOpenMembers,
  onOpenNewTaskModal,
  onDeleteProject,
  onAddProject,
}: NotionSidebarProps) {
  return (
    <aside className="w-64 bg-[#F7F6F3] border-r border-[#E8E7E4] flex flex-col h-screen select-none shrink-0 text-[#37352F]">
      
      {/* Workspace Header */}
      <div className="p-4 border-b border-[#E8E7E4] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            📐
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-xs text-gray-900 truncate tracking-tight">
              APEX DESIGN STUDIO
            </h1>
            <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
              <span>Google Sheet Operations</span>
            </p>
          </div>
        </div>
      </div>

      {/* User Session Profile Card */}
      {currentUser && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                currentUser.role === 'staff' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-orange-100 text-orange-800 border border-orange-200'
              }`}>
                {currentUser.role === 'staff' ? (currentUser.member.avatar || currentUser.member.name.charAt(0)) : '👑'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                  {currentUser.role === 'staff' ? currentUser.member.name : 'Lead Superintendent'}
                </p>
                <p className="text-[10px] text-gray-500 truncate font-medium">
                  {currentUser.role === 'staff' ? (currentUser.member.role || currentUser.member.trade) : 'Workspace Admin'}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Out / Switch Account"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {currentUser.role === 'staff' ? (
            <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>My Assigned Tasks</span>
              </span>
              <span className="font-bold font-mono bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">{totalTasks}</span>
            </div>
          ) : (
            <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-orange-700 font-medium">
              <span>Full Workspace Access</span>
              <span className="font-bold font-mono bg-orange-50 px-1.5 py-0.2 rounded border border-orange-100">{totalTasks} total</span>
            </div>
          )}
        </div>
      )}

      {/* Main Nav Links */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => setActiveView('table')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeView === 'table'
              ? 'bg-[#EAE8E3] text-gray-950 font-semibold'
              : 'hover:bg-[#EFEFEF] text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-gray-500" />
            <span>{currentUser?.role === 'staff' ? 'My Deliverables (Table)' : 'Table View'}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">{totalTasks}</span>
        </button>

        <button
          onClick={() => setActiveView('board')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeView === 'board'
              ? 'bg-[#EAE8E3] text-gray-950 font-semibold'
              : 'hover:bg-[#EFEFEF] text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-gray-500" />
            <span>{currentUser?.role === 'staff' ? 'My Kanban Board' : 'Kanban Board'}</span>
          </div>
        </button>

        {/* Dedicated Architects & Engineers Section (Admin only) */}
        {currentUser?.role !== 'staff' && (
          <>
            <button
              onClick={() => setActiveView('staff')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === 'staff'
                  ? 'bg-emerald-100/80 text-emerald-950 font-bold border border-emerald-300/50'
                  : 'hover:bg-[#EFEFEF] text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Architects & Engineers</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 font-mono">
                {membersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveView('assignee')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === 'assignee'
                  ? 'bg-[#EAE8E3] text-gray-950 font-semibold'
                  : 'hover:bg-[#EFEFEF] text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Workload by Staff</span>
              </div>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveView('critical')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeView === 'critical'
              ? 'bg-red-100/70 text-red-950 font-semibold'
              : 'hover:bg-[#EFEFEF] text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Permit & Liability Critical</span>
          </div>
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-200 text-red-800 font-mono">
              {criticalCount}
            </span>
          )}
        </button>
      </div>

      {/* Projects / Sites Section */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          <span>Project Portfolios</span>
          {currentUser?.role !== 'staff' && (
            <button
              onClick={() => {
                const name = window.prompt('Enter new project site name (e.g. Metro Line Central Station):');
                if (!name || !name.trim()) return;
                const code = window.prompt('Enter project code (e.g. MLC-2026):', name.substring(0, 3).toUpperCase() + '-P1');
                if (code && code.trim()) {
                  onAddProject(name.trim(), code.trim());
                }
              }}
              className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
              title="Create new project portfolio"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="space-y-0.5">
          <button
            onClick={() => setSelectedProjectId('all')}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
              selectedProjectId === 'all'
                ? 'bg-[#EAE8E3] text-gray-900 font-semibold'
                : 'hover:bg-[#EFEFEF] text-gray-600'
            }`}
          >
            <span>🌐</span>
            <span className="truncate">All Project Sites</span>
          </button>

          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                selectedProjectId === proj.id
                  ? 'bg-[#EAE8E3] text-gray-900 font-semibold'
                  : 'hover:bg-[#EFEFEF] text-gray-600'
              }`}
            >
              <button
                onClick={() => setSelectedProjectId(proj.id)}
                className="flex items-center gap-2 truncate text-left flex-1"
              >
                <span>{proj.icon}</span>
                <span className="truncate">{proj.name}</span>
              </button>

              {currentUser?.role !== 'staff' && projects.length > 1 && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to remove project "${proj.name}" (${proj.code})?\n\nAny existing deliverables will be moved to your primary project and the removal will be logged in Google Sheets.`)) {
                      await onDeleteProject(proj.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                  title={`Delete project "${proj.name}"`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Google Sheet Operations & Master Logs */}
      <div className="px-4 pt-4 pb-2 border-t border-[#E8E7E4]">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Google Sheet Backend
        </div>
        <div className="space-y-0.5">
          <button
            onClick={() => onOpenSheetHub('tasks')}
            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between hover:bg-[#EFEFEF] text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GoogleSheetsIcon className="w-4 h-4 shrink-0" />
              <span>Google Sheet Master</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
              {totalSyncedRows}
            </span>
          </button>

          <button
            onClick={() => onOpenSheetHub('notifications')}
            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between hover:bg-[#EFEFEF] text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-700" />
              <span>Notification Log</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
              {sheetNotificationCount}
            </span>
          </button>

          <button
            onClick={() => onOpenSheetHub('activity')}
            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 hover:bg-[#EFEFEF] text-gray-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Activity Audit Log</span>
          </button>

        {currentUser?.role !== 'staff' && (
          <button
            onClick={onOpenMembers}
            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between hover:bg-[#EFEFEF] text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Staff Roster Quick View</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{membersCount}</span>
          </button>
        )}
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 mt-auto border-t border-[#E8E7E4] space-y-2">
        <button
          onClick={onOpenNewTaskModal}
          className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Deliverable</span>
        </button>

        {/* Google Sheet Live Status Card */}
        <div
          onClick={() => onOpenSheetHub('settings')}
          className="p-2 rounded-lg bg-white border border-gray-200/80 cursor-pointer hover:border-emerald-400 transition-all text-[11px]"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>Google Sheet Backend</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Auto-Sync
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate font-mono">
            {googleSheetsConfig?.sheetTitle || '4 Sheet Tabs Active'}
          </p>
        </div>
      </div>

    </aside>
  );
}
