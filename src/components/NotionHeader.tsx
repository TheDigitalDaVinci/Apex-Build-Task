'use client';

import React from 'react';
import { ActiveView } from './NotionSidebar';
import { TradeType, Project, GoogleSheetsConfig, UserSession } from '@/lib/types';
import { GoogleSheetsIcon } from './GoogleSheetModal';
import { 
  Table, 
  LayoutGrid, 
  Users, 
  Search, 
  Plus, 
  HardHat, 
  AlertTriangle,
  ArrowUpRight,
  Bell,
  RefreshCw,
  Database,
  LogOut,
  UserCheck
} from 'lucide-react';

interface NotionHeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tradeFilter: string;
  setTradeFilter: (t: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  totalTasks: number;
  inProgressCount: number;
  criticalCount: number;
  sheetNotificationCount: number;
  totalSyncedRows: number;
  currentProject?: Project;
  googleSheetsConfig: GoogleSheetsConfig | null;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  onOpenNewTaskModal: () => void;
  onOpenSheetHub: (defaultTab?: 'tasks' | 'staff' | 'notifications' | 'activity' | 'settings') => void;
}

const TRADES: TradeType[] = [
  'Architectural Design',
  'Structural Engineering',
  'MEP Engineering',
  'Civil & Geotechnical',
  'BIM & VDC Coordination',
  'Building Code & Permitting',
  'Facade & Building Envelope',
  'Sustainability & LEED',
  'Project Management',
];

export function NotionHeader({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  tradeFilter,
  setTradeFilter,
  priorityFilter,
  setPriorityFilter,
  totalTasks,
  inProgressCount,
  criticalCount,
  sheetNotificationCount,
  totalSyncedRows,
  currentProject,
  googleSheetsConfig,
  currentUser,
  onLogout,
  onOpenNewTaskModal,
  onOpenSheetHub,
}: NotionHeaderProps) {
  return (
    <div className="w-full">
      {/* Notion Cover Header */}
      <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-slate-900 via-neutral-900 to-emerald-950 relative overflow-hidden flex items-end p-6 sm:p-8">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Current User Session Badge & Logout Button */}
        {currentUser && (
          <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-2 shadow-lg">
              <span className={`w-2 h-2 rounded-full ${currentUser.role === 'staff' ? 'bg-emerald-400' : 'bg-orange-400'} animate-pulse`} />
              <span className="font-bold">{currentUser.role === 'staff' ? currentUser.member.name : 'Project Lead'}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80 font-mono text-[11px]">{currentUser.role === 'staff' ? currentUser.member.email : 'Admin'}</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                title="Log out from staff workspace"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-300" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}

        <div className="relative z-10 text-white max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1 tracking-wider uppercase">
            <HardHat className="w-4 h-4" />
            <span>{currentUser?.role === 'staff' ? `Staff Workspace: ${currentUser.member.name}` : 'Apex Architecture & Engineering Studio'}</span>
            {currentProject && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-white font-bold">{currentProject.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>{currentUser?.role === 'staff' ? 'My Assigned Deliverables' : 'A&E Design Operations Hub'}</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <GoogleSheetsIcon className="w-3.5 h-3.5" />
              Google Sheet Backend
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1.5 max-w-2xl leading-relaxed">
            {currentUser?.role === 'staff'
              ? `You are logged in as ${currentUser.member.name} (${currentUser.member.email}). Only deliverables assigned to you are displayed. Updates to status, subtasks, and progress synchronize in real-time to Google Sheets.`
              : 'Notion-style frontend backed directly by Google Sheets. Whatever you change here is automatically logged into your Google Sheet master, including task assigning, liability checks, and notification dispatches.'}
          </p>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-6 pt-5 pb-3 bg-white border-b border-gray-200">
        
        {/* Quick Stats & Google Sheet Sync Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs flex items-center gap-2">
              <span className="text-gray-500">{currentUser?.role === 'staff' ? 'My Deliverables:' : 'Engineering Deliverables:'}</span>
              <strong className="text-gray-900 font-bold">{totalTasks}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center gap-2">
              <span className="text-amber-700">{currentUser?.role === 'staff' ? 'My In-Progress:' : 'In Design / Review:'}</span>
              <strong className="text-amber-950 font-bold">{inProgressCount}</strong>
            </div>

            {criticalCount > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs flex items-center gap-2">
                <span className="text-red-700 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> {currentUser?.role === 'staff' ? 'My Critical Tasks:' : 'Permit Critical:'}
                </span>
                <strong className="text-red-950 font-bold">{criticalCount}</strong>
              </div>
            )}

            {/* Notification Log Pill (Google Sheet tab) */}
            <button
              onClick={() => onOpenSheetHub('notifications')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs flex items-center gap-2 transition-colors cursor-pointer"
              title="Click to view all notification records in Google Sheet"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-emerald-900 font-medium">Sheet Notices Log:</span>
              <strong className="text-emerald-950 font-bold font-mono">{sheetNotificationCount}</strong>
            </button>
          </div>

          {/* Google Sheet Sync Hub Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSheetHub()}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <GoogleSheetsIcon className="w-4 h-4 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">Google Sheet Master</span>
                <span className="text-gray-400">•</span>
                <span className="text-[11px] text-emerald-700 font-mono">{totalSyncedRows} Rows Synced</span>
              </div>
            </button>

            {googleSheetsConfig?.spreadsheetUrl && (
              <a
                href={googleSheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-emerald-700 transition-colors"
                title="Open directly in Google Sheets"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Notion View Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'table'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setActiveView('board')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'board'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            {/* Dedicated Architects & Engineers Tab */}
            <button
              onClick={() => setActiveView('staff')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'staff'
                  ? 'bg-white text-emerald-950 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Architects & Engineers</span>
            </button>

            <button
              onClick={() => setActiveView('assignee')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'assignee'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>By Staff</span>
            </button>
          </div>

          {/* Search, Filters, and New Task Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drawings, calculations, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white w-44 sm:w-56"
              />
            </div>

            {/* Filter by Discipline */}
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700"
            >
              <option value="all">All Disciplines</option>
              {TRADES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Filter by Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700"
            >
              <option value="all">All Priorities</option>
              <option value="critical">🚨 Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* New Task Button */}
            <button
              onClick={onOpenNewTaskModal}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
