import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api.js';

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nameForm, setNameForm] = useState({ full_name: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [nameSaving, setNameSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchApi('/profile');
        setProfile(p); setNameForm({ full_name: p.full_name });
      } catch {
        setProfile({ ...user, created_at: new Date().toISOString() });
        setNameForm({ full_name: user.name || '' });
      } finally { setLoading(false); }
    })();
  }, []);

  const handleNameSave = async (e) => {
    e.preventDefault(); setNameMsg({ type: '', text: '' }); setNameSaving(true);
    try {
      const updated = await fetchApi('/profile', 'PATCH', { full_name: nameForm.full_name });
      setProfile((p) => ({ ...p, full_name: updated.full_name }));
      const stored = JSON.parse(localStorage.getItem('ngo_user') || '{}');
      localStorage.setItem('ngo_user', JSON.stringify({ ...stored, name: updated.full_name }));
      setNameMsg({ type: 'success', text: 'Display name updated.' });
    } catch (err) { setNameMsg({ type: 'error', text: err.message }); }
    finally { setNameSaving(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault(); setPwMsg({ type: '', text: '' });
    if (pwForm.new_password !== pwForm.confirm) {
      return setPwMsg({ type: 'error', text: 'Passwords do not match.' });
    }
    setPwSaving(true);
    try {
      await fetchApi('/profile', 'PATCH', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: '', new_password: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
    } catch (err) { setPwMsg({ type: 'error', text: err.message }); }
    finally { setPwSaving(false); }
  };

  const ROLE_BADGE = { NGOAdmin:'bg-brand-50 text-brand-700 border-brand-100', Coordinator:'bg-violet-50 text-violet-700 border-violet-100', FieldStaff:'bg-slate-50 text-slate-600 border-slate-100' };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  const Msg = ({ msg }) => msg.text ? (
    <div className={`p-3 rounded-xl text-sm font-medium border ${
      msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
    }`}>{msg.text}</div>
  ) : null;

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your account and security settings</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-brand-500/30">
          {(profile?.full_name || 'U')[0].toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{profile?.full_name}</h3>
          <p className="text-sm text-slate-400">{profile?.email}</p>
          <span className={`mt-2 inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${ROLE_BADGE[profile?.role] || ROLE_BADGE.FieldStaff}`}>
            {profile?.role}
          </span>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Member Since</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month:'long', year:'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {/* Update name */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h4 className="text-base font-bold text-slate-900 mb-1">Display Name</h4>
        <p className="text-sm text-slate-400 mb-5">Update the name shown across the platform.</p>
        <form onSubmit={handleNameSave} className="space-y-4">
          <Msg msg={nameMsg} />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
            <input type="text" required value={nameForm.full_name}
              onChange={(e) => setNameForm({ full_name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
            <input type="email" disabled value={profile?.email || ''}
              className="w-full px-4 py-3 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
            <p className="text-xs text-slate-400 mt-1">Email address cannot be changed.</p>
          </div>
          <button type="submit" disabled={nameSaving}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-brand-600/20 transition-all flex items-center gap-2">
            {nameSaving ? <><Spinner /> Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h4 className="text-base font-bold text-slate-900 mb-1">Change Password</h4>
        <p className="text-sm text-slate-400 mb-5">Use a strong password of at least 8 characters.</p>
        <form onSubmit={handlePwSave} className="space-y-4">
          <Msg msg={pwMsg} />
          {[
            { key:'current_password', label:'Current Password', ph:'••••••••' },
            { key:'new_password',     label:'New Password',     ph:'Minimum 8 characters' },
            { key:'confirm',          label:'Confirm New Password', ph:'Repeat new password' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
              <input type="password" required minLength={key !== 'current_password' ? 8 : 1}
                value={pwForm[key]} placeholder={ph}
                onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 transition-all" />
            </div>
          ))}
          <button type="submit" disabled={pwSaving}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
            {pwSaving ? <><Spinner /> Updating…</> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Security info */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Account Security</p>
          <p className="text-xs text-slate-400 mt-0.5">Your password is hashed with bcrypt. Sessions expire after 8 hours. All data is transmitted over SSL.</p>
        </div>
      </div>
    </div>
  );
}
