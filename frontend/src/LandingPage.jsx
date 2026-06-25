import React, { useState, useEffect, useRef } from 'react';

// ── Carousel data ────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Structured Learning Paths',
    desc: 'Role-based curricula designed for field staff, coordinators, and programme managers — each with a clear progression from onboarding to certification.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Compliance & Certification',
    desc: 'Track mandatory compliance training, auto-issue certificates upon completion, and maintain audit-ready records for donor reporting.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Multi-Region Deployment',
    desc: 'Built for organisations operating across multiple countries. Localise content, manage time zones, and support offline-first field conditions.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real-Time Analytics',
    desc: 'Live dashboards for programme directors: completion rates, time-on-task, skill-gap heatmaps, and exportable reports for donor submissions.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Enterprise Security',
    desc: 'JWT authentication, bcrypt password hashing, SSL-enforced database connections, and role-based access control keep your data protected.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Rapid Course Deployment',
    desc: 'Admins can author, publish, and update courses in minutes — no technical skill required. Push critical field-safety updates organisation-wide instantly.',
  },
];

const STATS = [
  { value: '40,000+', label: 'Field Staff Trained' },
  { value: '120+', label: 'NGO Partners' },
  { value: '98%', label: 'Completion Rate' },
  { value: '62', label: 'Countries Reached' },
];

const STEPS = [
  {
    num: '01',
    title: 'Onboard Your Organisation',
    desc: 'Register your NGO, invite your team, and configure role-based access in under 30 minutes. No IT department required.',
  },
  {
    num: '02',
    title: 'Publish Your Curriculum',
    desc: 'Upload existing training materials or build courses from scratch using our guided editor. Set prerequisites, estimated hours, and certification thresholds.',
  },
  {
    num: '03',
    title: 'Track Impact at Scale',
    desc: 'Monitor progress across every field office in real time. Generate donor-ready compliance reports with a single click.',
  },
];

const TESTIMONIALS = [
  {
    quote: "We rolled out mandatory PSEA training to 2,300 staff across 14 countries in 48 hours. That simply wasn't possible before.",
    name: 'Amara Diallo',
    title: 'Director of People & Culture, WestAfrica Relief Consortium',
    initials: 'AD',
    color: 'from-sky-500 to-blue-600',
  },
  {
    quote: "The compliance reporting alone saves us 3 days per donor cycle. Our programme officers actually enjoy using it.",
    name: 'Dr. Priya Nair',
    title: 'Head of Programmes, South Asia Humanitarian Network',
    initials: 'PN',
    color: 'from-violet-500 to-purple-600',
  },
  {
    quote: "Finally an LMS built for the realities of humanitarian work — offline support, multilingual content, and donor-grade audit trails.",
    name: 'Carlos Mendez',
    title: 'CTO, LatAm Development Foundation',
    initials: 'CM',
    color: 'from-emerald-500 to-teal-600',
  },
];

const COURSES = [
  { title: 'Field Security & Risk Management', hours: 4.5, category: 'Safety', enrolled: 1842 },
  { title: 'PSEA & Safeguarding Essentials', hours: 3.0, category: 'Compliance', enrolled: 3210 },
  { title: 'Grant Reporting & Donor Compliance', hours: 6.0, category: 'Finance', enrolled: 976 },
  { title: 'First Aid in Low-Resource Settings', hours: 8.0, category: 'Health', enrolled: 2105 },
  { title: 'Community Engagement & MEAL', hours: 5.5, category: 'Programme', enrolled: 714 },
  { title: 'Logistics & Supply Chain Basics', hours: 4.0, category: 'Operations', enrolled: 589 },
];

const CATEGORY_COLORS = {
  Safety:     'bg-red-50 text-red-600 border-red-100',
  Compliance: 'bg-violet-50 text-violet-600 border-violet-100',
  Finance:    'bg-amber-50 text-amber-600 border-amber-100',
  Health:     'bg-green-50 text-green-600 border-green-100',
  Programme:  'bg-sky-50 text-sky-600 border-sky-100',
  Operations: 'bg-orange-50 text-orange-600 border-orange-100',
};

// ── Carousel ────────────────────────────────────────────────
function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const go = (idx) => {
    setActive((idx + FEATURES.length) % FEATURES.length);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => go(active + 1), 4500);
    return () => clearInterval(timerRef.current);
  }, [active]);

  const f = FEATURES[active];

  return (
    <div className="relative">
      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 min-h-[280px] flex flex-col justify-between transition-all duration-500">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-sky-50 rounded-2xl text-sky-600 shrink-0">{f.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
            <p className="text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-8">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(timerRef.current); go(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === active ? 'w-6 h-2.5 bg-sky-600' : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={() => { clearInterval(timerRef.current); go(active - 1); }}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => { clearInterval(timerRef.current); go(active + 1); }}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Side preview pills */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {FEATURES.map((feat, i) => (
          <button
            key={i}
            onClick={() => { clearInterval(timerRef.current); go(i); }}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              i === active
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                : 'bg-white text-slate-500 border-slate-200 hover:border-sky-200'
            }`}
          >
            {feat.title.split(' ').slice
