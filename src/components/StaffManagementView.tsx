'use client';

import React, { useState } from 'react';
import { TeamMember, TradeType, Task } from '@/lib/types';
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Check, 
  Award, 
  MapPin, 
  Search, 
  Send, 
  ExternalLink,
  Layers,
  Sparkles,
  Compass,
  Trash2
} from 'lucide-react';

interface StaffManagementViewProps {
  members: TeamMember[];
  tasks: Task[];
  onAddMember: (memberData: Partial<TeamMember>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onOpenNewTaskModal: (preselectedMemberId?: string) => void;
  onSendTestNotification?: (email: string, name: string) => void;
}

const DISCIPLINES: TradeType[] = [
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

export function StaffManagementView({
  members,
  tasks,
  onAddMember,
  onDeleteMember,
  onOpenNewTaskModal,
}: StaffManagementViewProps) {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [trade, setTrade] = useState<TradeType>('Architectural Design');
  const [company, setCompany] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Full Name and Email Address (Mail ID) are required');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid Mail ID format (e.g. architect@firm.com)');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await onAddMember({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim() || `${trade} Specialist`,
        trade,
        company: company.trim() || 'Design & Engineering Division',
        licenseNo: licenseNo.trim() || undefined,
        officeLocation: officeLocation.trim() || 'HQ Design Studio',
        phone: phone.trim() || '+1 (555) 012-3456',
      });

      setSuccessMsg(`Architect / Engineer "${name}" successfully registered! Automatically appended to Google Sheet Staff Roster tab and ready for task assignments.`);
      
      // Reset form
      setName('');
      setEmail('');
      setRole('');
      setCompany('');
      setLicenseNo('');
      setOfficeLocation('');
      setPhone('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save staff member details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    if (disciplineFilter !== 'all' && member.trade !== disciplineFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = member.name.toLowerCase().includes(q);
      const matchEmail = member.email.toLowerCase().includes(q);
      const matchRole = member.role.toLowerCase().includes(q);
      const matchLicense = member.licenseNo?.toLowerCase().includes(q);
      return matchName || matchEmail || matchRole || matchLicense;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Design Studio & Technical Operations</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Architects & Engineers Directory
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Manage your office engineering staff, licensed architects, structural calculation leads, and BIM modelers. Every task assigned to an engineer will automatically send them a detailed specification briefing via their registered mail ID.
          </p>
        </div>
      </div>

      {/* Input Staff Details Section */}
      <div className="bg-white rounded-2xl border-2 border-orange-200/80 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Input Staff Details (Architects & Engineers)
              </h3>
              <p className="text-xs text-gray-500">
                Register technical office personnel with their mail IDs; automatically logged to Google Sheet Staff Roster tab
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ● Google Sheet Sync Active
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-red-500 font-bold ml-2">&times;</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold ml-2">&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Staff Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Name & Credentials *
              </label>
              <input
                type="text"
                placeholder="e.g. Sophia Al-Mansoor, AIA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-medium text-gray-900"
                required
              />
            </div>

            {/* Email Address / Mail ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1 text-orange-900">
                <Mail className="w-3.5 h-3.5 text-orange-600" />
                <span>Staff Mail ID (Notification Target) *</span>
              </label>
              <input
                type="email"
                placeholder="e.g. s.almansoor@apexconstruct.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border-2 border-orange-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-orange-50/20 font-mono text-gray-900"
                required
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Assignment emails & review requests are automatically delivered here.
              </span>
            </div>

            {/* Engineering Discipline */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Discipline / Specialty
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value as TradeType)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-gray-800 font-medium"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Role Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Professional Role / Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Structural Project Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-gray-800 font-medium"
              />
            </div>

            {/* Studio / Department */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Studio / Department
              </label>
              <input
                type="text"
                placeholder="e.g. High-Rise Architectural Lab"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-gray-800 font-medium"
              />
            </div>

            {/* License # */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>License / Stamp Registration #</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PE / SE #58392, AIA #94210"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-gray-800 font-medium"
              />
            </div>

            {/* Office Desk / Location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Office Studio Location
              </label>
              <input
                type="text"
                placeholder="e.g. HQ 4th Floor - Studio 402"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-gray-800 font-medium"
              />
            </div>

            {/* Direct Phone / Extension */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Office Phone / Ext
              </label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 234-9081 ext. 42"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-gray-800 font-medium"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 h-[42px]"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Architect / Engineer'}</span>
              </button>
            </div>

          </div>
        </form>

      </div>

      {/* Roster & Active Engineering Team */}
      <div className="space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F7F6F3] p-3.5 rounded-xl border border-gray-200">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h3 className="font-bold text-sm text-gray-800 shrink-0">
              Active Staff Roster ({filteredMembers.length})
            </h3>
            <span className="text-xs text-gray-500 hidden md:inline">
              • Ready for engineering task dispatch
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, mail ID, or PE/AIA #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
              />
            </div>

            {/* Discipline Dropdown */}
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
            >
              <option value="all">All Disciplines</option>
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Staff Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
            const inProgressCount = memberTasks.filter((t) => t.status === 'in_progress').length;
            const criticalCount = memberTasks.filter((t) => t.priority === 'critical').length;

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-orange-400 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top: Avatar, Name, License, and Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center border-2 border-orange-500 shadow-xs shrink-0">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                          {member.name}
                        </h4>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-800">
                          {member.trade}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {member.licenseNo && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                          {member.licenseNo}
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to remove ${member.name} (${member.email}) from the staff roster?\n\nThis will remove them from the roster, unassign their pending tasks, and update your Google Sheet Staff Roster tab.`)) {
                            await onDeleteMember(member.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove staff member from roster"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mail ID Highlight Box */}
                  <div className="mt-4 p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3 text-orange-600" />
                      <span>Registered Notification Mail ID</span>
                    </div>
                    <div className="font-mono text-xs font-semibold text-gray-900 truncate select-all">
                      {member.email}
                    </div>
                  </div>

                  {/* Role and Studio details */}
                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800 line-clamp-1">{member.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate text-gray-600">{member.company}</span>
                    </div>

                    {member.officeLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate text-gray-500">{member.officeLocation}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Workload & Assign Action */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-gray-500">Tasks: </span>
                    <strong className="text-gray-900 font-bold">{memberTasks.length}</strong>
                    {inProgressCount > 0 && (
                      <span className="text-amber-700 ml-1.5 font-medium">({inProgressCount} in dev)</span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenNewTaskModal(member.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Task</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-200">
            No architects or engineers match your search. Use the input form above to add a staff member!
          </div>
        )}

      </div>

    </div>
  );
}
