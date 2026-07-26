import React, { useState } from 'react';
import {
  Wifi,
  Home,
  Zap,
  Monitor,
  BookOpen,
  Bus,
  Stethoscope,
  ShieldCheck,
  Utensils,
  Search,
  PhoneCall,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  location: string;
  hours: string;
  helpline: string;
  status: 'Operational' | 'Active' | '24/7 Hotline';
  features: string[];
}

const CAMPUS_SERVICES: ServiceItem[] = [
  {
    id: 'wifi-it',
    title: 'IT & Campus High-Speed WiFi Network',
    category: 'IT & Network Services',
    icon: Wifi,
    description: 'Campus-wide gigabit optical fiber network, captive portal authentication, eduroam WiFi, LMS portal access, and hostel connectivity.',
    location: 'IT Services Block, Room 102',
    hours: '08:00 AM - 10:00 PM',
    helpline: '+1 (555) 019-2831',
    status: 'Operational',
    features: ['High-Speed Bandwidth', 'Captive Portal Reset', 'Hostel LAN Port Fixes', 'Cyber Security Support'],
  },
  {
    id: 'hostel-living',
    title: 'Hostel & Residential Facilities',
    category: 'Hostel Maintenance',
    icon: Home,
    description: 'Maintenance for boys and girls hostels, room furniture repairs, hot water geysers, plumbing leakage, water purifiers, and hygiene inspections.',
    location: 'Central Hostel Office, Block C',
    hours: '24/7 Available',
    helpline: '+1 (555) 019-2832',
    status: '24/7 Hotline',
    features: ['Room Repairs', 'Water Purifiers', 'Geyser Maintenance', 'Furniture Assembly'],
  },
  {
    id: 'electrical-power',
    title: 'Electrical & Power Grid Infrastructure',
    category: 'Electrical',
    icon: Zap,
    description: 'Power backup generators, classroom lighting, ceiling fans, AC HVAC systems, switchboard safety, and corridor illuminations.',
    location: 'Engineering Substation 03',
    hours: '07:00 AM - 11:00 PM',
    helpline: '+1 (555) 019-2833',
    status: 'Operational',
    features: ['AC Cooling Maintenance', 'Lighting Repairs', 'Short Circuit Fixes', 'Generator Backup'],
  },
  {
    id: 'lab-classroom',
    title: 'Academic & Laboratory Equipment Support',
    category: 'Lab Equipment',
    icon: Monitor,
    description: 'Technical maintenance for classroom LCD projectors, audio speakers, podium microphones, computer lab PCs, and research instruments.',
    location: 'Academic Main Building, Ground Floor',
    hours: '08:30 AM - 06:00 PM',
    helpline: '+1 (555) 019-2834',
    status: 'Active',
    features: ['Projector Bulb Replacement', 'Audio Mic Fixes', 'Lab PC Hardware', 'Smartboard Calibration'],
  },
  {
    id: 'library-docs',
    title: 'Central Library & E-Learning Resources',
    category: 'Academic & Library',
    icon: BookOpen,
    description: 'Access to physical book archives, quiet study cubicles, IEEE/Springer digital journal databases, RFID book return kiosks, and printing facilities.',
    location: 'Central Library Block',
    hours: '08:00 AM - 12:00 Midnight',
    helpline: '+1 (555) 019-2835',
    status: 'Operational',
    features: ['Book Reservations', 'Digital Database Access', 'Study Cubicle Booking', 'RFID Return Kiosk'],
  },
  {
    id: 'transport-bus',
    title: 'Campus Shuttle Bus & Fleet Operations',
    category: 'Transport & Fleet',
    icon: Bus,
    description: 'Daily city transport routes, intra-campus electric shuttles, bus passes, schedule tracking, and driver safety compliance.',
    location: 'Transport Terminal, Gate 2',
    hours: '06:00 AM - 09:30 PM',
    helpline: '+1 (555) 019-2836',
    status: 'Active',
    features: ['City Bus Passes', 'Intra-Campus Shuttles', 'Driver Support', 'Route Timetable'],
  },
  {
    id: 'health-medical',
    title: 'Campus Healthcare Center & Emergency Ambulance',
    category: 'Medical Center',
    icon: Stethoscope,
    description: '24/7 emergency medical care, resident doctors, basic diagnostic lab, pharmacy supplies, and immediate campus ambulance dispatch.',
    location: 'Health Center, Gate 1',
    hours: '24/7 Open',
    helpline: '+1 (555) 999-0000',
    status: '24/7 Hotline',
    features: ['24/7 Resident Doctors', 'Free First Aid', 'Ambulance Unit', 'Prescription Pharmacy'],
  },
  {
    id: 'security-safety',
    title: 'Campus Security & Gate Pass Cell',
    category: 'Campus Security',
    icon: ShieldCheck,
    description: '24/7 CCTV surveillance, night patrol escorts, visitor gate pass clearance, biometric entry systems, and lost & found recovery.',
    location: 'Main Security Control, Gate 1',
    hours: '24/7 Open',
    helpline: '+1 (555) 019-2838',
    status: '24/7 Hotline',
    features: ['Night Patrol Escorts', 'Gate Pass Clearance', 'Lost & Found Cell', 'CCTV Verification'],
  },
  {
    id: 'dining-cafeteria',
    title: 'Cafeteria & Dining Hall Hygiene Monitoring',
    category: 'Cafeteria & Mess',
    icon: Utensils,
    description: 'Food quality assurance, daily mess menu compliance, water safety testing, digital meal pass clearance, and kitchen hygiene audits.',
    location: 'Central Student Activity Center',
    hours: '07:00 AM - 10:00 PM',
    helpline: '+1 (555) 019-2839',
    status: 'Active',
    features: ['Food Quality Audits', 'Water Safety Testing', 'Mess Menu Compliance', 'Cleanliness Audits'],
  },
];

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(CAMPUS_SERVICES.map((s) => s.category)))];

  const filteredServices = CAMPUS_SERVICES.filter((service) => {
    if (selectedCategory !== 'all' && service.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        service.title.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5 text-blue-400" /> University Campus Facilities Directory
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">Campus Support & Essential Services</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Explore all official university infrastructure departments, operating schedules, emergency contact helplines, and lodge instant complaint tickets directly to dedicated department desks.
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-xl font-black text-white">9+</span>
              <p className="text-[10px] text-slate-300 font-medium">Core Departments</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-xl font-black text-emerald-400">24/7</span>
              <p className="text-[10px] text-slate-300 font-medium">Emergency Care</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-xl font-black text-blue-300">&lt; 2 hrs</span>
              <p className="text-[10px] text-slate-300 font-medium">Urgent Response Time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-xl font-black text-amber-300">100%</span>
              <p className="text-[10px] text-slate-300 font-medium">Verified Grievance Desk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus service..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group hover:border-blue-500/50"
            >
              <div className="space-y-4">
                {/* Header Badge & Icon */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      service.status === '24/7 Hotline'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                {/* Info Items */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{service.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>{service.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{service.helpline}</span>
                  </div>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {service.features.map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" /> {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: Lodge Complaint for Service */}
              <div className="pt-6">
                <button
                  onClick={() => onNavigate('submit-complaint')}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Report Issue / Lodge Complaint <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
