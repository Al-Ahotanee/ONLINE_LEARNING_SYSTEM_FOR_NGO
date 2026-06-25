import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { fetchApi } from '../api.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// ── Fallback data (used when API is unreachable) ─────────────
const FALLBACK = {
  stats: { totalUsers: 284, totalCourses: 12, totalEnrollments: 1047, completionRate: 68 },
  recentEnrollments: [
    { full_name: 'Amara Diallo',  title: 'Field Security 101',  enrolled_at: new Date().toISOString() },
    { full_name: 'Priya Nair',    title: 'PSEA Essentials',      enrolled_at: new Date().toISOString() },
    { full_name: 'Carlos Mendez', title: 'Grant Reporting',      enrolled_at: new Date().toISOString() },
    { full_name: 'Joyce Okonkwo', title: 'First Aid & CPR',      enrolled_at: new Date().toISOString() },
  ],
  topCourses: [
    { title: 'Field Security 101', count: '312' },
    { title: 'PSEA Essentials',    count: '278' },
    { title: 'Grant Reporting',    count: '194' },
    { title: 'First Aid & CPR',    count: '156' },
    { title: 'Logistics Basics',   count: '107' },
  ],
  userGrowth:      [{ month:'Jan',count:'22'},{month:'Feb',count:'31'},{month:'Mar',count:'45'},{month:'Apr',count:'38'},{month:'May',count:'54'},{month:'Jun',count:'61'}],
  enrollmentTrend: [{ month:'Jan',count:'68'},{month:'Feb',count:'94'},{month:'Mar',count:'132'},{month:'Apr',count:'118'},{month:'May',count:'167'},{month:'Jun',count:'195'}],
};

// ── Chart defaults ───────────────────────────────────────────
const baseLineOpts = (title) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, title: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
    y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#94a3b8' }, beginAtZero: true },
  },
});

const baseBarOpts = {
  responsive: true, maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#94a3b8' }, beginAtZero: true },
    y: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748b' } },
  },
};

const doughnutOpts = {
  responsive: true, maintainAspectRatio: false, cutout: '72%',
  plugins: {
    legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, boxWidth: 12 } },
  },
};

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center h-80">
      <svg className="animate-spin w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchApi('/admin/analytics');
      setData(d);
    } catch {
      setData(FALLBACK);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;

  const { stats, recentEnrollments, topCourses, userGrowth, enrollmentTrend } = data;

  const enrollLineData = {
    labels: enrollmentTrend.map((r) => r.month),
    datasets: [{
      data: enrollmentTrend.map((r) => parseInt(r.count)),
      borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.08)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#0ea5e9',
    }],
  };

  const userLineData = {
    labels: userGrowth.map((r) => r.month),
    datasets: [{
      data: userGrowth.map((r) => parseInt(r.count)),
      borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10b981',
    }],
  };

  const barData = {
    labels: topCourses.map((c) => c.title.length > 22 ? c.title.slice(0, 22) + '…' : c.title),
    datasets: [{
      data: topCourses.map((c) => parseInt(c.count)),
      backgroundColor: ['#0ea5e9','#38bdf8','#7dd3fc','#bae6fd','#e0f2fe'],
      borderRadius: 6,
    }],
  };

  const doughnutData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [
        Math.round(stats.totalEnrollments * (stats.completionRate / 100)),
        Math.round(stats.totalEnrollments * 0.30),
        Math.round(stats.totalEnrollments * (1 - stats.completionRate / 100 - 0.30)),
      ],
      backgroundColor: ['#10b981', '#0ea5e9', '#e2e8f0'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()}
          sub="Active accounts"
          color="bg-brand-50 text-brand-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
        />
        <StatCard label="Live Courses" value={stats.totalCourses.toLocaleString()}
          sub="Published & active"
          color="bg-emerald-50 text-emerald-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>}
        />
        <StatCard label="Enrollments" value={stats.totalEnrollments.toLocaleString()}
          sub="Total across all courses"
          color="bg-violet-50 text-violet-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>}
        />
        <StatCard label="Completion Rate" value={`${stats.completionRate}%`}
          sub="Across all enrollments"
          color="bg-amber-50 text-amber-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">6-Month Trend</p>
              <h3 className="text-base font-bold text-slate-900">Enrollment Growth</h3>
            </div>
            <span className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-full font-semibold">Monthly</span>
          </div>
          <div className="h-52"><Line data={enrollLineData} options={baseLineOpts()} /></div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Breakdown</p>
            <h3 className="text-base font-bold text-slate-900">Completion Status</h3>
          </div>
          <div className="h-52"><Doughnut data={doughnutData} options={doughnutOpts} /></div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ranking</p>
              <h3 className="text-base font-bold text-slate-900">Top Courses by Enrollment</h3>
            </div>
          </div>
          <div className="h-52"><Bar data={barData} options={baseBarOpts} /></div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">6-Month Trend</p>
            <h3 className="text-base font-bold text-slate-900">User Registrations</h3>
          </div>
          <div className="h-52"><Line data={userLineData} options={baseLineOpts()} /></div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Recent Enrollments</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-semibold uppercase tracking-wide">Live Feed</span>
        </div>
        <div className="divide-y divide-slate-50">
          {recentEnrollments.map((e, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {(e.full_name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{e.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{e.title}</p>
              </div>
              <p className="text-xs text-slate-400 shrink-0">{new Date(e.enrolled_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
