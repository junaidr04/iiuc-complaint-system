import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  QrCode,
  FileCheck,
  Star,
  ChevronRight,
  HelpCircle,
  PhoneCall,
  Zap,
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const categories = [
    { title: 'Classroom & Labs', desc: 'Projectors, PC hardware, software licensing, audio systems', count: '12 Solved' },
    { title: 'Internet & WiFi', desc: 'Eduroam access, captive portal errors, speed bottlenecks', count: '48 Solved' },
    { title: 'Electrical & Power', desc: 'Short circuits, light fixtures, ceiling fans, AC chillers', count: '35 Solved' },
    { title: 'Water & Plumbing', desc: 'Purifiers, washrooms, overhead tank leaks, drainage', count: '29 Solved' },
    { title: 'Hostel & Mess', desc: 'Furniture, room allotment, pest control, food quality', count: '54 Solved' },
    { title: 'Campus Security', desc: 'CCTV requests, emergency alerts, harassment prevention', count: '18 Solved' },
  ];

  const steps = [
    { num: '01', title: 'Submit Complaint', desc: 'Fill out problem details, upload photos, or select anonymous submission.' },
    { num: '02', title: 'AI Diagnostics', desc: 'Gemini AI automatically predicts category, detects priority level, and flags duplicate cases.' },
    { num: '03', title: 'Staff Dispatch', desc: 'Department technicians receive instant dispatch notifications to inspect on site.' },
    { num: '04', title: 'Track & Rate', desc: 'Track progress via interactive timeline, download QR receipt, and rate service quality.' },
  ];

  const faqs = [
    { q: 'Can I submit complaints anonymously?', a: 'Yes! The CCMS system allows students to toggle "Anonymous Option" so personal details are concealed while still enabling tracking.' },
    { q: 'How does AI priority detection work?', a: 'Our Gemini AI engine analyzes keywords, urgency indicators, and emergency checkmarks to categorize complaints as Low, Medium, High, or Critical.' },
    { q: 'How do I track my complaint status?', a: 'Every submission generates a unique tracking ID and QR code receipt. Scan or search your ID anytime on the portal.' },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 md:p-14 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered University Grievance Platform</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Digital Grievance Redressal with <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">Instant AI Precision</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Report campus issues, track resolution timelines in real-time, generate QR tracking passes, and receive official staff verification notes across all departments.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('submit-complaint')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-102"
            >
              Report a Complaint <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all"
            >
              View Live Dashboard
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 relative z-10 text-xs">
          <div>
            <span className="text-2xl font-black text-emerald-400 block">98.4%</span>
            <span className="text-slate-400">Resolution Rate</span>
          </div>
          <div>
            <span className="text-2xl font-black text-blue-300 block">&lt; 24 Hrs</span>
            <span className="text-slate-400">Avg Resolution Time</span>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-300 block">AI-Driven</span>
            <span className="text-slate-400">Priority Classifier</span>
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-300 block">7 Departments</span>
            <span className="text-slate-400">Central Integration</span>
          </div>
        </div>
      </section>

      {/* How It Works Bento Grid */}
      <section id="how-it-works" className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Workflow Pipeline</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">How CCMS Functions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Transparent 4-step workflow from submission to staff verification</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.num} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs relative space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-blue-600 dark:text-blue-400 block mb-2">{step.num}</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{step.desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase font-bold">
                Automated Stage
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complaint Categories Bento Grid */}
      <section id="categories" className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Department Directory</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Campus Categories</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive coverage across all university infrastructure</p>
          </div>
          <button
            onClick={() => onNavigate('submit-complaint')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Submit New Ticket <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => onNavigate('submit-complaint')}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-500/50 transition-all cursor-pointer group space-y-3 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.title}
                  </span>
                  <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-bold">
                    {cat.count}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Select Category</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Safety Emergency Alert Banner */}
      <section id="safety" className="p-6 bg-rose-950/20 border border-rose-300 dark:border-rose-900 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 animate-bounce">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">Campus Emergency Control Center</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              For immediate threats, electrical sparks, fire hazards, or medical emergencies, trigger an Emergency Ticket or contact Campus Dispatch.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('submit-complaint')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Trigger Emergency Ticket
          </button>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Everything you need to know about CCMS</p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
