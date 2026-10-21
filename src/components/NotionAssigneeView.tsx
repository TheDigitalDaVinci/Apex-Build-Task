'use client';

import React from 'react';
import { Task, TeamMember, Project, TaskStatus } from '@/lib/types';
import { 
  Plus, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Calendar, 
  MapPin, 
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface NotionAssigneeViewProps {
  tasks: Task[];
  members: TeamMember[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onOpenNewTaskModal: (preselectedMemberId?: string) => void;
  onResendEmail: (taskId: string) => Promise<void>;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export function NotionAssigneeView({
  tasks,
  members,
  projects,
  onSelectTask,
  onOpenNewTaskModal,
  onResendEmail,
  onQuickStatusChange,
}: NotionAssigneeViewProps) {
  const getProject = (id: string) => projects.find((p) => p.id === id);

  return (
    <div className="space-y-6 pb-12">
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
        const inProgress = memberTasks.filter((t) => t.status === 'in_progress').length;
        const completed = memberTasks.filter((t) => t.status === 'completed').length;
        const criticalCount = memberTasks.filter((t) => t.priority === 'critical').length;

        return (
          <div
            key={member.id}
            className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs hover:border-gray-300 transition-all"
          >
            {/* Member Header */}
            <div className="p-4 sm:p-5 bg-[#F7F6F3] border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center border-2 border-orange-500 shadow-sm shrink-0">
                  {member.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900">{member.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                      {member.trade}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      {member.company}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-orange-500" />
                      {member.email}
                    </span>
                    {member.phone && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {member.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats & Assign Button */}
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium">
                    Total: <strong>{memberTasks.length}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                    In Progress: <strong>{inProgress}</strong>
                  </span>
                  {criticalCount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" /> {criticalCount} Critical
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onOpenNewTaskModal(member.id)}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              </div>
            </div>

            {/* Member's Tasks List */}
            <div className="p-4 sm:p-5">
              {memberTasks.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs italic">
                  No active tasks assigned to {member.name}. Click "Assign Task" to dispatch work.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {memberTasks.map((task) => {
                    const project = getProject(task.projectId);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-orange-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                task.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : task.status === 'in_progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : task.status === 'inspection'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.status.replace('_', ' ')}
                            </span>

                            {task.priority === 'critical' ? (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                🚨 Critical
                              </span>
                            ) : task.priority === 'high' ? (
                              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                                High
                              </span>
                            ) : null}
                          </div>

                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                            {task.title}
                          </h4>

                          <div className="mt-2 space-y-1 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{task.zone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-700 font-medium">
                              <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>Due {task.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-gray-400 font-mono text-[10px]">
                            {project?.code || 'Site'}
                          </span>
                          <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Logged to Sheet</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
