import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { fetchApi } from '../api.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const FALLBACK_ENROLLMENTS = [
  { enrollment_id:101, course_id:1, title:'Field Security 101', description:'Basic field safety, communication protocols, and risk assessment for remote operations.', progress_percentage:68, status:'In Progress', estimated_hours:4.5, category:'Safety' },
  { enrollment_id:102, course_id:2, title:'PSEA Essentials', description:'Safeguarding and protection from sexual exploitation and abuse — mandatory compliance.', progress_percentage:100, status:'Completed', estimated_hours:3, category:'Compliance' },
];

const CAT_COLORS = {
  Safety:'bg-red-50 text-red-600 border-red-100', Compliance:'bg-violet-50 text-violet-600 border-violet-100',
  Finance:'bg-amber-50 text-amber-600 border-amber-100', Health:'bg-green-50 text-green-600 border-green-100',
  Programme:'bg-sky-50 text-sky-600 border-sky-100', Operations:'bg-orange-50 text-orange-600 border-orange-100',
  General:'bg-slate-50 text-slate-600 border-slate-100',
};

function ProgressRing({ pct, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 100 ? '#10b981' : '#0ea5e9';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:'stroke-dasharray 0.7s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={color}
        fontSize="14" fontWeight="700" transform={`rotate(90, ${size/2}, ${size/2})`}>
        {pct}%
      </text>
    </svg>
  );
}

export default function LearnerHome({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setEnrollments(await fetchApi('/enrollments')); }
    catch { setEnrollments(FALLBACK_ENROLLMENTS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleProgress = async (id, current) => {
    const next = Math.min(100, current + 10);
    setUpdating(id);
    try {
      await fetchApi(`/enrollments/${id}/progress`, 'PATCH', { progress_percentage: next });
      load();
    } catch (err) {
      setEnrollments((prev) => prev.map((e) =>
        e.enrollment_id === id ? { ...e, progress_percentage: next, status: next >= 100 ? 'Completed' : 'In Progress' } : e
      ));
    } finally { setUpdating(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  const completed = enrollments.filter((e) => e.status === 'Completed').length;
  const inProgress = enrollments.filter((e) => e.status === 'In Progress').length;
  const totalHours = enrollments.reduce((sum, e) => sum + parseFloat(e.estimated_hours || 0), 0);
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progress_percentage, 0) / enrollments.length)
    : 0;

  const doughnutData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{ data: [completed, inProgress, Math.max(0, enrollments.length - completed - inProgress)],
      backgroundColor: ['#10b981','#0ea5e9','#e2e8f0'], borderWidth: 0 }],
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-brand-300 text-sm font-semibold uppercase tracking-widest">Welcome back</p>
          <h2 className="text-2xl font-bold text-white mt-1">{user.name}</h2>
          <p className="text-slate-400 text-sm mt-1">
            {inProgress > 0 ? `You have ${inProgress} course${inProgress > 1 ? 's' : ''} in progress.` : 'Ready to start learning today?'}
          </p>
        </div>
        <div className="shrink-0 text-center">
          <ProgressRing pct={avgProgress} size={90} />
          <p className="text-xs text-slate-400 mt-1 font-medium">Avg Progress</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Enrolled', value: enrollments.length, color:'text-brand-600', bg:'bg-brand-50' },
          { label:'In Progress', value: inProgress, color:'text-amber-600', bg:'bg-amber-50' },
          { label:'Completed', value: completed, color:'text-emerald-600', bg:'bg-emerald-50' },
          { label:'Total Hours', value: `${totalHours}h`, color:'text-violet-600', bg:'bg-violet-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Active Courses</h3>
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
              <p className="text-sm font-semibold text-slate-500">No enrollments yet</p>
              <p className="text-xs text-slate-400 mt-1">Head to the Catalog tab to enroll in a course</p>
            </div>
          ) : (
            enrollments.map((e) => (
              <div key={e.enrollment_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <ProgressRing pct={e.progress_percentage} size={70} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 leading-snug">{e.title}</h4>
                      <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${
                        e.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-brand-50 text-brand-700 border-brand-100'
                      }`}>{e.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{e.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${CAT_COLORS[e.category] || CAT_COLORS.General}`}>{e.category || 'General'}</span>
                      <span className="text-xs text-slate-400">{e.estimated_hours}h</span>
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${e.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width:`${e.progress_percentage}%` }} />
                    </div>
                  </div>
                </div>
                {e.status !== 'Completed' && (
                  <button onClick={() => handleProgress(e.enrollment_id, e.progress_percentage)}
                    disabled={updating === e.enrollment_id}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                    {updating === e.enrollment_id ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Updating…</>
                    ) : 'Continue Module →'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Learning Overview</h4>
            {enrollments.length > 0 ? (
              <div className="h-48">
                <Doughnut data={doughnutData} options={{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{ padding:12, font:{ size:11 }, boxWidth:10 } } } }} />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No data yet</div>
            )}
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
            <h4 className="font-bold mb-1">Keep Going!</h4>
            <p className="text-brand-200 text-sm mb-4">Complete your active courses to earn your certificates.</p>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-3xl font-extrabold">{completed}</p>
              <p className="text-brand-200 text-xs uppercase tracking-wider mt-0.5">Courses Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
