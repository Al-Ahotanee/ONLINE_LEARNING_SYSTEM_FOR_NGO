import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../api.js';

const CAT_COLORS = {
  Safety:'bg-red-50 text-red-600 border-red-100', Compliance:'bg-violet-50 text-violet-600 border-violet-100',
  Finance:'bg-amber-50 text-amber-600 border-amber-100', Health:'bg-green-50 text-green-600 border-green-100',
  Programme:'bg-sky-50 text-sky-600 border-sky-100', Operations:'bg-orange-50 text-orange-600 border-orange-100',
  Leadership:'bg-pink-50 text-pink-600 border-pink-100', General:'bg-slate-50 text-slate-600 border-slate-100',
};

const FALLBACK_COURSES = [
  { id:1, title:'Field Security 101', description:'Basic field safety, communication protocols, and risk assessment for remote operations.', estimated_hours:4.5, category:'Safety' },
  { id:2, title:'PSEA Essentials', description:'Safeguarding and protection from sexual exploitation and abuse — mandatory for all staff.', estimated_hours:3, category:'Compliance' },
  { id:3, title:'Grant Reporting & Compliance', description:'Institutional donor compliance guidelines, financial reporting, and narrative structures.', estimated_hours:6, category:'Finance' },
  { id:4, title:'First Aid in Low-Resource Settings', description:'Emergency medical response training tailored for field environments without reliable infrastructure.', estimated_hours:8, category:'Health' },
  { id:5, title:'Community Engagement & MEAL', description:'Monitoring, Evaluation, Accountability and Learning frameworks for programme staff.', estimated_hours:5.5, category:'Programme' },
  { id:6, title:'Logistics & Supply Chain', description:'Procurement, warehousing, and distribution management in humanitarian response.', estimated_hours:4, category:'Operations' },
];

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, e] = await Promise.all([fetchApi('/courses'), fetchApi('/enrollments')]);
      setCourses(c); setEnrollments(e);
    } catch {
      setCourses(FALLBACK_COURSES); setEnrollments([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEnroll = async (course_id) => {
    setEnrolling(course_id); setError('');
    try {
      await fetchApi('/enrollments', 'POST', { course_id });
      setSuccess('Enrolled successfully!');
      load(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
    finally { setEnrolling(null); }
  };

  const categories = ['All', ...new Set(courses.map((c) => c.category || 'General').filter(Boolean))];

  const filtered = courses.filter((c) => {
    const s = search.toLowerCase();
    const matchS = c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s);
    const matchC = catFilter === 'All' || (c.category || 'General') === catFilter;
    return matchS && matchC;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Course Catalog</h2>
        <p className="text-sm text-slate-400 mt-0.5">{courses.length} courses available · Browse and enroll</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by title or topic…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                catFilter === c ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-200'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">{success}</div>}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <svg className="animate-spin w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center text-slate-400 text-sm">No courses match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((course) => {
            const isEnrolled = enrollments.some((e) => e.course_id === course.id);
            const enrollment = enrollments.find((e) => e.course_id === course.id);
            return (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 p-6 flex flex-col transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${CAT_COLORS[course.category || 'General']}`}>
                    {course.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {course.estimated_hours}h
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors leading-snug">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-5 flex-1 line-clamp-3">{course.description}</p>

                {isEnrolled && enrollment && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Your Progress</span><span>{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${enrollment.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width:`${enrollment.progress_percentage}%` }} />
                    </div>
                  </div>
                )}

                <button disabled={isEnrolled || enrolling === course.id}
                  onClick={() => !isEnrolled && handleEnroll(course.id)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isEnrolled
                      ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                      : enrolling === course.id
                      ? 'bg-brand-100 text-brand-400 cursor-wait'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 hover:shadow-lg'
                  }`}>
                  {isEnrolled ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Enrolled</>
                  ) : enrolling === course.id ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Enrolling…</>
                  ) : 'Enroll Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
