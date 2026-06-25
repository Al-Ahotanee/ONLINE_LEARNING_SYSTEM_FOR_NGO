import React, { useState, useEffect, useRef } from 'react';

const FEATURES = [
  { title:'Structured Learning Paths', desc:'Role-based curricula for field staff, coordinators, and programme managers — each with a clear progression from onboarding to certification.', color:'from-sky-500 to-blue-600' },
  { title:'Compliance & Certification', desc:'Track mandatory compliance training, auto-issue certificates upon completion, and maintain audit-ready records for donor reporting.', color:'from-violet-500 to-purple-600' },
  { title:'Multi-Region Deployment', desc:'Built for organisations operating across multiple countries. Manage time zones, localise content, and support offline-first field conditions.', color:'from-emerald-500 to-teal-600' },
  { title:'Real-Time Analytics', desc:'Live dashboards: completion rates, skill-gap heatmaps, user growth charts, and exportable reports — powered by Chart.js.', color:'from-amber-500 to-orange-600' },
  { title:'Enterprise Security', desc:'JWT auth, bcrypt hashing, SSL-enforced DB connections, and role-based access control (Admin, Coordinator, Field Staff).', color:'from-rose-500 to-pink-600' },
  { title:'Rapid Course Deployment', desc:'Admins publish, edit, and categorise courses in minutes. Push critical field-safety updates to the entire organisation instantly.', color:'from-cyan-500 to-sky-600' },
];

const STATS = [
  { value:'40,000+', label:'Field Staff Trained' },
  { value:'120+',    label:'NGO Partners' },
  { value:'98%',     label:'Completion Rate' },
  { value:'62',      label:'Countries Reached' },
];

const STEPS = [
  { num:'01', title:'Onboard Your Organisation', desc:'Register, invite your team, and configure role-based access in under 30 minutes. No IT department required.' },
  { num:'02', title:'Publish Your Curriculum',    desc:'Build courses from scratch or upload existing materials. Set categories, estimated hours, and prerequisites.' },
  { num:'03', title:'Track Impact at Scale',      desc:'Monitor progress across every field office in real time. Generate donor-ready compliance reports with one click.' },
];

const TESTIMONIALS = [
  { quote:"We rolled out mandatory PSEA training to 2,300 staff across 14 countries in 48 hours. That simply wasn't possible before.", name:'Amara Diallo', title:'Director of People & Culture, WestAfrica Relief Consortium', ini:'AD', color:'from-sky-500 to-blue-600' },
  { quote:"The compliance reporting alone saves us 3 days per donor cycle. Our programme officers actually enjoy using it.", name:'Dr. Priya Nair', title:'Head of Programmes, South Asia Humanitarian Network', ini:'PN', color:'from-violet-500 to-purple-600' },
  { quote:"Finally an LMS built for humanitarian work — role-based access, real analytics, and audit trails that satisfy donors.", name:'Carlos Mendez', title:'CTO, LatAm Development Foundation', ini:'CM', color:'from-emerald-500 to-teal-600' },
];

const COURSES = [
  { title:'Field Security & Risk Management',  hours:4.5, category:'Safety',     enrolled:1842 },
  { title:'PSEA & Safeguarding Essentials',    hours:3.0, category:'Compliance', enrolled:3210 },
  { title:'Grant Reporting & Compliance',      hours:6.0, category:'Finance',    enrolled:976  },
  { title:'First Aid in Low-Resource Settings',hours:8.0, category:'Health',     enrolled:2105 },
  { title:'Community Engagement & MEAL',       hours:5.5, category:'Programme',  enrolled:714  },
  { title:'Logistics & Supply Chain Basics',   hours:4.0, category:'Operations', enrolled:589  },
];

const CAT_COLORS = {
  Safety:'bg-red-50 text-red-600', Compliance:'bg-violet-50 text-violet-600',
  Finance:'bg-amber-50 text-amber-600', Health:'bg-green-50 text-green-600',
  Programme:'bg-sky-50 text-sky-600', Operations:'bg-orange-50 text-orange-600',
};

