'use client';

import React from 'react';
import { Task, TeamMember, Project, TaskStatus, UserSession } from '@/lib/types';
import { 
  Plus, 
  Mail, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2
} from 'lucide-react';

interface NotionBoardViewProps {
  tasks: Task[];
  members: TeamMember[];
  projects: Project[];
  currentUser?: UserSession | null;
  onSelectTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  onResendEmail: (taskId: string) => Promise<void>;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; badge: string }[] = [
  { id: 'backlog', title: 'Backlog / Staged', color: 'border-t-gray-400', badge: 'bg-gray-100 text-gray-700' },
  { id: 'ready', title: 'Ready on Site', color: 'border-t-blue-500', badge: 'bg-blue-100 text-blue-800' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-amber-500', badge: 'bg-amber-100 text-amber-800' },
  { id: 'inspection', title: 'Awaiting Inspection', color: 'border-t-purple-500', badge: 'bg-purple-100 text-purple-800' },
  { id: 'completed', title: 'Completed', color: 'border-t-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
];

export function NotionBoardView({
  tasks,
  members,
  projects,
  currentUser,
  onSelectTask,
  onOpenNewTaskModal,
  onResendEmail,
  onQuickStatusChange,
  onDeleteTask,
}: NotionBoardViewProps) {
  const getAssignee = (id: string) => members.find((m) => m.id === id);

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'ready', 'in_progress', 'inspection', 'completed'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'ready', 'in_progress', 'inspection', 'completed'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-8 min-h-[600px] items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="w-72 shrink-0 bg-[#F7F6F3] rounded-xl border border-gray-200/80 flex flex-col max-h-[80vh]"
          >
            {/* Column Header */}
            <div className={`p-3 border-t-4 ${col.color} border-b border-gray-200 bg-white/70 rounded-t-xl flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-gray-800">{col.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={onOpenNewTaskModal}
                className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                title="Add task in this column"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards */}
            <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
              {colTasks.map((task) => {
                const assignee = getAssignee(task.assigneeId);
                const nextStatus = getNextStatus(task.status);
                const prevStatus = getPrevStatus(task.status);

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3.5 bg-white rounded-lg border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-2"
                  >
                    {/* Top Badges & Delete */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {task.trade}
                        </span>
                        {task.priority === 'critical' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> Critical
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                            High
                          </span>
                        )}
                      </div>

                      {currentUser?.role !== 'staff' && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to remove deliverable "${task.title}"?\n\nThis will remove it from Google Sheet Tasks and log the deletion in Activity Audit.`)) {
                              await onDeleteTask(task.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                          title="Delete deliverable"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2">
                      {task.title}
                    </h4>

                    {/* Zone & Due Date */}
                    <div className="text-[11px] text-gray-500 space-y-0.5">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{task.zone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 font-medium">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>Due {task.dueDate}</span>
                      </div>
                    </div>

                    {/* Assignee & Mail indicator */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      {assignee && (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                            {assignee.avatar}
                          </div>
                          <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[100px]">
                            {assignee.name.split(' ')[0]}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span 
                          className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-mono text-[10px] flex items-center gap-1" 
                          title="Logged to Google Sheet"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Sheet</span>
                        </span>

                        {prevStatus && (
                          <button
                            onClick={() => onQuickStatusChange(task.id, prevStatus)}
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Move back"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {nextStatus && (
                          <button
                            onClick={() => onQuickStatusChange(task.id, nextStatus)}
                            className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Advance status"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-xs italic">
                  No tasks
                </div>
              )}
            </div>

            {/* Bottom Add button */}
            <div className="p-2 border-t border-gray-200 bg-white/50 rounded-b-xl">
              <button
                onClick={onOpenNewTaskModal}
                className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-white rounded-md flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}
