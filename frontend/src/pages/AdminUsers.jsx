import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../api.js';

const ROLES = ['FieldStaff', 'Coordinator', 'NGOAdmin'];

const ROLE_STYLES = {
  NGOAdmin:    'bg-brand-50 text-brand-700 border-brand-100',
  Coordinator: 'bg-violet-50 text-violet-700 border-violet-100',
  FieldStaff:  'bg-slate-50 text-slate-600 border-slate-100',
};

const FALLBACK_USERS = [
  { id:1, full_name:'System Administrator', email:'admin@ngo.org', role:'NGOAdmin', created_at: new Date().toISOString(), enrollment_count:'0' },
  { id:2, full_name:'Amara Diallo', email:'amara@relief.org', role:'FieldStaff', created_at: new Date().toISOString(), enrollment_count:'3' },
  { id:3, full_name:'Priya Nair', email:'priya@sahn.org', role:'Coordinator', created_at: new Date().toISOString(), enrollment_count:'5' },
  { id:4, full_name:'Carlos Mendez', email:'carlos@ldf.org', role:'FieldStaff', created_at: new Date().toISOString(), enrollment_count:'2' },
];

export default function AdminUsers({ user: currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await fetchApi('/admin/users')); }
    catch { setUsers(FALLBACK_USERS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (id, role) => {
    try {
      await fetchApi(`/admin/users/${id}/role`, 'PATCH', { role });
      setSuccess(`Role updated to ${role}.`);
      load(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}" from the platform? This cannot be undone.`)) return;
    try { await fetchApi(`/admin/users/${id}`, 'DELETE'); load(); }
    catch (err) { setError(err.message); }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    All: users.length,
    NGOAdmin:    users.filter((u) => u.role === 'NGOAdmin').length,
    Coordinator: users.filter((u) => u.role === 'Coordinator').length,
    FieldStaff:  users.filter((u) => u.role === 'FieldStaff').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} registered accounts</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all" />
      </div>

      {/* Alerts */}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">{success}</div>}

      {/* Role filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...ROLES].map((r) => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              roleFilter === r
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                : 'bg-white text-slate-500 border-slate-200 hover:border-brand-200 hover:text-brand-600'
            }`}>
            {r} <span className="ml-1 opacity-60">({counts[r] || 0})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['User','Email','Role','Enrollments','Joined','Actions'].map((h) => (
                  <th key={h} className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-5 py-16 text-center text-slate-400 text-sm">Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-16 text-center text-slate-400 text-sm">No users found.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{u.full_name}</p>
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wide">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{u.email}</td>
                  <td className="px-5 py-4">
                    {u.id === currentUser?.id ? (
                      <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                    ) : (
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border cursor-pointer bg-transparent focus:outline-none ${ROLE_STYLES[u.role]}`}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-700">{u.enrollment_count}</span>
                    <span className="text-xs text-slate-400 ml-1">courses</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDelete(u.id, u.full_name)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">{filtered.length} of {users.length} users</p>
          <p className="text-xs text-slate-400">Changes to roles are applied immediately</p>
        </div>
      </div>
    </div>
  );
}
