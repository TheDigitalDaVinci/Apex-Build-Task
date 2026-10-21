'use client';

import React, { useState } from 'react';
import { TeamMember, TradeType, Task, UserSession } from '@/lib/types';
import { Users, X, Plus, Mail, Phone, Building, Briefcase, Check, Trash2 } from 'lucide-react';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  tasks: Task[];
  currentUser?: UserSession | null;
  onAddMember: (memberData: Partial<TeamMember>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
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

export function TeamMembersModal({
  isOpen,
  onClose,
  members,
  tasks,
  currentUser,
  onAddMember,
  onDeleteMember,
}: TeamMembersModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [trade, setTrade] = useState<TradeType>('Architectural Design');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onAddMember({
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || `${trade} Lead`,
        trade,
        company: company.trim() || 'Subcontractor Network',
        phone: phone.trim() || '+1 (555) 000-0000',
      });
      setShowAddForm(false);
      setName('');
      setEmail('');
      setRole('');
      setCompany('');
      setPhone('');
    } catch (err: any) {
      setError(err.message || 'Failed to add crew member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Crew & Subcontractors Directory</h3>
              <p className="text-xs text-gray-300">
                Manage field personnel and subcontractors receiving task assignment email dispatches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showAddForm && currentUser?.role !== 'staff' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member / Subcontractor</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form to Add New Member */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-5 bg-orange-50/40 border-b border-orange-200 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                Add Field Member or Subcontractor
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2 text-xs bg-red-100 text-red-700 rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email Address (for notifications) *</label>
                <input
                  type="email"
                  placeholder="e.g. j.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Trade / Discipline</label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value as TradeType)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                >
                  {TRADES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Role / Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Electrician"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Subcontractor Company</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Electrical LLC"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-md shadow flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Save & Register Member'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Member Grid List */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => {
              const assignedTasks = tasks.filter((t) => t.assigneeId === member.id);
              const inProgressCount = assignedTasks.filter((t) => t.status === 'in_progress').length;

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border-2 border-orange-500 shadow-sm">
                          {member.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{member.name}</h4>
                          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-800">
                            {member.trade}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold">
                          {assignedTasks.length} {assignedTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                        {currentUser?.role !== 'staff' && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to remove ${member.name} (${member.email}) from the staff roster?\n\nThis will remove them from the roster and update your Google Sheet Staff Roster tab.`)) {
                                await onDeleteMember(member.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove staff member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-800">{member.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{member.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="font-mono text-gray-900 truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Active In-Progress: <strong>{inProgressCount}</strong></span>
                    <span className="text-emerald-700 font-medium">● Notifications Enabled</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
