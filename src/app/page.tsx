'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TeamMember, Project, TaskStatus, GoogleSheetsConfig, UserSession } from '@/lib/types';
import { NotionSidebar, ActiveView } from '@/components/NotionSidebar';
import { NotionHeader } from '@/components/NotionHeader';
import { NotionTableView } from '@/components/NotionTableView';
import { NotionBoardView } from '@/components/NotionBoardView';
import { NotionAssigneeView } from '@/components/NotionAssigneeView';
import { NotionTaskModal } from '@/components/NotionTaskModal';
import { NotionNewTaskModal } from '@/components/NotionNewTaskModal';
import { GoogleSheetModal } from '@/components/GoogleSheetModal';
import { TeamMembersModal } from '@/components/TeamMembersModal';
import { StaffManagementView } from '@/components/StaffManagementView';
import { StaffLoginPage } from '@/components/StaffLoginPage';
import { ToastContainer, ToastMessage } from '@/components/Toast';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig | null>(null);
  const [sheetNotificationCount, setSheetNotificationCount] = useState(0);
  const [totalSyncedRows, setTotalSyncedRows] = useState(0);
  const [loading, setLoading] = useState(true);

  // View & Filter States
  const [activeView, setActiveView] = useState<ActiveView>('table');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [preselectedMemberId, setPreselectedMemberId] = useState<string | undefined>(undefined);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [sheetDefaultTab, setSheetDefaultTab] = useState<'tasks' | 'staff' | 'notifications' | 'activity' | 'settings'>('tasks');
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const handleOpenSheetHub = (tab: 'tasks' | 'staff' | 'notifications' | 'activity' | 'settings' = 'tasks') => {
    setSheetDefaultTab(tab);
    setIsSheetModalOpen(true);
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [tasksRes, membersRes, projectsRes, sheetsRes] = await Promise.all([
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/members').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/sheets').then((r) => r.json()),
      ]);

      if (tasksRes.tasks) setTasks(tasksRes.tasks);
      if (membersRes.members) setMembers(membersRes.members);
      if (projectsRes.projects) setProjects(projectsRes.projects);
      
      if (sheetsRes.config) {
        setGoogleSheetsConfig(sheetsRes.config);
      }
      if (sheetsRes.stats) {
        setSheetNotificationCount(sheetsRes.stats.notificationsCount ?? 0);
        setTotalSyncedRows(sheetsRes.stats.totalRows ?? 0);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Restore session from localStorage once loading finishes
  useEffect(() => {
    if (!loading) {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('apex_user_session') : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role === 'admin') {
            setCurrentUser({ role: 'admin', name: 'Project Lead', email: 'admin@apexconstruct.demo' });
          } else if (parsed.role === 'staff' && parsed.email) {
            const matched = members.find((m) => m.email.trim().toLowerCase() === parsed.email.trim().toLowerCase());
            if (matched) {
              setCurrentUser({ role: 'staff', member: matched });
            } else {
              localStorage.removeItem('apex_user_session');
              setCurrentUser(null);
            }
          }
        }
      } catch (err) {
        console.warn('Session parse error:', err);
      } finally {
        setAuthInitialized(true);
      }
    }
  }, [loading, members]);

  // Auth Action Handlers
  const handleLoginStaff = (member: TeamMember) => {
    const session: UserSession = { role: 'staff', member };
    setCurrentUser(session);
    try {
      localStorage.setItem(
        'apex_user_session',
        JSON.stringify({ role: 'staff', memberId: member.id, email: member.email })
      );
    } catch (e) {}
    addToast({
      type: 'sheet',
      title: `Welcome, ${member.name}!`,
      description: `Logged in to Staff Workspace. Displaying deliverables assigned to you.`,
    });
  };

  const handleLoginAdmin = (password?: string) => {
    if (password !== undefined && password !== 'Iamadmin47!') {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        description: 'Incorrect administrator password.',
      });
      return;
    }
    const session: UserSession = { role: 'admin', name: 'Project Lead', email: 'admin@apexconstruct.demo' };
    setCurrentUser(session);
    try {
      localStorage.setItem('apex_user_session', JSON.stringify({ role: 'admin' }));
    } catch (e) {}
    addToast({
      type: 'sheet',
      title: 'Administrator Access Granted',
      description: 'Full workspace access enabled. You can assign tasks, manage staff, and configure Google Sheets.',
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('apex_user_session');
    } catch (e) {}
    addToast({
      type: 'sheet',
      title: 'Signed Out',
      description: 'You have been safely signed out. Please enter your email to access your tasks.',
    });
  };

  // If staff user is currently on admin-only views, switch to table view
  useEffect(() => {
    if (currentUser?.role === 'staff' && (activeView === 'staff' || activeView === 'assignee')) {
      setActiveView('table');
    }
  }, [currentUser, activeView]);

  // Check URL params for direct taskId deep linking
  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const taskId = params.get('taskId');
      if (taskId) {
        const found = tasks.find((t) => t.id === taskId);
        if (found) {
          // If staff, verify it is assigned to them
          if (currentUser?.role === 'staff' && found.assigneeId !== currentUser.member.id) {
            return;
          }
          setSelectedTask(found);
        }
      }
    }
  }, [tasks, currentUser]);

  // Handle Task Creation
  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');

      setTasks((prev) => [data.task, ...prev]);
      fetchData(); // Refresh sheet stats and row counts

      if (data.sheetNotification) {
        addToast({
          type: 'sheet',
          title: `📊 Logged to Google Sheet & Notice Dispatched!`,
          description: data.message || `Deliverable recorded in Tasks sheet; assignment alert logged in Notification sheet for ${data.sheetNotification.recipientName} (${data.sheetNotification.recipientEmail})`,
          actionLabel: 'View in Google Sheet Hub',
          onAction: () => setIsSheetModalOpen(true),
        });
      } else {
        addToast({
          type: 'sheet',
          title: '📊 Deliverable Logged to Google Sheet',
          description: data.message || `Deliverable "${data.task.title}" appended to Tasks & Activity Audit tabs.`,
          actionLabel: 'View in Google Sheet Hub',
          onAction: () => setIsSheetModalOpen(true),
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Task Creation Failed',
        description: err.message,
      });
      throw err;
    }
  };

  // Handle Task Update
  const handleUpdateTask = async (id: string, updates: Partial<Task>, notify: boolean = false) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, notifyAssignee: notify }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');

      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      if (selectedTask?.id === id) {
        setSelectedTask(data.task);
      }
      fetchData();

      if (data.sheetNotification) {
        addToast({
          type: 'sheet',
          title: `📊 Assignment Alert Logged in Google Sheet!`,
          description: data.message || `Logged in Notification sheet tab for ${data.sheetNotification.recipientName} (${data.sheetNotification.recipientEmail})`,
          actionLabel: 'View in Google Sheet Hub',
          onAction: () => setIsSheetModalOpen(true),
        });
      } else {
        addToast({
          type: 'sheet',
          title: '📊 Google Sheet Synced',
          description: data.message || 'Changes recorded in Google Sheet Tasks & Activity stream.',
          actionLabel: 'View in Google Sheet Hub',
          onAction: () => setIsSheetModalOpen(true),
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: err.message,
      });
    }
  };

  // Handle Quick Status Change
  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await handleUpdateTask(taskId, { status: newStatus }, false);
  };

  // Handle Delete Task
  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');

      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelectedTask(null);
      fetchData();

      addToast({
        type: 'sheet',
        title: '📊 Deletion Logged to Google Sheet',
        description: 'Deliverable removed from workspace and recorded in Activity Audit sheet tab.',
        actionLabel: 'View in Google Sheet Hub',
        onAction: () => setIsSheetModalOpen(true),
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: err.message,
      });
    }
  };

  // Mock resend email function kept for compatibility
  const handleResendAlert = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await handleUpdateTask(taskId, {}, true);
  };

  // Handle Add Member
  const handleAddMember = async (memberData: Partial<TeamMember>) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add staff member');

      setMembers((prev) => [...prev, data.member]);
      fetchData();

      addToast({
        type: 'sheet',
        title: '👥 Staff Registered in Google Sheet',
        description: `${data.member.name} registered and appended to Google Sheet Staff Roster tab.`,
        actionLabel: 'View in Google Sheet Hub',
        onAction: () => setIsSheetModalOpen(true),
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        description: err.message,
      });
      throw err;
    }
  };

  // Handle Delete Staff Member
  const handleDeleteMember = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove staff member');

      setMembers((prev) => prev.filter((m) => m.id !== id));
      fetchData();

      addToast({
        type: 'sheet',
        title: '👥 Staff Removed from Google Sheet',
        description: data.message || 'Staff member removed from active roster and Google Sheet updated.',
        actionLabel: 'View in Google Sheet Hub',
        onAction: () => setIsSheetModalOpen(true),
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Removal Failed',
        description: err.message,
      });
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove project');

      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId('all');
      }
      fetchData();

      addToast({
        type: 'sheet',
        title: '🏗️ Project Removed from Portfolios',
        description: data.message || 'Project portfolio removed and Google Sheet updated.',
        actionLabel: 'View in Google Sheet Hub',
        onAction: () => setIsSheetModalOpen(true),
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Project Deletion Failed',
        description: err.message,
      });
    }
  };

  // Handle Add Project
  const handleAddProject = async (name: string, code: string) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, icon: '🏢' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      setProjects((prev) => [...prev, data.project]);
      setSelectedProjectId(data.project.id);
      fetchData();

      addToast({
        type: 'sheet',
        title: '🏗️ New Project Portfolio Created',
        description: `Project "${data.project.name}" added and recorded in workspace.`,
        actionLabel: 'View in Google Sheet Hub',
        onAction: () => setIsSheetModalOpen(true),
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Project Creation Failed',
        description: err.message,
      });
    }
  };

  // User Accessible Tasks: Staff only sees tasks assigned to them!
  const userAccessibleTasks = useMemo(() => {
    if (currentUser?.role === 'staff') {
      return tasks.filter((t) => t.assigneeId === currentUser.member.id);
    }
    return tasks;
  }, [tasks, currentUser]);

  // Filter Tasks (search, project, trade, priority within accessible tasks)
  const filteredTasks = useMemo(() => {
    return userAccessibleTasks.filter((task) => {
      // Project filter
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
        return false;
      }

      // Trade discipline filter
      if (tradeFilter !== 'all' && task.trade !== tradeFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesZone = task.zone?.toLowerCase().includes(q);
        const matchesTrade = task.trade?.toLowerCase().includes(q);
        const matchesBlueprint = task.blueprintRef?.toLowerCase().includes(q);

        const assignee = members.find((m) => m.id === task.assigneeId);
        const matchesAssignee = assignee?.name.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesZone && !matchesTrade && !matchesAssignee && !matchesBlueprint) {
          return false;
        }
      }

      // View-specific critical filter
      if (activeView === 'critical' && task.priority !== 'critical') {
        return false;
      }

      return true;
    });
  }, [userAccessibleTasks, selectedProjectId, tradeFilter, priorityFilter, searchQuery, activeView, members]);

  // Statistics calculated strictly on user accessible deliverables
  const inProgressCount = useMemo(() => {
    return userAccessibleTasks.filter((t) => t.status === 'in_progress' || t.status === 'ready').length;
  }, [userAccessibleTasks]);

  const criticalCount = useMemo(() => {
    return userAccessibleTasks.filter((t) => t.priority === 'critical').length;
  }, [userAccessibleTasks]);

  const currentProject = useMemo(() => {
    if (selectedProjectId === 'all') return undefined;
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // If not logged in, show Staff Login Page (or loading splash while checking session)
  if (!currentUser) {
    if (!authInitialized) {
      return (
        <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center text-gray-500 font-sans">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold tracking-wide uppercase text-gray-600">Connecting to Google Sheet Staff Roster...</p>
        </div>
      );
    }
    return (
      <>
        <StaffLoginPage
          members={members}
          googleSheetsConfig={googleSheetsConfig}
          onLoginStaff={handleLoginStaff}
          onLoginAdmin={handleLoginAdmin}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans antialiased overflow-hidden select-none">
      
      {/* 1. Left Notion Sidebar */}
      <NotionSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        projects={projects}
        totalTasks={userAccessibleTasks.length}
        criticalCount={criticalCount}
        sheetNotificationCount={sheetNotificationCount}
        membersCount={members.length}
        totalSyncedRows={totalSyncedRows}
        googleSheetsConfig={googleSheetsConfig}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSheetHub={handleOpenSheetHub}
        onOpenMembers={() => setIsMembersOpen(true)}
        onOpenNewTaskModal={() => {
          setPreselectedMemberId(currentUser?.role === 'staff' ? currentUser.member.id : undefined);
          setIsNewTaskModalOpen(true);
        }}
        onDeleteProject={handleDeleteProject}
        onAddProject={handleAddProject}
      />

      {/* 2. Main Center Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-white select-text">
        
        {/* Top Notion Header */}
        <NotionHeader
          activeView={activeView}
          setActiveView={setActiveView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          tradeFilter={tradeFilter}
          setTradeFilter={setTradeFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          totalTasks={userAccessibleTasks.length}
          inProgressCount={inProgressCount}
          criticalCount={criticalCount}
          sheetNotificationCount={sheetNotificationCount}
          totalSyncedRows={totalSyncedRows}
          currentProject={currentProject}
          googleSheetsConfig={googleSheetsConfig}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenNewTaskModal={() => {
            setPreselectedMemberId(currentUser?.role === 'staff' ? currentUser.member.id : undefined);
            setIsNewTaskModalOpen(true);
          }}
          onOpenSheetHub={handleOpenSheetHub}
        />

        {/* View Switcher Output */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">Syncing with Google Sheet master backend...</p>
            </div>
          ) : activeView === 'staff' ? (
            <StaffManagementView
              members={members}
              tasks={tasks}
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
              onOpenNewTaskModal={(memberId) => {
                setPreselectedMemberId(memberId);
                setIsNewTaskModalOpen(true);
              }}
            />
          ) : activeView === 'board' ? (
            <NotionBoardView
              tasks={filteredTasks}
              members={members}
              projects={projects}
              currentUser={currentUser}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenNewTaskModal={() => {
                setPreselectedMemberId(currentUser?.role === 'staff' ? currentUser.member.id : undefined);
                setIsNewTaskModalOpen(true);
              }}
              onResendEmail={handleResendAlert}
              onQuickStatusChange={handleQuickStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          ) : activeView === 'assignee' ? (
            <NotionAssigneeView
              tasks={filteredTasks}
              members={members}
              projects={projects}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenNewTaskModal={(memberId) => {
                setPreselectedMemberId(memberId);
                setIsNewTaskModalOpen(true);
              }}
              onResendEmail={handleResendAlert}
              onQuickStatusChange={handleQuickStatusChange}
            />
          ) : (
            <NotionTableView
              tasks={filteredTasks}
              members={members}
              projects={projects}
              currentUser={currentUser}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenNewTaskModal={() => {
                setPreselectedMemberId(currentUser?.role === 'staff' ? currentUser.member.id : undefined);
                setIsNewTaskModalOpen(true);
              }}
              onResendEmail={handleResendAlert}
              onQuickStatusChange={handleQuickStatusChange}
              onOpenOutbox={() => setIsSheetModalOpen(true)}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>

      </main>

      {/* Modals */}
      
      {/* 1. New Task Modal */}
      <NotionNewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        members={members}
        projects={projects}
        activeProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined}
        preselectedMemberId={preselectedMemberId || (currentUser?.role === 'staff' ? currentUser.member.id : undefined)}
        onCreateTask={handleCreateTask}
      />

      {/* 2. Task Details / Page Modal */}
      <NotionTaskModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        members={members}
        projects={projects}
        currentUser={currentUser}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onResendEmail={handleResendAlert}
        onOpenOutbox={() => setIsSheetModalOpen(true)}
      />

      {/* 3. Google Sheet Master Hub & Notification Center */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        config={googleSheetsConfig}
        defaultTab={sheetDefaultTab}
        onSyncSuccess={(msg) => {
          fetchData();
          addToast({
            type: 'sheet',
            title: 'Google Sheet Synced',
            description: msg,
          });
        }}
      />

      {/* 4. Team Members / Crew Directory Modal */}
      <TeamMembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        members={members}
        tasks={tasks}
        currentUser={currentUser}
        onAddMember={handleAddMember}
        onDeleteMember={handleDeleteMember}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
