import React from 'react';
import { GraduationCap, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs py-8 px-4 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">University CCMS</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            AI-Powered Campus Complaint Management System. Empowering students, faculty, and university administration with transparent grievance redressal.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-slate-400">
            <li><a href="#categories" className="hover:text-white transition-colors">Complaint Categories</a></li>
            <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#safety" className="hover:text-white transition-colors">Campus Safety & Emergency</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Campus Grievance Cell</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400" /> Administrative Building, Room 204</li>
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /> Helpline: +1 (555) 888-CCMS</li>
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /> support@university.edu</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">System Security & AI</h4>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] space-y-1">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 256-bit Encrypted Portal
            </span>
            <p className="text-slate-400 text-[10px]">
              Supports Anonymous reporting, Gemini AI auto-classification, and digital QR tracking passes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <p>© 2026 University Campus Grievance Redressal Cell. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-300 cursor-pointer">Accessibility</span>
        </div>
      </div>
    </footer>
  );
};
