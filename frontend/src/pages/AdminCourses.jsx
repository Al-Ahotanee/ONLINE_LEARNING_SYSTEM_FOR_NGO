import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../api.js';

const CATEGORIES = ['General', 'Safety', 'Compliance', 'Health', 'Finance', 'Programme', 'Operations', 'Leadership'];

const CAT_COLORS = {
  Safety:      'bg-red-50 text-red-600 border-red-100',
  Compliance:  'bg-violet-50 text-violet-600 border-violet-100',
  Finance:     'bg-amber-50 text-amber-600 border-amber-100',
  Health:      'bg-green-50 text-green-600 border-green-100',
  Programme:   'bg-sky-50 text-sky-600 border-sky-100',
  Operations:  'bg-orange-50 text-orange-600 border-orange-100',
  Leadership:  'bg-pink-50 text-pink-600 border-pink-100',
  General:     'bg-slate-50 text-slate-600 border-slate-100',
};

const EMPTY_FORM = { title: '', description: '', estimated_hours: 2, category: 'General' };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/courses');
      setCourses(data);
    } catch (e) {
      setCourses([
        { id:1, title:'Field Security 101', description:'Basic safety.', estimated_hours:4.5, category:'Safety', is_published:true },
        { id:2, title:'PSEA Essentials', description:'Compliance training.', estimated_hours:3, category:'Compliance', is_published:true },
        { id:3, title:'Grant Reporting', description:'Donor compliance.', estimated_hours:6, category:'Finance', is_published:true },
      ]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      if (editId) {
        await fetchApi(`/admin/courses/${editId}`, 'PATCH', form);
        setSuccess('Course updated.');
      } else {
        await fetchApi('/admin/courses', 'POST', form);
        setSuccess('Course published.');
      }
      setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
      load(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (c) => {
    setForm({ title: c.title, description: c.description, estimated_hours: c.estimated_hours, category: c.category || 'General' });
    setEditId(c.id); setShowForm(true); setError('');
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try { await fetchApi(`/admin/courses/${id}`, 'DELETE'); load(); }
    catch (err) { setError(err.message); }
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Course Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{courses.length} courses in catalog</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="flex-1 sm:w-56 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all" />
          <button onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setEditId(null); }}
            className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            New Course
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">{success}</div>}

      {/* Form panel */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900">{editId ? 'Edit Course' : 'Publish New Course'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
              className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Course Title *</label>
              <input type="text" required value={form.title} onChange={set('title')}
                placeholder="e.g. Field Security 101"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description *</label>
              <textarea required rows="3" value={form.description} onChange={set('description')}
                placeholder="Course overview and learning objectives…"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 resize-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
              <select value={form.category} onChange={set('category')}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all bg-white">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Estimated Hours *</label>
              <input type="number" step="0.5" min="0.5" required value={form.estimated_hours} onChange={set('estimated_hours')}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all" />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl text-sm shadow-md shadow-brand-600/20 transition-all flex items-center gap-2">
                {submitting ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving…</> : editId ? 'Save Changes' : 'Publish Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID','Title','Category','Hours','Status','Actions'].map((h) => (
                  <th key={h} className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-5 py-16 text-center text-slate-400 text-sm">Loading courses…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-16 text-center text-slate-400 text-sm">No courses found.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">#{c.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${CAT_COLORS[c.category] || CAT_COLORS.General}`}>
                      {c.category || 'General'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{c.estimated_hours}h</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border border-green-100">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Live
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg text-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(c.id, c.title)}
                        className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
