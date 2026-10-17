import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Laptop,
  Smartphone,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { BeyondImage } from './BeyondImage';

export interface AdminUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'explorer' | 'curator' | 'admin';
  token: string;
  status: 'online' | 'inactive' | 'idle';
  lastActive: string;
  device?: string;
  ipAddress?: string;
  discoveriesCount?: number;
  xp?: number;
  avatarUrl?: string;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'inactive'>('all');
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove explorer "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast(`Removed explorer "${name}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurgeInactive = async () => {
    const inactiveCount = users.filter((u) => u.status === 'inactive' && u.role !== 'admin').length;
    if (inactiveCount === 0) {
      alert('There are no inactive users to purge right now!');
      return;
    }
    if (!confirm(`⚠️ PURGE CONFIRMATION:\nRemove all ${inactiveCount} inactive users who are not active? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsPurging(true);
      const res = await fetch('/api/admin/users/purge-inactive', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`⚡ Successfully purged ${data.purgedCount} inactive users!`);
        await fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPurging(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: 'admin' | 'curator' | 'explorer') => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
        showToast(`Updated role to ${newRole}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'online' ? 'inactive' : 'online';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
        showToast(`Marked ${user.name} as ${nextStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const onlineCount = users.filter((u) => u.status === 'online').length;
  const inactiveCount = users.filter((u) => u.status === 'inactive').length;
  const curatorsCount = users.filter((u) => u.role === 'admin' || u.role === 'curator').length;

  const displayedUsers = users.filter((u) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'online' && u.status === 'online') ||
      (statusFilter === 'inactive' && u.status === 'inactive');
    const matchesQuery =
      !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 animate-fadeIn font-sans select-none">
      <div className="w-full max-w-5xl bg-[#090E17] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0C1420] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E599]/20 border border-[#00E599]/40 flex items-center justify-center text-[#00E599]">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white font-display">BEYOND Admin Portal</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
                  Live Management
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitor active explorer sessions and remove inactive or ghost accounts in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Live Metrics Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 pb-2 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#0F1826] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Explorers</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-ping" />
            </div>
            <div className="text-2xl font-black text-white font-display mt-1">{onlineCount}</div>
            <span className="text-[10px] text-[#00E599] font-medium">● Online right now</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F1826] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Inactive Users</span>
              <UserX size={14} className="text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white font-display mt-1">{inactiveCount}</div>
            <span className="text-[10px] text-slate-400">Candidates for purge</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F1826] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Curators & Admins</span>
              <Shield size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-display mt-1">{curatorsCount}</div>
            <span className="text-[10px] text-amber-300">Verified authority</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F1826] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">One-Click Action</span>
              <AlertTriangle size={14} className="text-rose-400" />
            </div>
            <button
              onClick={handlePurgeInactive}
              disabled={isPurging || inactiveCount === 0}
              className="mt-1 w-full py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Trash2 size={13} />
              <span>{isPurging ? 'Purging...' : `Purge ${inactiveCount} Inactive`}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0B121E] shrink-0">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, handle, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111A29] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E599]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#111A29] p-1 rounded-xl border border-white/10">
            {(['all', 'online', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-[#00E599] text-[#050911] shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s} ({s === 'all' ? users.length : s === 'online' ? onlineCount : inactiveCount})
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
          {displayedUsers.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No explorers found matching your filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Explorer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Last Active</th>
                    <th className="pb-3">Device & IP</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedUsers.map((u) => {
                    const isOnline = u.status === 'online';
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* User Identity */}
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-3">
                            <BeyondImage
                              src={u.avatarUrl || '/intro/assets/rohit_avatar.png'}
                              fallbackSrc="/intro/assets/rohit_avatar.png"
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.role === 'admin' && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isOnline
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-700/20 text-slate-400 border border-slate-700/40'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="uppercase">{u.status}</span>
                          </button>
                        </td>

                        {/* Role Dropdown */}
                        <td className="py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className="bg-[#111A29] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00E599]"
                          >
                            <option value="explorer">Explorer</option>
                            <option value="curator">Curator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Last Active */}
                        <td className="py-3">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Clock size={11} className="text-slate-400" />
                            <span>{u.lastActive}</span>
                          </div>
                        </td>

                        {/* Device & Location */}
                        <td className="py-3">
                          <div className="text-[11px] text-slate-300 truncate max-w-[180px]">
                            {u.device || 'Web Browser'}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {u.ipAddress || '127.0.0.1'}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={u.role === 'admin'}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                            title={u.role === 'admin' ? 'Cannot delete admin' : 'Remove User'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer & Toast */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0C1420] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Active BEYOND Session Monitor • Port 5000</span>
          {toastMessage && (
            <div className="text-[#00E599] font-bold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 size={14} />
              <span>{toastMessage}</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
