'use client';

import React, { useState, useEffect } from 'react';
import { Task, TeamMember, Project, TaskPriority, TaskStatus, TradeType, UserSession } from '@/lib/types';
import { 
  X, 
  Mail, 
  Send, 
  Trash2, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckSquare, 
  Square, 
  Plus, 
  HardHat, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Building, 
  Bell 
} from 'lucide-react';

interface NotionTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  projects: Project[];
  currentUser?: UserSession | null;
  onUpdateTask: (id: string, updates: Partial<Task>, notify?: boolean) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onResendEmail: (taskId: string) => Promise<void>;
  onOpenOutbox: () => void;
}

export function NotionTaskModal({
  task,
  isOpen,
  onClose,
  members,
  projects,
  currentUser,
  onUpdateTask,
  onDeleteTask,
  onResendEmail,
  onOpenOutbox,
}: NotionTaskModalProps) {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [trade, setTrade] = useState<TradeType>(task.trade);
  const [zone, setZone] = useState(task.zone);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [estimatedHours, setEstimatedHours] = useState(task.estimatedHours);
  const [safetyRisk, setSafetyRisk] = useState(task.safetyRisk);
  const [blueprintRef, setBlueprintRef] = useState(task.blueprintRef || '');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [promptReassignEmail, setPromptReassignEmail] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setAssigneeId(task.assigneeId);
      setStatus(task.status);
      setPriority(task.priority);
      setTrade(task.trade);
      setZone(task.zone);
      setDueDate(task.dueDate);
      setEstimatedHours(task.estimatedHours);
      setSafetyRisk(task.safetyRisk);
      setBlueprintRef(task.blueprintRef || '');
      setSubtasks(task.subtasks || []);
      setPromptReassignEmail(false);
    }
  }, [task]);

  const assignedMember = members.find((m) => m.id === assigneeId);
  const currentProject = projects.find((p) => p.id === task.projectId);

  // Handle auto-save field update
  const handleFieldChange = async (updates: Partial<Task>, notify: boolean = false) => {
    setIsSaving(true);
    try {
      await onUpdateTask(task.id, updates, notify);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setAssigneeId(newAssigneeId);
    if (newAssigneeId !== task.assigneeId) {
      await handleFieldChange({ assigneeId: newAssigneeId }, true);
    }
  };

  const confirmReassignWithEmail = async (notify: boolean) => {
    await handleFieldChange({ assigneeId }, notify);
    setPromptReassignEmail(false);
  };

  const toggleSubtask = async (subtaskId: string) => {
    const updated = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updated);
    await handleFieldChange({ subtasks: updated }, false);
  };

  const addSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    const updated = [
      ...subtasks,
      { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    await handleFieldChange({ subtasks: updated }, false);
  };

  const removeSubtask = async (subtaskId: string) => {
    const updated = subtasks.filter((st) => st.id !== subtaskId);
    setSubtasks(updated);
    await handleFieldChange({ subtasks: updated }, false);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResendEmail(task.id);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Notion Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-zinc-800 to-amber-950 relative flex items-end p-6 border-b border-gray-200">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {currentUser?.role !== 'staff' && (
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to remove deliverable "${task.title}"?\n\nThis will permanently delete the task and log the removal to the Google Sheet Activity Audit tab.`)) {
                    await onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-red-200 hover:text-white bg-red-950/70 hover:bg-red-900 border border-red-500/30 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Delete deliverable from workspace"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Deliverable</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-md border border-orange-500/20">
            <Building className="w-3.5 h-3.5" />
            <span>{currentProject?.name || 'Construction Project'}</span>
            <span className="text-gray-400">•</span>
            <span>{currentProject?.code}</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Notion Page Icon & Title */}
          <div>
            <div className="text-3xl mb-2">🏗️</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleFieldChange({ title }, false)}
              className="w-full text-2xl sm:text-3xl font-extrabold text-[#37352F] tracking-tight bg-transparent border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-orange-500 focus:outline-none py-1 transition-all"
              placeholder="Task Title..."
            />
          </div>

          {/* Reassignment Google Sheet Notice Banner prompt */}
          {promptReassignEmail && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border-2 border-emerald-500/50 text-xs text-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-md">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-900/60 text-emerald-400 shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-emerald-300">Assignee updated to {assignedMember?.name}!</strong>
                  <p className="text-neutral-300/80 text-[11px] mt-0.5">
                    Record an assignment alert in Google Sheet <code className="bg-neutral-800 text-emerald-300 px-1 py-0.5 rounded">🔔 Notification Log</code> for {assignedMember?.email}?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => confirmReassignWithEmail(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Notice to Sheet</span>
                </button>
                <button
                  onClick={() => confirmReassignWithEmail(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg border border-neutral-700 text-xs cursor-pointer"
                >
                  Update Silently
                </button>
              </div>
            </div>
          )}

          {/* Notion Properties Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 py-4 border-y border-gray-200 text-xs">
            
            {/* Status */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Status
              </span>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as TaskStatus;
                  setStatus(val);
                  handleFieldChange({ status: val }, false);
                }}
                className="flex-1 font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="backlog">📋 Backlog</option>
                <option value="ready">🟡 Ready on Site</option>
                <option value="in_progress">🟠 In Progress</option>
                <option value="inspection">🔍 Awaiting Inspection</option>
                <option value="completed">🟢 Completed</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Assignee
              </span>
              {currentUser?.role === 'staff' ? (
                <div className="flex-1 font-semibold px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{assignedMember?.name || 'Assigned to You'}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {assignedMember?.email}
                  </span>
                </div>
              ) : (
                <select
                  value={assigneeId}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="flex-1 font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.trade} - {m.company || m.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Priority */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Priority
              </span>
              <select
                value={priority}
                onChange={(e) => {
                  const val = e.target.value as TaskPriority;
                  setPriority(val);
                  handleFieldChange({ priority: val }, false);
                }}
                className="flex-1 font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">🚨 Critical / High Hazard</option>
              </select>
            </div>

            {/* Trade / Discipline */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5" /> Discipline
              </span>
              <select
                value={trade}
                onChange={(e) => {
                  const val = e.target.value as TradeType;
                  setTrade(val);
                  handleFieldChange({ trade: val }, false);
                }}
                className="flex-1 font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="Architectural Design">Architectural Design</option>
                <option value="Structural Engineering">Structural Engineering</option>
                <option value="MEP Engineering">MEP Engineering</option>
                <option value="Civil & Geotechnical">Civil & Geotechnical</option>
                <option value="BIM & VDC Coordination">BIM & VDC Coordination</option>
                <option value="Building Code & Permitting">Building Code & Permitting</option>
                <option value="Facade & Building Envelope">Facade & Building Envelope</option>
                <option value="Sustainability & LEED">Sustainability & LEED</option>
                <option value="Project Management">Project Management</option>
              </select>
            </div>

            {/* Zone / Drawing Package */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Drawing / Package
              </span>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                onBlur={() => handleFieldChange({ zone }, false)}
                className="flex-1 font-medium px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Drawing Package 3 / Calc Book"
              />
            </div>

            {/* Due Date */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Target Due Date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleFieldChange({ dueDate: e.target.value }, false);
                }}
                className="flex-1 font-medium px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Safety / Permit Risk */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5" /> Review / Permit
              </span>
              <select
                value={safetyRisk}
                onChange={(e) => {
                  setSafetyRisk(e.target.value as any);
                  handleFieldChange({ safetyRisk: e.target.value as any }, false);
                }}
                className="flex-1 font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="Code Compliance Review">Code Compliance Review (IBC 2024)</option>
                <option value="Permit Critical">🚨 Permit Critical (Municipal Filing)</option>
                <option value="High Engineering Liability">High Engineering Liability (PE/SE Stamp)</option>
                <option value="Peer Review Required">Structural / MEP Peer Review</option>
                <option value="Standard PPE">Standard Engineering Review</option>
              </select>
            </div>

            {/* Blueprint Ref */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                📐 Software / Model
              </span>
              <input
                type="text"
                value={blueprintRef}
                onChange={(e) => setBlueprintRef(e.target.value)}
                onBlur={() => handleFieldChange({ blueprintRef }, false)}
                className="flex-1 font-medium px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Revit 2026 Model / ETABS v22 / S-201"
              />
            </div>


            {/* Est Hours */}
            <div className="flex items-center">
              <span className="w-32 text-gray-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Est. Hours
              </span>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                onBlur={() => handleFieldChange({ estimatedHours }, false)}
                className="flex-1 font-medium px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

          </div>

          {/* Email Notification & Dispatch Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Subcontractor Email Dispatch Status
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Assigned Worker: <strong>{assignedMember?.name}</strong> ({assignedMember?.email})
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Last Notified: {task.lastNotifiedAt ? new Date(task.lastNotifiedAt).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenOutbox}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="View in Outbox"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Mail</span>
              </button>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending...' : 'Resend Email'}</span>
              </button>
            </div>
          </div>

          {/* Description & Site Specifications */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Scope of Work & Technical Specs
            </h4>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleFieldChange({ description }, false)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-orange-500 focus:outline-none transition-all leading-relaxed text-gray-800"
              placeholder="Detailed instructions, required tools, testing parameters, or punch criteria..."
            />
          </div>

          {/* Punch-List / Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Field Punch-List & Milestones
              </h4>
              <span className="text-[11px] text-gray-500">
                {subtasks.filter((s) => s.completed).length} of {subtasks.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors group text-xs"
                >
                  <button
                    onClick={() => toggleSubtask(st.id)}
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    {st.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <span
                    className={`flex-1 ${
                      st.completed ? 'line-through text-gray-400' : 'text-gray-800 font-medium'
                    }`}
                  >
                    {st.title}
                  </span>
                  <button
                    onClick={() => removeSubtask(st.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="+ Add punch item (press Enter)..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={addSubtask}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone: Delete Deliverable (Admin Only) */}
          {currentUser?.role !== 'staff' && (
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-gray-800">Danger Zone</h5>
                <p className="text-[11px] text-gray-500">Permanently delete this deliverable and record the deletion in Google Sheet Activity Audit.</p>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to remove deliverable "${task.title}"?\n\nThis will permanently delete the task from the workspace and log the removal to the Google Sheet Activity Audit tab.`)) {
                    await onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete Deliverable</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