function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const timer = useRef(null);
  const go = (i) => setActive((i + FEATURES.length) % FEATURES.length);
  useEffect(() => { timer.current = setInterval(() => go(active + 1), 4200); return () => clearInterval(timer.current); }, [active]);
  const f = FEATURES[active];
  return (
    <div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 min-h-[200px] transition-all duration-500">
        <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} items-center justify-center mb-4`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
      </div>
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {FEATURES.map((feat, i) => (
          <button key={i} onClick={() => { clearInterval(timer.current); go(i); }}
            className={`rounded-full text-xs font-semibold border transition-all px-3 py-1.5 ${
              i === active ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-500 border-slate-200 hover:border-sky-200'
            }`}>
            {feat.title.split(' ').slice(0,2).join(' ')}
          </button>
        ))}
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setActive((a) => (a+1) % TESTIMONIALS.length), 5500); return () => clearInterval(t); }, []);
  const t = TESTIMONIALS[active];
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl px-10 py-12">
        <p className="text-6xl text-sky-200 font-serif leading-none mb-4">"</p>
        <p className="text-lg text-slate-700 leading-relaxed font-medium mb-8">{t.quote}</p>
        <div className="flex items-center justify-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold shrink-0`}>{t.ini}</div>
          <div className="text-left">
            <p className="font-bold text-slate-900 text-sm">{t.name}</p>
            <p className="text-slate-400 text-xs">{t.title}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {TESTIMONIALS.map((_,i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2.5 bg-sky-600' : 'w-2.5 h-2.5 bg-slate-300'}`} />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage({ onEnter }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMenuOpen(false); };
  const NAV = [['features','Features'],['how-it-works','How It Works'],['courses','Courses'],['testimonials','Testimonials']];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-sky-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div><span className="font-bold text-slate-900 text-sm">NGO Training</span><span className="block text-[10px] text-slate-400 uppercase tracking-widest">Platform v2</span></div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map(([id,label]) => <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors">{label}</button>)}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onEnter} className="hidden md:block text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors">Sign In</button>
            <button onClick={onEnter} className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-sky-600/25 transition-all">Get Started Free</button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}/></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-1 shadow-xl">
            {NAV.map(([id,label]) => <button key={id} onClick={() => scrollTo(id)} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors">{label}</button>)}
            <button onClick={onEnter} className="w-full mt-2 bg-sky-600 text-white text-sm font-semibold py-3 rounded-xl">Get Started Free</button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-3xl"/>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"/>
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse-slow"/>
                Trusted by 120+ NGOs Worldwide · v2 Enterprise
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
                Train Your<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Field Staff.</span><br/>Anywhere.
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-lg">Enterprise LMS for humanitarian organisations. Charts, analytics, multi-role access, and compliance tracking — built for the realities of field work.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onEnter} className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-sky-500/30 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                  Start Free Today <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
                <button onClick={() => scrollTo('how-it-works')} className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-sm uppercase tracking-widest hover:bg-white/5">
                  See How It Works
                </button>
              </div>
              <div className="flex items-center gap-5 mt-10 pt-8 border-t border-white/10">
                <div className="flex -space-x-3">
                  {['AD','PN','CM','JO','SK'].map((ini,i) => (
                    <div key={i} className={`w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br ${['from-sky-500 to-blue-600','from-violet-500 to-purple-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600','from-pink-500 to-rose-600'][i]}`}>{ini}</div>
                  ))}
                </div>
                <p className="text-sm text-slate-400"><span className="text-white font-semibold">40,000+</span> staff trained last month</p>
              </div>
            </div>
            {/* Hero dashboard preview */}
            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full bg-green-400"/>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['284','Users','brand'],['12','Courses','emerald'],['68%','Complete','violet']].map(([v,l,c]) => (
                    <div key={l} className="bg-white/8 rounded-xl p-3 text-center border border-white/10">
                      <p className={`text-xl font-extrabold text-${c}-400`}>{v}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Enrollment Trend</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40,55,48,72,65,88,95].map((h,i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-sky-600 to-sky-400 rounded-sm opacity-80" style={{height:`${h}%`}}/>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul'].map((m) => <span key={m}>{m}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent"/>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-sky-600 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({value,label}) => (
            <div key={label} className="text-center">
              <p className="text-3xl lg:text-4xl font-extrabold text-white">{value}</p>
              <p className="text-sky-200 text-sm font-medium mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sky-600 text-sm font-bold uppercase tracking-widest mb-4">Platform Features</p>
            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight mb-6">Everything your team needs.<br/>Nothing they don't.</h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">Designed with field practitioners and programme directors. Full training lifecycle with Chart.js analytics, role-based dashboards, and compliance tracking.</p>
            <button onClick={onEnter} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md shadow-sky-600/20 transition-all text-sm">Explore All Features →</button>
          </div>
          <FeatureCarousel />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sky-600 text-sm font-bold uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-4xl font-extrabold text-slate-900">Up and running in three steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({num,title,desc}) => (
              <div key={num} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-100 flex items-center justify-center mb-6 group-hover:border-sky-400 group-hover:shadow-lg transition-all">
                  <span className="text-2xl font-extrabold text-sky-600">{num}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-sky-600 text-sm font-bold uppercase tracking-widest mb-4">Course Catalog</p>
              <h2 className="text-4xl font-extrabold text-slate-900">Ready-made humanitarian curricula</h2>
            </div>
            <button onClick={onEnter} className="shrink-0 text-sky-600 border border-sky-200 hover:border-sky-400 hover:bg-sky-50 font-semibold text-sm px-6 py-3 rounded-xl transition-all">Browse Full Catalog →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSES.map(({title,hours,category,enrolled}) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-lg p-6 flex flex-col transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${CAT_COLORS[category]}`}>{category}</span>
                  <span className="text-xs text-slate-400">{hours}h</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-3 flex-1 group-hover:text-sky-700 transition-colors leading-snug">{title}</h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-xs text-slate-400">{enrolled.toLocaleString()} enrolled</span>
                  <button onClick={onEnter} className="text-xs font-semibold text-sky-600 hover:text-sky-700">Enroll →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sky-600 text-sm font-bold uppercase tracking-widest mb-4">Testimonials</p>
            <h2 className="text-4xl font-extrabold text-slate-900">Trusted by practitioners in the field</h2>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"/>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to transform how your<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">organisation learns?</span>
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">Join 120+ NGOs already using our platform. Free to start, scales with your mission.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onEnter} className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl shadow-sky-500/30 text-sm uppercase tracking-widest transition-all">Get Started — It's Free</button>
            <button onClick={() => scrollTo('features')} className="border border-white/20 hover:border-white/40 text-white font-semibold px-10 py-4 rounded-2xl text-sm uppercase tracking-widest transition-all hover:bg-white/5">Learn More</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <span className="font-bold text-white text-sm">NGO Training Platform</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">Built for humanitarian organisations that refuse to compromise on staff capability.</p>
            </div>
            {[
              { heading:'Platform', links:['Features','Course Catalog','Analytics','Security'] },
              { heading:'Organisation', links:['About Us','Partners','Careers','Contact'] },
              { heading:'Resources', links:['Documentation','Case Studies','Help Centre','Privacy Policy'] },
            ].map(({heading,links}) => (
              <div key={heading}>
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">{heading}</h4>
                <ul className="space-y-2.5">{links.map((l) => <li key={l}><button className="text-sm text-slate-500 hover:text-sky-400 transition-colors">{l}</button></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} NGO Training Platform v2. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"/>All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
