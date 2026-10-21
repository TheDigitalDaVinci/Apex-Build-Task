'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Task, TeamMember, Project, TaskStatus, TaskPriority, GoogleSheetsConfig, Subtask } from '@/lib/types';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { GoogleSheetsIcon } from '@/components/GoogleSheetModal';
import {
  HardHat,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  LogOut,
  Mail,
  UserCheck,
  Building,
  CheckSquare,
  Square,
  ShieldAlert,
  ArrowRight,
  Filter,
  Briefcase,
  Phone,
  MapPin,
  Award,
  ChevronDown,
  X,
  Info
} from 'lucide-react';

export default function StaffPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center text-gray-500 font-sans">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold tracking-wide uppercase text-gray-600">Loading Staff Portal...</p>
      </div>
    }>
      <StaffPortalContent />
    </Suspense>
  );
}

function StaffPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auth states
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // UI & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Highlighted task from email link (?taskId=...)
  const targetTaskId = searchParams.get('taskId');
  const emailParam = searchParams.get('email');

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Fetch initial data
  const fetchData = async () => {
    try {
      const [tasksRes, membersRes, projectsRes, sheetsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/members'),
        fetch('/api/projects'),
        fetch('/api/sheets'),
      ]);

      const tasksData = await tasksRes.json();
      const membersData = await membersRes.json();
      const projectsData = await projectsRes.json();
      const sheetsData = await sheetsRes.json();

      const fetchedMembers: TeamMember[] = membersData.members || [];
      setTasks(tasksData.tasks || []);
      setMembers(fetchedMembers);
      setProjects(projectsData.projects || []);
      setGoogleSheetsConfig(sheetsData.config || null);

      return { members: fetchedMembers, tasks: tasksData.tasks || [] };
    } catch (err) {
      console.error('Error fetching data:', err);
      addToast({
        type: 'error',
        title: 'Connection Issue',
        description: 'Failed to load deliverables from server.',
      });
      return { members: [], tasks: [] };
    }
  };

  useEffect(() => {
    fetchData().then(({ members: loadedMembers }) => {
      setLoading(false);

      // Check if email was provided in URL query parameter
      const emailQuery = searchParams.get('email');
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('apex_staff_portal_email') : null;
      const targetEmail = emailQuery || savedEmail;

      if (targetEmail && loadedMembers.length > 0) {
        const found = loadedMembers.find(
          (m) => m.email.trim().toLowerCase() === targetEmail.trim().toLowerCase()
        );
        if (found) {
          setCurrentMember(found);
          if (typeof window !== 'undefined') {
            localStorage.setItem('apex_staff_portal_email', found.email);
          }
        }
      }
    });
  }, [searchParams]);

  // Handle Manual Login on the Staff Portal
  const handleLogin = (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setAuthError('');
    const emailToVerify = (customEmail || emailInput).trim().toLowerCase();

    if (!emailToVerify) {
      setAuthError('Please enter your staff email address.');
      return;
    }

    setAuthSubmitting(true);
    setTimeout(() => {
      const found = members.find(
        (m) => m.email.trim().toLowerCase() === emailToVerify
      );

      if (found) {
        setCurrentMember(found);
        if (typeof window !== 'undefined') {
          localStorage.setItem('apex_staff_portal_email', found.email);
          localStorage.setItem(
            'apex_user_session',
            JSON.stringify({ role: 'staff', memberId: found.id, email: found.email })
          );
        }
        setAuthSubmitting(false);
        addToast({
          type: 'sheet',
          title: `Welcome, ${found.name}!`,
          description: `Loaded assigned deliverables from Google Sheet Staff Roster.`,
        });
      } else {
        setAuthError(`No staff member found with email "${emailToVerify}". Please ensure your email is added to the Google Sheet Staff tab.`);
        setAuthSubmitting(false);
      }
    }, 200);
  };

  const handleLogout = () => {
    setCurrentMember(null);
    setEmailInput('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('apex_staff_portal_email');
      localStorage.removeItem('apex_user_session');
    }
    // Clean URL query parameters
    router.replace('/staff');
    addToast({
      type: 'info',
      title: 'Signed Out',
      description: 'You have been signed out from the Staff Portal.',
    });
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    addToast({
      type: 'sheet',
      title: 'Synchronized with Google Sheets',
      description: 'Your deliverables and checklist statuses are fully up to date.',
    });
  };

  // Filter tasks strictly for the current staff member
  const myAssignedTasks = useMemo(() => {
    if (!currentMember) return [];
    return tasks.filter((t) => t.assigneeId === currentMember.id);
  }, [tasks, currentMember]);

  // Apply search and filter criteria
  const filteredTasks = useMemo(() => {
    return myAssignedTasks.filter((task) => {
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      // Project filter
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const project = projects.find((p) => p.id === task.projectId);
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchZone = task.zone?.toLowerCase().includes(q) || false;
        const matchBlueprint = task.blueprintRef?.toLowerCase().includes(q) || false;
        const matchProject = project?.name.toLowerCase().includes(q) || false;

        if (!matchTitle && !matchDesc && !matchZone && !matchBlueprint && !matchProject) {
          return false;
        }
      }

      return true;
    });
  }, [myAssignedTasks, statusFilter, priorityFilter, selectedProjectId, searchQuery, projects]);

  // Compute staff personal metrics
  const metrics = useMemo(() => {
    const total = myAssignedTasks.length;
    const inProgress = myAssignedTasks.filter((t) => t.status === 'in_progress').length;
    const ready = myAssignedTasks.filter((t) => t.status === 'ready' || t.status === 'backlog').length;
    const inspection = myAssignedTasks.filter((t) => t.status === 'inspection').length;
    const completed = myAssignedTasks.filter((t) => t.status === 'completed').length;
    const critical = myAssignedTasks.filter((t) => t.priority === 'critical' || t.safetyRisk === 'Permit Critical' || t.safetyRisk === 'High Engineering Liability').length;

    return { total, inProgress, ready, inspection, completed, critical };
  }, [myAssignedTasks]);

  // Quick Action: Change task status
  const handleUpdateStatus = async (task: Task, newStatus: TaskStatus) => {
    setUpdatingTaskId(task.id);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Update state locally
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
      );

      addToast({
        type: 'sheet',
        title: 'Status Updated',
        description: `Deliverable marked as ${newStatus.toUpperCase().replace('_', ' ')}. Synced to Google Sheet.`,
      });
    } catch (err) {
      console.error('Status update failed:', err);
      addToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to synchronize status with Google Sheet.',
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Quick Action: Toggle subtask completion
  const handleToggleSubtask = async (task: Task, subtaskId: string) => {
    const updatedSubtasks: Subtask[] = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Optimistic local update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, subtasks: updatedSubtasks } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });

      if (!res.ok) throw new Error('Failed to save subtask update');

      const toggled = updatedSubtasks.find((st) => st.id === subtaskId);
      addToast({
        type: 'sheet',
        title: toggled?.completed ? 'Checklist Item Completed' : 'Checklist Item Reopened',
        description: `"${toggled?.title}" synced to Google Sheet master.`,
      });
    } catch (err) {
      console.error('Failed to update subtask:', err);
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, subtasks: task.subtasks } : t))
      );
      addToast({
        type: 'error',
        title: 'Sync Failed',
        description: 'Could not update checklist item in Google Sheet.',
      });
    }
  };

  // Helper status badge styles
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
        return { label: 'In Progress', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      case 'ready':
        return { label: 'Ready to Start', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
      case 'inspection':
        return { label: 'In Review / Inspection', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'completed':
        return { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'backlog':
      default:
        return { label: 'Backlog', bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return { label: 'Critical', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'high':
        return { label: 'High Priority', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'medium':
        return { label: 'Medium', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
      case 'low':
      default:
        return { label: 'Low', bg: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
  };

  // ---------------------------------------------------------------------------------------
  // RENDER: Loading Screen
  // ---------------------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center text-gray-500 font-sans">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold tracking-wide uppercase text-gray-600">Connecting to Google Sheet Roster...</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------------------
  // RENDER: Staff Identification / Sign-In Screen (If no staff authenticated)
  // ---------------------------------------------------------------------------------------
  if (!currentMember) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between text-gray-900 font-sans selection:bg-emerald-100">
        
        {/* Top Navbar */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              📐
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-tight text-gray-900 uppercase">
                Apex Architecture & Engineering
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                Personal Deliverables & Task Portal
              </p>
            </div>
          </div>

          {googleSheetsConfig?.isConnected && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <GoogleSheetsIcon className="w-3.5 h-3.5" />
              <span>Google Sheet Connected</span>
            </div>
          )}
        </header>

        {/* Login Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/90 shadow-xl overflow-hidden animate-fade-in">
            
            <div className="bg-gradient-to-r from-slate-950 via-neutral-900 to-emerald-950 p-6 sm:p-7 text-white">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <HardHat className="w-4 h-4" />
                <span>Staff Portal Access</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                View Your Assigned Tasks
              </h2>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Enter your email address registered in the Google Sheet Staff Roster to access only your assigned deliverables and checklist items.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Your Registered Staff Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      placeholder="e.g. nidhinzzx4@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-emerald-600 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Must match your email entry in the company Google Sheet Staff Roster.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-800 text-xs flex items-start gap-2 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-[11px] leading-relaxed">
                      {authError}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  <span>{authSubmitting ? 'Verifying with Google Sheet...' : 'Open My Deliverables'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick 1-Click Roster Selector */}
              {members.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Registered Staff ({members.length})</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Click to quick-load</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setEmailInput(m.email);
                          handleLogin(undefined, m.email);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-gray-200/70 hover:border-emerald-500 hover:bg-emerald-50/50 bg-white transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {m.avatar || m.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-900 truncate">
                              {m.name}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate font-mono">
                              {m.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {m.role || m.trade}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheet Live Sync Active</span>
              </span>
              <a href="/" className="text-emerald-700 hover:underline font-semibold">
                Go to Workspace Admin ↗
              </a>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200/60 bg-white">
          Apex Construction Systems • Staff Portal • Google Sheet Technical Dispatch Engine
        </footer>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------------------
  // RENDER: Full Dedicated Staff Workspace ("Nothing else should be visible to them")
  // ---------------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-emerald-100 flex flex-col">
      
      {/* 1. Dedicated Staff Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-xs">
              📐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-tight text-gray-900 uppercase">
                  Apex Engineering Studio
                </h1>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Staff Portal
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Personal Deliverables & Milestones Dashboard
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Live Google Sheet Pill */}
            {googleSheetsConfig?.isConnected && (
              <a
                href={googleSheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View in Google Sheet"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors"
              >
                <GoogleSheetsIcon className="w-3.5 h-3.5" />
                <span>Google Sheet Roster Sync</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
            )}

            {/* Sync Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh deliverables from Google Sheet"
              className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Staff User Chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {currentMember.avatar || currentMember.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {currentMember.name}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {currentMember.role || currentMember.trade}
                </p>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                title="Sign out of Staff Portal"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* 2. Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">

        {/* Staff Profile & Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-neutral-900 to-emerald-950 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <HardHat className="w-3.5 h-3.5" />
                <span>{currentMember.trade || 'Engineering & Architecture'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {currentMember.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                Here is your dedicated deliverable roster. Only tasks assigned directly to you are displayed. Check off subtasks and update statuses—all changes automatically sync to the Google Sheet master.
              </p>
            </div>

            {/* Staff Meta Badges */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-xs space-y-2 shrink-0 md:min-w-[260px]">
              <div className="flex items-center gap-2 text-gray-200">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px] truncate">{currentMember.email}</span>
              </div>
              {currentMember.licenseNo && (
                <div className="flex items-center gap-2 text-gray-200">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">{currentMember.licenseNo}</span>
                </div>
              )}
              {currentMember.officeLocation && (
                <div className="flex items-center gap-2 text-gray-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-[11px]">{currentMember.officeLocation}</span>
                </div>
              )}
              {currentMember.phone && (
                <div className="flex items-center gap-2 text-gray-200">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-[11px] font-mono">{currentMember.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Deliverables Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              All Tasks
            </span>
            <div className="text-2xl font-black text-gray-900 font-mono">
              {metrics.total}
            </div>
            <span className="text-[10px] text-gray-400">Assigned to you</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block mb-1">
              In Progress
            </span>
            <div className="text-2xl font-black text-blue-700 font-mono">
              {metrics.inProgress}
            </div>
            <span className="text-[10px] text-gray-400">Active milestones</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block mb-1">
              Ready to Start
            </span>
            <div className="text-2xl font-black text-purple-700 font-mono">
              {metrics.ready}
            </div>
            <span className="text-[10px] text-gray-400">Queued items</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block mb-1">
              Under Review
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono">
              {metrics.inspection}
            </div>
            <span className="text-[10px] text-gray-400">Inspection & code</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
              Completed
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {metrics.completed}
            </div>
            <span className="text-[10px] text-gray-400">Finished deliverables</span>
          </div>

          <div className="bg-white rounded-xl border border-red-200/80 p-3.5 sm:p-4 shadow-xs bg-red-50/20">
            <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span>Critical Risk</span>
            </span>
            <div className="text-2xl font-black text-red-700 font-mono">
              {metrics.critical}
            </div>
            <span className="text-[10px] text-red-600/70">Permit & high liability</span>
          </div>
        </div>

        {/* 4. Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs space-y-3">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your deliverables, drawing zone, Revit sheet, or specs..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-emerald-600 rounded-lg text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Project Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 shrink-0">Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="py-2 px-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-emerald-600 rounded-lg text-xs font-medium text-gray-800 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 shrink-0">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="py-2 px-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-emerald-600 rounded-lg text-xs font-medium text-gray-800 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>

          {/* Status Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-gray-100 text-xs">
            {[
              { id: 'all', label: 'All Tasks', count: metrics.total },
              { id: 'in_progress', label: 'In Progress', count: metrics.inProgress },
              { id: 'ready', label: 'Ready to Start', count: metrics.ready },
              { id: 'inspection', label: 'Under Review', count: metrics.inspection },
              { id: 'completed', label: 'Completed', count: metrics.completed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`py-1.5 px-3 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  statusFilter === tab.id ? 'bg-emerald-950 text-emerald-200' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* 5. Deliverables Task Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <span>Assigned Deliverables ({filteredTasks.length})</span>
            </h3>
            <span className="text-xs text-gray-400">
              Showing deliverables assigned to {currentMember.name}
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                ✨
              </div>
              <h4 className="text-base font-bold text-gray-900">No deliverables found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {myAssignedTasks.length === 0
                  ? "You do not have any tasks assigned to you right now in the Google Sheet. New assignments will notify you automatically by email."
                  : "No tasks match your selected filter criteria. Try clearing search or status filters."}
              </p>
              {myAssignedTasks.length > 0 && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setSelectedProjectId('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const statusBadge = getStatusBadge(task.status);
                const priorityBadge = getPriorityBadge(task.priority);
                const isTarget = targetTaskId === task.id;
                const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                const totalSubtasks = task.subtasks.length;
                const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                return (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    className={`bg-white rounded-xl border p-5 sm:p-6 shadow-xs transition-all relative ${
                      isTarget
                        ? 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/10'
                        : 'border-gray-200/80 hover:border-emerald-300'
                    }`}
                  >
                    {/* Highlight Pill if opened from notification email */}
                    {isTarget && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold shadow-xs mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                        <span>Deliverable from Notification Email</span>
                      </div>
                    )}

                    {/* Top Row: Project & Meta Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {project && (
                          <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 text-[11px] font-bold flex items-center gap-1.5">
                            <span>{project.icon || '🏢'}</span>
                            <span>{project.name}</span>
                            <span className="text-gray-400">({project.code})</span>
                          </span>
                        )}

                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${priorityBadge.bg}`}>
                          {priorityBadge.label}
                        </span>

                        {task.safetyRisk && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200/80 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-orange-600" />
                            <span>{task.safetyRisk}</span>
                          </span>
                        )}
                      </div>

                      {/* Status Selector Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-400">Status:</span>
                        <div className="relative">
                          <select
                            value={task.status}
                            disabled={updatingTaskId === task.id}
                            onChange={(e) => handleUpdateStatus(task, e.target.value as TaskStatus)}
                            className={`py-1 pl-2.5 pr-7 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none appearance-none transition-all ${statusBadge.bg} ${
                              updatingTaskId === task.id ? 'opacity-50' : ''
                            }`}
                          >
                            <option value="backlog">Backlog</option>
                            <option value="ready">Ready to Start</option>
                            <option value="in_progress">In Progress</option>
                            <option value="inspection">Under Review</option>
                            <option value="completed">Completed</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </div>
                    </div>

                    {/* Deliverable Title */}
                    <h4 className="text-base sm:text-lg font-bold text-gray-950 mb-2 leading-snug">
                      {task.title}
                    </h4>

                    {/* Scope / Description */}
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed mb-4">
                      {task.description}
                    </p>

                    {/* Meta Specifications Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-gray-100 text-xs mb-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <span className="text-gray-400 text-[10px] block">Due Date</span>
                          <span className="font-semibold text-gray-900 font-mono">{task.dueDate}</span>
                        </div>
                      </div>

                      {task.zone && (
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-gray-400 text-[10px] block">Zone / Drawing Package</span>
                            <span className="font-semibold text-gray-900 truncate block">{task.zone}</span>
                          </div>
                        </div>
                      )}

                      {task.blueprintRef && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                          <div>
                            <span className="text-gray-400 text-[10px] block">CAD / Revit Model</span>
                            <span className="font-semibold text-gray-900 truncate block font-mono text-[11px]">{task.blueprintRef}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 6. Interactive Subtask Deliverable Checklist */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/60 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Deliverable Checklist ({completedSubtasks}/{totalSubtasks})</span>
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-emerald-800">
                            {progressPct}% Completed
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Checkbox Items */}
                        <div className="space-y-1.5 pt-1">
                          {task.subtasks.map((st) => (
                            <div
                              key={st.id}
                              onClick={() => handleToggleSubtask(task, st.id)}
                              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white hover:shadow-xs transition-all cursor-pointer group select-none"
                            >
                              <div className="mt-0.5 shrink-0 text-emerald-700">
                                {st.completed ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                                )}
                              </div>
                              <span className={`text-xs flex-1 ${
                                st.completed ? 'line-through text-gray-400 font-normal' : 'text-gray-800 font-medium'
                              }`}>
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Row: Quick Status Buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-gray-400">
                        Task ID: <span className="font-mono">{task.id}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {task.status !== 'in_progress' && (
                          <button
                            onClick={() => handleUpdateStatus(task, 'in_progress')}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold text-[11px] border border-blue-200 transition-colors cursor-pointer"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {task.status !== 'inspection' && (
                          <button
                            onClick={() => handleUpdateStatus(task, 'inspection')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md font-semibold text-[11px] border border-amber-200 transition-colors cursor-pointer"
                          >
                            Submit for Review
                          </button>
                        )}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(task, 'completed')}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md font-semibold text-[11px] shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 px-4 text-center text-xs text-gray-400 space-y-1">
        <p>Apex Architecture & Engineering • Staff Deliverables Workspace</p>
        <p className="text-[11px] text-gray-400">
          Connected to Google Sheet Master: <span className="font-mono text-gray-500">{googleSheetsConfig?.sheetTitle || 'Operations Sheet'}</span>
        </p>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
