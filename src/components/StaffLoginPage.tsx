'use client';

import React, { useState } from 'react';
import { TeamMember, GoogleSheetsConfig } from '@/lib/types';
import { 
  HardHat, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Lock,
  Building,
  ExternalLink,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { GoogleSheetsIcon } from './GoogleSheetModal';

interface StaffLoginPageProps {
  members: TeamMember[];
  googleSheetsConfig: GoogleSheetsConfig | null;
  onLoginStaff: (member: TeamMember) => void;
  onLoginAdmin: (password?: string) => void;
}

export function StaffLoginPage({
  members,
  googleSheetsConfig,
  onLoginStaff,
  onLoginAdmin,
}: StaffLoginPageProps) {
  const [emailInput, setEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [error, setError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'staff' | 'admin'>('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  const ADMIN_PASSWORD = 'Iamadmin47!';

  const handleStaffLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your staff email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const found = members.find(
        (m) => m.email.trim().toLowerCase() === cleanEmail
      );

      if (found) {
        onLoginStaff(found);
      } else {
        setError(`No staff member found with email "${emailInput.trim()}". Please verify your email is entered in the Google Sheet Staff Roster.`);
        setIsSubmitting(false);
      }
    }, 250);
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminError('');

    const trimmedPassword = adminPasswordInput.trim();
    if (!trimmedPassword) {
      setAdminError('Please enter the workspace admin password.');
      return;
    }

    if (trimmedPassword !== ADMIN_PASSWORD) {
      setAdminError('Incorrect admin password. Access denied.');
      return;
    }

    setIsAdminSubmitting(true);
    setTimeout(() => {
      onLoginAdmin(ADMIN_PASSWORD);
      setIsAdminSubmitting(false);
    }, 200);
  };

  const handleSelectQuickMember = (member: TeamMember) => {
    setEmailInput(member.email);
    setError('');
    onLoginStaff(member);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between text-gray-900 font-sans selection:bg-emerald-100">
      
      {/* Top Banner Bar */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            📐
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-gray-900 uppercase">
              Apex Architecture & Engineering Studio
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              Field Operations & Technical Deliverables Portal
            </p>
          </div>
        </div>

        {/* Live Google Sheet Status Pill */}
        {googleSheetsConfig?.isConnected && (
          <a
            href={googleSheetsConfig.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-semibold transition-colors"
          >
            <GoogleSheetsIcon className="w-3.5 h-3.5" />
            <span>Connected: Google Sheet Master Roster</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </a>
        )}
      </header>

      {/* Main Login Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/90 shadow-xl overflow-hidden animate-fade-in">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-neutral-900 to-emerald-950 p-6 sm:p-7 text-white relative">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <HardHat className="w-4 h-4" />
              <span>Secure Deliverable Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Staff Portal Login
            </h2>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Sign in with your registered email to view and complete your assigned engineering & architectural deliverables.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/70 p-1">
            <button
              onClick={() => {
                setSelectedTab('staff');
                setError('');
                setAdminError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedTab === 'staff'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Staff Member</span>
            </button>
            <button
              onClick={() => {
                setSelectedTab('admin');
                setError('');
                setAdminError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedTab === 'admin'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Project Lead / Admin</span>
            </button>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {selectedTab === 'staff' ? (
              <>
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Staff Email Address (Roster Email)
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
                          if (error) setError('');
                        }}
                        placeholder="e.g. nidhinzzx4@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-emerald-600 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Must match the email address registered in the Google Sheet Staff tab.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-800 text-xs flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 text-[11px] leading-relaxed">
                        {error}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'Verifying Roster...' : 'Sign In to My Tasks'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick 1-Click Roster Selector for testing */}
                {members.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Registered Staff ({members.length})</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Click to quick-login</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {members.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectQuickMember(m)}
                          className="w-full text-left p-2.5 rounded-xl border border-gray-200/70 hover:border-emerald-500/70 hover:bg-emerald-50/50 bg-white transition-all flex items-center justify-between group cursor-pointer"
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
              </>
            ) : (
              /* Project Lead / Admin View with Password Protection */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 text-orange-950 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-orange-950">
                    <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Project Lead & Site Director Access</span>
                  </div>
                  <p className="text-[11px] text-orange-800 leading-relaxed">
                    Full administrative privileges to assign deliverables, manage projects & staff, configure Google Sheets sync, and review audit logs.
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                          <span>Admin Workspace Password</span>
                        </span>
                        <span className="text-[10px] text-orange-700 font-semibold bg-orange-100/70 px-2 py-0.5 rounded-md border border-orange-200/80">
                          Password Protected
                        </span>
                      </span>
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPasswordInput}
                        onChange={(e) => {
                          setAdminPasswordInput(e.target.value);
                          if (adminError) setAdminError('');
                        }}
                        placeholder="Enter admin password..."
                        className="w-full pl-9 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-orange-500 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
                        tabIndex={-1}
                        title={showAdminPassword ? 'Hide password' : 'Show password'}
                      >
                        {showAdminPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-1">
                      Enter the master administrator password to unlock full workspace access.
                    </p>
                  </div>

                  {adminError && (
                    <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-800 text-xs flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 text-[11px] leading-relaxed">
                        {adminError}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAdminSubmitting}
                    className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 active:bg-black text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Building className="w-4 h-4 text-orange-400" />
                    <span>
                      {isAdminSubmitting ? 'Verifying Admin Password...' : 'Unlock Workspace (Admin Mode)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Google Sheet Sync Active</span>
            </span>
            <a
              href="/staff"
              className="font-semibold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1"
            >
              <span>Dedicated Staff Portal</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200/60 bg-white">
        Apex Construction Systems • 2026 Operations Hub • Google Sheet Technical Dispatch Engine
      </footer>

    </div>
  );
}
