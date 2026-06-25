import React, { useState, useRef, useEffect } from 'react';
import AdminOverview from './pages/AdminOverview.jsx';
import AdminCourses from './pages/AdminCourses.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import LearnerHome from './pages/LearnerHome.jsx';
import CourseCatalog from './pages/CourseCatalog.jsx';
import Profile from './pages/Profile.jsx';

// ── Icons ────────────────────────────────────────────────────
const IC = {
  grid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  book: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  catalog: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
  user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  globe: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  logout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  menu: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  close: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  chevron: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>,
};

// ── Nav config ───────────────────────────────────────────────
const ADMIN_NAV = [
  { id: 'overview',  label: 'Overview',   icon: IC.grid,    component: AdminOverview },
  { id: 'courses',   label: 'Courses',    icon: IC.book,    component: AdminCourses },
  { id: 'users',     label: 'Users',      icon: IC.users,   component: AdminUsers },
  { id: 'profile',   label: 'Profile',    icon: IC.user,    component: Profile },
];

const LEARNER_NAV = [
  { id: 'home',      label: 'My Learning',icon: IC.grid,    component: LearnerHome },
  { id: 'catalog',   label: 'Catalog',    icon: IC.catalog, component: CourseCatalog },
  { id: 'profile',   label: 'Profile',    icon: IC.user,    component: Profile },
];

// ── Notification Dropdown ────────────────────────────────────
function NotifDropdown({ onClose }) {
  const NOTIFS = [
    { id: 1, text: 'New course "PSEA Essentials" published', time: '5m ago', dot: 'bg-brand-500' },
    { id: 2, text: 'User registration: maria@relief.org',    time: '1h ago', dot: 'bg-emerald-500' },
    { id: 3, text: 'System health check passed',            time: '3h ago', dot: 'bg-green-500' },
    { id: 4, text: 'Monthly report ready for export',       time: '1d ago', dot: 'bg-amber-500' },
  ];
  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-bold text-slate-900">Notifications</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">{IC.close}</button>
      </div>
      <div className="divide-y divide-slate-50">
        {NOTIFS.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
            <div>
              <p className="text-sm text-slate-700 font-medium leading-snug">{n.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-center">
        <button className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all notifications</button>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────
function Sidebar({ nav, active, onNav, onLogout, user, collapsed, onCollapse }) {
  return (
    <aside className={`bg-slate-900 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Brand */}
      <div className={`h-16 flex items-center shrink-0 border-b border-slate-800 ${collapsed ? 'justify-center px-0' : 'px-5 gap-3'}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <span className="text-white scale-75">{IC.globe}</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-tight">NGO Portal</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">v2.0 Enterprise</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button onClick={onCollapse}
        className="mx-auto mt-3 w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0">
        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-3">
        {!collapsed && <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Navigation</p>}
        {nav.map((item) => (
          <button key={item.id} onClick={() => onNav(item.id)} title={collapsed ? item.label : ''}
            className={`w-full flex items-center gap-3 rounded-xl transition-all duration-150 group ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'} ${
              active === item.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}>
            <span className={`shrink-0 ${active === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.icon}</span>
            {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
            {!collapsed && active === item.id && (
              <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`border-t border-slate-800 p-3 shrink-0 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs">
              {(user.name || 'U')[0].toUpperCase()}
            </div>
            <button onClick={onLogout} title="Sign Out"
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-900/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all">
              {IC.logout}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(user.name || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all text-sm font-semibold">
              {IC.logout}<span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

// ── Header ───────────────────────────────────────────────────
function TopBar({ activeLabel, user, onMobileMenu }) {
  const [notif, setNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotif(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenu} className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100">{IC.menu}</button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">NGO Training Platform</p>
          <h1 className="text-base font-bold text-slate-900 leading-tight">{activeLabel}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" />
          System Operational
        </div>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotif((p) => !p)}
            className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all">
            {IC.bell}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white" />
          </button>
          {notif && <NotifDropdown onClose={() => setNotif(false)} />}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow">
          {(user.name || 'U')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}

// ── Footer ───────────────────────────────────────────────────
function DashFooter() {
  return (
    <footer className="h-10 bg-white border-t border-slate-100 flex items-center justify-between px-6 shrink-0">
      <p className="text-xs text-slate-400">© {new Date().getFullYear()} NGO Training Platform v2.0</p>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span>Privacy</span><span>·</span><span>Support</span><span>·</span><span>Docs</span>
      </div>
    </footer>
  );
}

// ── Dashboard Shell ──────────────────────────────────────────
export default function Dashboard({ user, onLogout }) {
  const isAdmin = user.role === 'NGOAdmin';
  const nav = isAdmin ? ADMIN_NAV : LEARNER_NAV;
  const [active, setActive] = useState(nav[0].id);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ActivePage = nav.find((n) => n.id === active)?.component || nav[0].component;
  const activeLabel = nav.find((n) => n.id === active)?.label || '';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar nav={nav} active={active} onNav={setActive} onLogout={onLogout}
          user={user} collapsed={collapsed} onCollapse={() => setCollapsed((p) => !p)} />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-60">
            <Sidebar nav={nav} active={active}
              onNav={(id) => { setActive(id); setMobileOpen(false); }}
              onLogout={onLogout} user={user} collapsed={false} onCollapse={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar activeLabel={activeLabel} user={user} onMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in" key={active}>
            <ActivePage user={user} />
          </div>
        </main>
        <DashFooter />
      </div>
    </div>
  );
}
