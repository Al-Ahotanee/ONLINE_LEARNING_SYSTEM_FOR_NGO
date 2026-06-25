import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from './api.js';

// ==========================================
// ICON HELPERS
// ==========================================
const Icon = {
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Book: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Enrollment: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

// ==========================================
// STAT CARD
// ==========================================
function StatCard({ label, value, icon, accent = false, trend }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col gap-4 shadow-sm border transition-shadow hover:shadow-md ${
      accent
        ? 'bg-gradient-to-br from-brand-600 to-brand-700 border-brand-500 text-white'
        : 'bg-white border-slate-100 text-slate-900'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${accent ? 'bg-white/20' : 'bg-brand-50'}`}>
          <span className={accent ? 'text-white' : 'text-brand-600'}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            accent ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'
          }`}>
            Active
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${accent ? 'text-brand-200' : 'text-slate-400'}`}>{label}</p>
      </div>
    </div>
  );
}

// ==========================================
// ADMIN WORKSPACE
// ==========================================
const AdminWorkspace = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0 });
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', estimated_hours: 2 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, coursesData] = await Promise.all([
        fetchApi('/admin/stats'),
        fetchApi('/courses'),
      ]);
      setStats(statsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await fetchApi('/admin/courses', 'POST', formData);
      setSuccess('Course published successfully.');
      setFormData({ title: '', description: '', estimated_hours: 2 });
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await fetchApi(`/admin/courses/${id}`, 'DELETE');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium uppercase tracking-widest">Loading admin data</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Total Users" value={stats.totalUsers} icon={<Icon.Users />} trend />
        <StatCard label="Published Courses" value={stats.totalCourses} icon={<Icon.Book />} trend />
        <StatCard label="Total Enrollments" value={stats.totalEnrollments} icon={<Icon.Enrollment />} accent trend />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Create Course Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className="p-2 bg-brand-50 rounded-xl text-brand-600"><Icon.Plus /></div>
            <h2 className="text-base font-bold text-slate-900">Publish New Course</h2>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <span className="text-green-500"><Icon.Check /></span>
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Course Title</label>
              <input
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Field Security 101"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
              <textarea
                required rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course overview and objectives..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Estimated Hours</label>
              <input
                type="number" step="0.5" min="0.5" required
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 rounded-xl transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-brand-600/20"
            >
              {submitting ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Publishing...</>
              ) : (
                <><Icon.Plus /> Deploy Course</>
              )}
            </button>
          </form>
        </div>

        {/* Course Table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-50 rounded-xl text-brand-600"><Icon.Book /></div>
              <h2 className="text-base font-bold text-slate-900">Course Directory</h2>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {courses.length} courses
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['ID', 'Title', 'Hours', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <div className="text-slate-400 text-sm font-medium">No courses published yet</div>
                      <div className="text-slate-300 text-xs mt-1">Create your first course using the form</div>
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4 text-xs font-mono text-slate-400">#{course.id}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">{course.title}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{course.estimated_hours}h</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Live
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                          title="Delete course"
                        >
                          <Icon.Trash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// LEARNER WORKSPACE
// ==========================================
const LearnerWorkspace = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        fetchApi('/courses'),
        fetchApi('/enrollments'),
      ]);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnroll = async (course_id) => {
    setEnrolling(course_id);
    setError('');
    try {
      await fetchApi('/enrollments', 'POST', { course_id });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium uppercase tracking-widest">Loading training modules</span>
      </div>
    );
  }

  const completedCount = enrollments.filter((e) => e.status === 'Completed').length;
  const inProgressCount = enrollments.filter((e) => e.status === 'In Progress').length;

  return (
    <div className="space-y-10 animate-fade-in">
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Summary stats */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-slate-900">{enrollments.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Enrolled</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-brand-600">{inProgressCount}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">In Progress</p>
          </div>
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold text-white">{completedCount}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-200 mt-1">Completed</p>
          </div>
        </div>
      )}

      {/* Active Enrollments */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">My Active Training</h2>
          <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-wider">
            {enrollments.length} enrolled
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Icon.Book />
            </div>
            <p className="text-sm font-semibold text-slate-500">No active enrollments</p>
            <p className="text-xs text-slate-400 mt-1">Browse the catalog below and enroll in a course</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrollments.map((env) => (
              <div key={env.enrollment_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="font-bold text-slate-900 leading-tight">{env.title}</h3>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap ${
                    env.status === 'Completed'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-brand-50 text-brand-700'
                  }`}>
                    {env.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">{env.description}</p>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{env.progress_percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        env.progress_percentage >= 100 ? 'bg-green-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${env.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <button className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm uppercase tracking-widest">
                  Resume Module
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Catalog */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-5">Course Catalog</h2>
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 text-sm">
            No courses available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const isEnrolled = enrollments.some((e) => e.course_id === course.id);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md p-6 flex flex-col transition-all group"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    <span className="text-brand-400"><Icon.Clock /></span>
                    Est. {course.estimated_hours} hours
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">{course.description}</p>

                  <button
                    disabled={isEnrolled || enrolling === course.id}
                    onClick={() => !isEnrolled && handleEnroll(course.id)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm uppercase tracking-widest transition-all mt-auto flex items-center justify-center gap-2 ${
                      isEnrolled
                        ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                        : enrolling === course.id
                        ? 'bg-brand-100 text-brand-400 cursor-wait'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30'
                    }`}
                  >
                    {isEnrolled ? (
                      <><Icon.Check /> Enrolled</>
                    ) : enrolling === course.id ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Enrolling...</>
                    ) : (
                      'Begin Training'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// DASHBOARD SHELL
// ==========================================
export default function Dashboard({ user, onLogout }) {
  const isAdmin = user.role === 'NGOAdmin';
  const [activeNav, setActiveNav] = useState(isAdmin ? 'management' : 'learning');

  const navItems = isAdmin
    ? [
        { id: 'management', label: 'Management', icon: <Icon.Chart /> },
        { id: 'courses', label: 'Course Library', icon: <Icon.Book /> },
      ]
    : [
        { id: 'learning', label: 'My Learning', icon: <Icon.Book /> },
        { id: 'catalog', label: 'Course Catalog', icon: <Icon.Globe /> },
      ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col shrink-0 shadow-sm">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white"><Icon.Globe /></span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm">NGO Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-3">
            {isAdmin ? 'Admin' : 'Learner'} Menu
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeNav === item.id
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span className={activeNav === item.id ? 'text-brand-600' : 'text-slate-400'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
              {(user.name || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white scale-75"><Icon.Globe /></span>
            </div>
            <span className="font-bold text-slate-900 text-sm">NGO Portal</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="text-slate-300"><Icon.Chart /></span>
            {isAdmin ? 'System Administration' : 'Field Staff Training Environment'}
          </div>
          <button
            onClick={onLogout}
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
          >
            Sign Out
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {isAdmin ? <AdminWorkspace /> : <LearnerWorkspace />}
          </div>
        </main>
      </div>
    </div>
  );
}
