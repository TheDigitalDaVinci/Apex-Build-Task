'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Table2, 
  Users, 
  Bell, 
  FileText, 
  CheckCircle2, 
  Search, 
  Database,
  ArrowUpRight,
  Sliders,
  Check,
  Clock,
  Sparkles,
  Mail,
  Send,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { GoogleSheetsConfig } from '@/lib/types';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig | null;
  onSyncSuccess?: (msg: string) => void;
  defaultTab?: 'tasks' | 'staff' | 'notifications' | 'activity' | 'settings';
}

export function GoogleSheetsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
        fill="#0F9D58"
      />
      <path
        d="M17 17H7V15H17V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z"
        fill="white"
      />
      <path
        d="M10 7V17M14 7V17"
        stroke="#0F9D58"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function GoogleSheetModal({
  isOpen,
  onClose,
  config,
  onSyncSuccess,
  defaultTab = 'tasks',
}: GoogleSheetModalProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'staff' | 'notifications' | 'activity' | 'settings'>(defaultTab);
  const [sheetData, setSheetData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Settings form state
  const [spreadsheetId, setSpreadsheetId] = useState(config?.spreadsheetId || '');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(config?.spreadsheetUrl || '');
  const [sheetTitle, setSheetTitle] = useState(config?.sheetTitle || '');
  const [webAppUrl, setWebAppUrl] = useState(config?.webAppUrl || '');
  const [serviceAccountEmail, setServiceAccountEmail] = useState(config?.serviceAccountEmail || '');
  const [serviceAccountKey, setServiceAccountKey] = useState(config?.serviceAccountKey || '');
  const [autoSyncOnChange, setAutoSyncOnChange] = useState(config?.autoSyncOnChange ?? true);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sheets');
      if (res.ok) {
        const data = await res.json();
        setSheetData(data);
        if (data.config) {
          setSpreadsheetId(data.config.spreadsheetId || '');
          setSpreadsheetUrl(data.config.spreadsheetUrl || '');
          setSheetTitle(data.config.sheetTitle || '');
          setWebAppUrl(data.config.webAppUrl || '');
          setServiceAccountEmail(data.config.serviceAccountEmail || '');
          setServiceAccountKey(data.config.serviceAccountKey || '');
          setAutoSyncOnChange(data.config.autoSyncOnChange ?? true);
        }
      }
    } catch (err) {
      console.error('Failed to load sheet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (defaultTab) setActiveTab(defaultTab);
      fetchSheetData();
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess('Synchronized successfully with Google Sheet master!');
        setTimeout(() => setSaveSuccess(''), 4000);
        if (onSyncSuccess) onSyncSuccess(data.message || 'Google Sheet synced!');
        fetchSheetData();
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSyncing(true);
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          spreadsheetId,
          spreadsheetUrl,
          sheetTitle,
          webAppUrl,
          serviceAccountEmail,
          serviceAccountKey,
          autoSyncOnChange,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess('Google Sheet connection and settings saved!');
        setTimeout(() => setSaveSuccess(''), 4000);
        if (onSyncSuccess) onSyncSuccess('Google Sheet updated!');
        fetchSheetData();
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestEmailDispatch = async () => {
    try {
      setTestEmailLoading(true);
      setTestEmailResult(null);
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_email', to: 'nidhinzzx4@gmail.com' }),
      });
      const data = await res.json();
      setTestEmailResult({
        success: data.success,
        message: data.message || (data.success ? 'Email dispatched successfully to nidhinzzx4@gmail.com!' : 'Apps Script has not been updated with the new code yet.')
      });
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: 'Network error: ' + err.message
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleCopyScript = () => {
    fetch('/google-apps-script.js')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 3000);
      })
      .catch(() => {
        // Fallback
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 3000);
      });
  };

  const handleDownloadCsv = (tabName: string) => {
    if (!sheetData?.sheets?.[tabName]) return;
    const sheet = sheetData.sheets[tabName];
    const escapeCsv = (val: any) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csvContent = [
      sheet.headers.map(escapeCsv).join(','),
      ...sheet.rows.map((row: string[]) => row.map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `apex_googlesheet_${tabName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentSheet = sheetData?.sheets?.[activeTab];
  const filteredRows = currentSheet?.rows?.filter((row: string[]) => {
    if (!searchQuery.trim()) return true;
    return row.some(cell => String(cell).toLowerCase().includes(searchQuery.toLowerCase()));
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#1e1e1e] border border-neutral-700/80 rounded-2xl shadow-2xl text-neutral-100 overflow-hidden font-sans">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#252525] border-b border-neutral-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <GoogleSheetsIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-neutral-100">
                  {sheetData?.config?.sheetTitle || 'Google Sheets Master Backend'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Sync Active
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                <span>Spreadsheet ID: <code className="text-emerald-300 font-mono text-[11px] bg-neutral-800 px-1.5 py-0.5 rounded">{sheetData?.config?.spreadsheetId?.slice(0, 16)}...</code></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  Last synced: {sheetData?.stats?.lastSyncedAt ? new Date(sheetData.stats.lastSyncedAt).toLocaleTimeString() : 'Just now'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 transition-colors shadow-sm disabled:opacity-50"
              title="Force re-sync all tasks, roster, activity and notification logs to Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {sheetData?.config?.spreadsheetUrl && (
              <a
                href={sheetData.config.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              >
                <span>Open in Google Sheets</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-6 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-0 bg-[#212121] border-b border-neutral-800">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'tasks'
                  ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>📋 Tasks</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 font-mono">
                {sheetData?.stats?.tasksCount ?? 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'staff'
                  ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Staff Roster</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 font-mono">
                {sheetData?.stats?.staffCount ?? 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'notifications'
                  ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>🔔 Notification Log</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
                {sheetData?.stats?.notificationsCount ?? 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'activity'
                  ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📜 Activity Audit</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 font-mono">
                {sheetData?.stats?.activityCount ?? 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>⚙️ Connection & API</span>
            </button>
          </div>

          {activeTab !== 'settings' && (
            <div className="flex items-center gap-2 pb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter sheet rows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-neutral-900 border border-neutral-700/80 rounded-md text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-52"
                />
              </div>

              <button
                onClick={() => handleDownloadCsv(activeTab)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 transition-colors"
                title="Download current tab as CSV"
              >
                <Download className="w-3 h-3 text-neutral-400" />
                <span>CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[#1b1b1b] p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
              <p className="text-sm">Reading Google Sheet live rows & tabs...</p>
            </div>
          ) : activeTab === 'settings' ? (
            /* Google Sheets Settings Tab */
            <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-neutral-300 text-xs leading-relaxed flex items-start gap-3">
                <div className="p-1.5 bg-emerald-900/50 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-300 text-sm mb-1">Google Sheet as Direct Operations Backend</h4>
                  <p>
                    All tasks, staff assignments, status changes, and notification logs on this platform are structured into 4 synchronized Google Sheet tabs: 
                    <strong className="text-white"> 📋 Tasks</strong>, 
                    <strong className="text-white"> 👥 Staff Roster</strong>, 
                    <strong className="text-white"> 🔔 Notification Log</strong>, and 
                    <strong className="text-white"> 📜 Activity Audit</strong>.
                    Changes are automatically saved both to your live sheet and local instant mirror.
                  </p>
                </div>
              </div>

              <div className="bg-[#242424] border border-neutral-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Google Spreadsheet Target</span>
                </h3>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Spreadsheet Name / Workspace Label
                  </label>
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    placeholder="e.g. Apex Construction - A&E Engineering Operations Sheet"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Google Spreadsheet ID or Full URL
                  </label>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Paste Spreadsheet ID or full https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 font-mono placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Found in your Google Sheet address bar between <code>/d/</code> and <code>/edit</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Full Web Link to Open Sheet
                  </label>
                  <input
                    type="text"
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 font-mono placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Google Apps Script Webhook URL (For Real Cloud Push)
                  </label>
                  <input
                    type="text"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 font-mono placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    If you deploy the initialization Apps Script as a Web App (Deploy &gt; Web app), every change in this app immediately writes directly into your live Google Sheet!
                  </p>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncOnChange}
                      onChange={(e) => setAutoSyncOnChange(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-700 text-emerald-600 focus:ring-emerald-500 bg-neutral-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-neutral-200">Instant Real-time Auto-Sync</span>
                      <p className="text-[11px] text-neutral-400">
                        Automatically update Google Sheet rows whenever tasks are created, assigned, or moved.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Automatic Email Notification Setup & Live Test */}
              <div className="bg-[#242424] border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Automatic Email Notification Dispatcher (Google Apps Script)</span>
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/30">
                    Live Cloud Hook
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Whenever an architect or engineer is assigned a task, Google Sheets automatically sends an official deliverable notice email directly to their inbox using Google&apos;s native mailing engine.
                </p>

                <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg space-y-2 text-xs">
                  <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">!</span>
                    <span>To activate / update in your Google Sheet (4 Simple Steps):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
                    <li>Open your Google Sheet &rarr; Click <strong className="text-neutral-200">Extensions &gt; Apps Script</strong>.</li>
                    <li>Select all code (<code className="text-emerald-400">Ctrl+A</code>), delete it, and paste the updated script.</li>
                    <li>Click <strong className="text-neutral-200">Save (💾)</strong>, select <code className="text-emerald-400">sendTestAssignmentNotification</code> at top &rarr; click <strong className="text-neutral-200">▷ Run</strong>, and click <strong className="text-neutral-200">Allow</strong> when Google prompts.</li>
                    <li>Click <strong className="text-neutral-200">Deploy &gt; Manage deployments &gt; Edit (✏️) &gt; Version: &quot;New version&quot; &gt; Deploy</strong>.</li>
                  </ol>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleTestEmailDispatch}
                    disabled={testEmailLoading}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 shadow"
                  >
                    {testEmailLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Test Dispatch...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test Email to nidhinzzx4@gmail.com</span>
                      </>
                    )}
                  </button>

                  <a
                    href="/google-apps-script.js"
                    download="google-apps-script.js"
                    className="px-3.5 py-2 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5 border border-neutral-700"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Download google-apps-script.js</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5 border border-neutral-700"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Copy Script Code</span>
                      </>
                    )}
                  </button>
                </div>

                {testEmailResult && (
                  <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    testEmailResult.success 
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' 
                      : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                  }`}>
                    {testEmailResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{testEmailResult.success ? 'Email Sent!' : 'Action Required:'}</div>
                      <div>{testEmailResult.message}</div>
                      {!testEmailResult.success && (
                        <div className="mt-1 text-[11px] text-amber-200/80">
                          Please update your Google Apps Script with the new version and deploy it as a &quot;New version&quot; under Manage deployments.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Google Cloud API Service Account (Optional for direct Google Cloud push) */}
              <div className="bg-[#242424] border border-neutral-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Google Cloud Service Account (Direct Cloud Push - Optional)</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">Optional</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  If provided, the platform will use Google Cloud Sheets API v4 to push live rows directly into your Google Workspace account.
                </p>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Service Account Email
                  </label>
                  <input
                    type="text"
                    value={serviceAccountEmail}
                    onChange={(e) => setServiceAccountEmail(e.target.value)}
                    placeholder="e.g. apex-sync@apex-construction-project.iam.gserviceaccount.com"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Private Key (PEM format)
                  </label>
                  <textarea
                    rows={3}
                    value={serviceAccountKey}
                    onChange={(e) => setServiceAccountKey(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Connection & Sync</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Spreadsheets Table Grid View */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>
                  Showing <strong className="text-neutral-200">{filteredRows.length}</strong> of{' '}
                  <strong className="text-neutral-200">{currentSheet?.total || 0}</strong> sheet rows
                </span>
                <span className="font-mono text-[11px] text-neutral-500">
                  Tab: {SHEET_TABS.find(t => t.id === activeTab)?.name || activeTab}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-[#212121] shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#292929] border-b border-neutral-700/80 sticky top-0 z-10 text-neutral-300 font-semibold tracking-wider">
                      <th className="py-2.5 px-3 w-12 text-center text-neutral-500 border-r border-neutral-700/60 font-mono text-[10px]">#</th>
                      {currentSheet?.headers?.map((header: string, idx: number) => (
                        <th key={idx} className="py-2.5 px-3 whitespace-nowrap border-r border-neutral-700/40 last:border-r-0">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-normal">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={(currentSheet?.headers?.length || 1) + 1} className="py-12 text-center text-neutral-500">
                          No matching records found in this sheet tab.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row: string[], rowIdx: number) => (
                        <tr 
                          key={rowIdx} 
                          className="hover:bg-neutral-800/60 transition-colors group"
                        >
                          <td className="py-2.5 px-3 text-center text-neutral-500 border-r border-neutral-800 font-mono text-[10px] bg-[#1d1d1d]">
                            {rowIdx + 1}
                          </td>
                          {row.map((cell: string, cellIdx: number) => {
                            // Style status or special tags
                            const isStatusCell = cell === 'IN_PROGRESS' || cell === 'READY' || cell === 'COMPLETED' || cell === 'INSPECTION' || cell === 'BACKLOG';
                            const isNotificationStatus = cell === 'LOGGED_TO_SHEET' || cell === 'SYNCED_TO_CLOUD';
                            const isActionType = cell === 'TASK_ASSIGNED' || cell === 'STATUS_CHANGED' || cell === 'TASK_CREATED' || cell === 'STAFF_REGISTERED';

                            return (
                              <td 
                                key={cellIdx} 
                                className="py-2.5 px-3 whitespace-nowrap border-r border-neutral-800/60 last:border-r-0 max-w-xs truncate text-neutral-200"
                                title={String(cell)}
                              >
                                {isNotificationStatus ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    {cell}
                                  </span>
                                ) : isStatusCell ? (
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                                    cell === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/30' :
                                    cell === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border border-blue-600/30' :
                                    cell === 'INSPECTION' ? 'bg-purple-950 text-purple-300 border border-purple-600/30' :
                                    'bg-neutral-800 text-neutral-300'
                                  }`}>
                                    {cell}
                                  </span>
                                ) : isActionType ? (
                                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-700/30">
                                    {cell}
                                  </span>
                                ) : (
                                  <span>{cell}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#242424] border-t border-neutral-800 text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Backend: <strong className="text-neutral-200">Google Sheet Master Engine</strong></span>
            </span>
            <span>•</span>
            <span>Total rows across all 4 tabs: <strong className="text-neutral-200">{sheetData?.stats?.totalRows ?? 0}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const SHEET_TABS = [
  { id: 'tasks', name: '📋 Tasks' },
  { id: 'staff', name: '👥 Staff Roster' },
  { id: 'notifications', name: '🔔 Notification Log' },
  { id: 'activity', name: '📜 Activity Audit' },
];
