'use client';

import React, { useState, useEffect } from 'react';
import { Task, TeamMember, Project, TaskPriority, TaskStatus, TradeType } from '@/lib/types';
import { 
  X, 
  Mail, 
  Send, 
  AlertTriangle, 
  CheckSquare, 
  Plus, 
  Trash2, 
  HardHat, 
  Calendar, 
  MapPin, 
  FileText,
  Clock
} from 'lucide-react';

interface NotionNewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  projects: Project[];
  activeProjectId?: string;
  preselectedMemberId?: string;
  onCreateTask: (taskData: any) => Promise<void>;
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

export function NotionNewTaskModal({
  isOpen,
  onClose,
  members,
  projects,
  activeProjectId,
  preselectedMemberId,
  onCreateTask,
}: NotionNewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(activeProjectId || projects[0]?.id || 'proj-1');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || '');
  const [status, setStatus] = useState<TaskStatus>('ready');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [trade, setTrade] = useState<TradeType>('Architectural Design');
  const [zone, setZone] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState(16);
  const [safetyRisk, setSafetyRisk] = useState<any>('Code Compliance Review');
  const [blueprintRef, setBlueprintRef] = useState('');
  const [notifyAssignee, setNotifyAssignee] = useState(true);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: '1', title: 'Verify design criteria against local building codes (IBC 2024)', completed: false },
    { id: '2', title: 'Run BIM clash detection and resolve structural penetrations', completed: false },
  ]);

  useEffect(() => {
    if (isOpen) {
      if (preselectedMemberId && members.some((m) => m.id === preselectedMemberId)) {
        setAssigneeId(preselectedMemberId);
        const mem = members.find((m) => m.id === preselectedMemberId);
        if (mem) setTrade(mem.trade);
      } else if (members.length > 0 && !members.some((m) => m.id === assigneeId)) {
        setAssigneeId(members[0].id);
        setTrade(members[0].trade);
      }
      if (activeProjectId && projects.some((p) => p.id === activeProjectId)) {
        setProjectId(activeProjectId);
      } else if (projects.length > 0 && !projects.some((p) => p.id === projectId)) {
        setProjectId(projects[0].id);
      }
    }
  }, [isOpen, members, preselectedMemberId, projects, activeProjectId]);

  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === assigneeId);

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: Date.now().toString(), title: newSubtaskInput.trim(), completed: false },
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task Title is required');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const validAssignee = members.some((m) => m.id === assigneeId) ? assigneeId : (members[0]?.id || '');
      const validProject = projects.some((p) => p.id === projectId) ? projectId : (projects[0]?.id || '');

      await onCreateTask({
        title: title.trim(),
        description: description.trim(),
        projectId: validProject,
        assigneeId: validAssignee,
        status,
        priority,
        trade,
        zone: zone.trim() || 'General Site Perimeter',
        dueDate,
        estimatedHours,
        safetyRisk,
        blueprintRef: blueprintRef.trim(),
        subtasks,
        notifyAssignee,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Banner Cover */}
        <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 flex flex-col justify-end relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold tracking-widest uppercase">
            <HardHat className="w-4 h-4" />
            <span>Apex Construction Work Order</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            New Site Task & Assignment Dispatch
          </h2>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Inspect Foundation Rebar Grid - Zone B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-semibold px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
              autoFocus
            />
          </div>

          {/* Notion Property Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200/80">
            
            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>Assignee (Crew / Subcontractor)</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  const mem = members.find((m) => m.id === e.target.value);
                  if (mem) setTrade(mem.trade);
                }}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.trade} - {m.company || m.role})
                  </option>
                ))}
              </select>
              {selectedMember && (
                <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                  <Mail className="w-3 h-3 text-orange-500" />
                  <span>Will notify: {selectedMember.email}</span>
                </div>
              )}
            </div>

            {/* Project Site */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Project Site
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Trade */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Trade Discipline
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value as TradeType)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Site Zone / Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Site Zone / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Level 4 - Core Slab B"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">🚨 Critical / Stoppage Risk</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="backlog">Backlog / Planning</option>
                <option value="ready">Ready on Site</option>
                <option value="in_progress">In Progress</option>
                <option value="inspection">Awaiting Inspection</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Completion Due Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Engineering Review / Liability */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Engineering Review & Permit Level
              </label>
              <select
                value={safetyRisk}
                onChange={(e) => setSafetyRisk(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Code Compliance Review">Code Compliance Review (IBC 2024)</option>
                <option value="Permit Critical">🚨 Permit Critical (Municipal Filing)</option>
                <option value="High Engineering Liability">High Engineering Liability (PE/SE Stamp)</option>
                <option value="Peer Review Required">Structural / MEP Peer Review Required</option>
                <option value="Standard PPE">Standard Engineering Review</option>
              </select>
            </div>

            {/* Blueprint Ref / Model */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Software Model / Drawing Sheet Ref
              </label>
              <input
                type="text"
                placeholder="e.g. Revit Model 2026 / ETABS v22 / S-201"
                value={blueprintRef}
                onChange={(e) => setBlueprintRef(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>


            {/* Est Hours */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Estimated Hours
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Description / Site Specs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Scope of Work & Site Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Provide detailed instructions, inspection criteria, required materials, or subcontractor deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Punch List / Subtasks */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Punch-List Checklist / Milestones
            </label>
            <div className="space-y-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                  <CheckSquare className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="flex-1 text-gray-800">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a checklist item or milestone..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notification to Google Sheet Checkbox */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
            <input
              type="checkbox"
              id="notifyAssigneeCheckbox"
              checked={notifyAssignee}
              onChange={(e) => setNotifyAssignee(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-neutral-700 focus:ring-emerald-500 bg-neutral-900"
            />
            <label htmlFor="notifyAssigneeCheckbox" className="text-xs cursor-pointer">
              <span className="font-bold text-emerald-300 block flex items-center gap-1.5">
                <span>📊 Auto-Log Assignment & Notice to Google Sheet</span>
              </span>
              <span className="text-neutral-300/80 mt-0.5 block leading-relaxed">
                Appends this deliverable to the <strong className="text-white">📋 Tasks</strong> sheet, records an assignment alert in <strong className="text-white">🔔 Notification Log</strong> for {selectedMember?.name || 'the assignee'} ({selectedMember?.email || 'registered mail ID'}), and logs an audit record in <strong className="text-white">📜 Activity Audit</strong>.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging to Google Sheet...' : 'Create & Log to Google Sheet'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
