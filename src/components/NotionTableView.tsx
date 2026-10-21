'use client';

import { Task, TeamMember, Project, TaskStatus, UserSession } from '@/lib/types';
import { 
  Plus, 
  Mail, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  HardHat, 
  Calendar,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { GoogleSheetsIcon } from './GoogleSheetModal';

interface NotionTableViewProps {
  tasks: Task[];
  members: TeamMember[];
  projects: Project[];
  currentUser?: UserSession | null;
  onSelectTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  onResendEmail: (taskId: string) => Promise<void>;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onOpenOutbox: () => void;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export function NotionTableView({
  tasks,
  members,
  projects,
  currentUser,
  onSelectTask,
  onOpenNewTaskModal,
  onResendEmail,
  onQuickStatusChange,
  onOpenOutbox,
  onDeleteTask,
}: NotionTableViewProps) {
  const getAssignee = (id: string) => members.find((m) => m.id === id);
  const getProject = (id: string) => projects.find((p) => p.id === id);

  const statusStyles: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
    backlog: { label: 'Backlog', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
    ready: { label: 'Ready on Site', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    inspection: { label: 'Inspection', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  };

  const priorityStyles = {
    critical: { label: 'Critical', bg: 'bg-red-100 text-red-800 border-red-300' },
    high: { label: 'High', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
    medium: { label: 'Medium', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    low: { label: 'Low', bg: 'bg-gray-100 text-gray-600 border-gray-200' },
  };

  return (
    <div className="w-full overflow-x-auto pb-8">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-y border-gray-200 bg-gray-50/70 text-gray-500 font-semibold select-none">
            <th className="py-2.5 px-4 font-medium w-80">
              <span className="flex items-center gap-1.5">
                <span>📋</span> Site Task
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium w-48">
              <span className="flex items-center gap-1.5">
                <span>👤</span> Assigned Crew / Sub
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium w-36">
              <span className="flex items-center gap-1.5">
                <span>⚡</span> Status
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium w-28">
              <span className="flex items-center gap-1.5">
                <span>🚨</span> Priority
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium w-36">
              <span className="flex items-center gap-1.5">
                <span>🔧</span> Trade
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium w-44">
              <span className="flex items-center gap-1.5">
                <span>📍</span> Site Zone
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium w-32">
              <span className="flex items-center gap-1.5">
                <span>📅</span> Due Date
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium w-48">
              <span className="flex items-center gap-1.5">
                <span>📊</span> Google Sheet Log
              </span>
            </th>
            <th className="py-2.5 px-3 font-medium text-right w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-gray-400">
                No tasks found. Click "+ New Task" to create one.
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const assignee = getAssignee(task.assigneeId);
              const project = getProject(task.projectId);
              const sStyle = statusStyles[task.status] || statusStyles.ready;
              const pStyle = priorityStyles[task.priority] || priorityStyles.medium;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-[#F7F6F3]/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectTask(task)}
                >
                  {/* Task Title */}
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-sm shrink-0">
                        {task.priority === 'critical' ? '🚨' : '🔨'}
                      </span>
                      <div className="min-w-0">
                        <span className="hover:underline hover:text-orange-600 transition-colors block font-semibold line-clamp-1">
                          {task.title}
                        </span>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length} punch-items
                            </span>
                            {project && (
                              <span className="text-gray-300">• {project.code}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-3">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-orange-500">
                          {assignee.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-800 block truncate">
                            {assignee.name}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate font-mono">
                            {assignee.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => onQuickStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 ${sStyle.bg} ${sStyle.text}`}
                    >
                      <option value="backlog">📋 Backlog</option>
                      <option value="ready">🟡 Ready on Site</option>
                      <option value="in_progress">🟠 In Progress</option>
                      <option value="inspection">🔍 Inspection</option>
                      <option value="completed">🟢 Completed</option>
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${pStyle.bg}`}
                    >
                      {pStyle.label}
                    </span>
                  </td>

                  {/* Trade */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[11px]">
                      {task.trade}
                    </span>
                  </td>

                  {/* Zone */}
                  <td className="py-3 px-3 text-gray-600 font-medium truncate max-w-[170px]">
                    📍 {task.zone}
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-3 text-gray-700 font-medium whitespace-nowrap">
                    📅 {task.dueDate}
                  </td>

                  {/* Google Sheet Sync Status */}
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={onOpenOutbox}
                      className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="View in Google Sheet Master & Notifications Log"
                    >
                      <GoogleSheetsIcon className="w-3.5 h-3.5" />
                      <span>Logged to Sheet</span>
                      <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectTask(task)}
                        className="px-2 py-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium text-xs transition-colors"
                      >
                        Open
                      </button>
                      {currentUser?.role !== 'staff' && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to remove task "${task.title}"?\n\nThis will remove it from Google Sheet Tasks and log the deletion in Activity Audit.`)) {
                              await onDeleteTask(task.id);
                            }
                          }}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Notion-style bottom row: "+ New Task" */}
      <div className="border-b border-gray-200 bg-white">
        <button
          onClick={onOpenNewTaskModal}
          className="w-full py-2.5 px-4 text-left text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2 transition-colors group"
        >
          <Plus className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
          <span>+ New Task</span>
        </button>
      </div>
    </div>
  );
}
