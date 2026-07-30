import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AISmartAssistant } from '../../components/ai/AISmartAssistant';
import { Department, Category, AIAnalysisResult } from '../../types';
import {
  PlusCircle,
  Building2,
  MapPin,
  Image as ImageIcon,
  ShieldAlert,
  Send,
  UserX,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface SubmitComplaintProps {
  onNavigate: (page: string) => void;
  onComplaintSubmitted: () => void;
}

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({ onNavigate, onComplaintSubmitted }) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [building, setBuilding] = useState('Science Complex - Block B');
  const [roomNumber, setRoomNumber] = useState('Room 304');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/api/departments')
      .then((res) => res.json())
      .then((d) => {
        setDepartments(d.departments || []);
        if (d.departments && d.departments.length > 0) {
          setDepartmentId(d.departments[0].id);
        }
      });

    apiFetch('/api/categories')
      .then((res) => res.json())
      .then((c) => {
        setCategories(c.categories || []);
        if (c.categories && c.categories.length > 0) {
          setCategory(c.categories[0].name);
        }
      });
  }, []);

  // Filtered categories based on selected department
  const filteredCategories = categories.filter((c) => !departmentId || c.departmentId === departmentId);

  // Auto-trigger AI Analysis when title/description length exceeds threshold
  const handleAnalyzeWithAI = async () => {
    if (!title.trim() && !description.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await apiFetch('/api/ai/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          building,
          roomNumber,
          isEmergency,
          category,
          departmentId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 3) {
      alert('You can attach a maximum of 3 images.');
      e.target.value = '';
      return;
    }

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" is larger than 5MB. Please choose a smaller image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ''; // allow re-selecting the same file later
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          departmentId,
          category,
          priority,
          building,
          roomNumber,
          location,
          contactNumber,
          imageUrls,
          isAnonymous,
          isEmergency,
          studentId: user.id,
          studentName: user.name,
          studentEmail: user.email,
          studentDepartment: user.department,
          aiAnalysis,
        }),
      });

      if (res.ok) {
        onComplaintSubmitted();
        onNavigate('my-complaints');
      } else {
        alert('Failed to submit complaint.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-blue-600" /> Log Campus Complaint
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit problem details with AI assistance & duplicate checking
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Real-time AI Assistant Component */}
        <AISmartAssistant
          analysis={aiAnalysis}
          isLoading={isAiLoading}
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
          {/* Emergency Checkbox Banner */}
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              Critical Campus Hazard / Emergency?
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleAnalyzeWithAI}
              placeholder="e.g., WiFi access point completely down in Science Block 3rd Floor"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          {/* Department & Category Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Target Department <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
              >
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Priority Level (set manually, or via "Apply Priority" from AI Diagnostics) */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium capitalize"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical Emergency</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Detailed Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleAnalyzeWithAI}
              placeholder="Describe what happened, error codes, specific equipment numbers, or safety concerns..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium leading-relaxed"
            />
          </div>

          {/* Building, Room, Specific Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Building / Complex</label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Men Residence Hall 4"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Room / Lab Number</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 304 or Washroom A"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Specific Landmark / Wing</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. East Wing near server rack 3"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Phone & Anonymous Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Contact Phone (Optional)</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Submit Anonymously</span>
                  <span className="text-[10px] text-slate-400">Conceals your name on public staff view</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Image Upload from Device */}
          <div className="space-y-2 pt-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Attach Proof / Photo (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUrls.length >= 3}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              {imageUrls.length > 0 ? 'Add Another Photo' : 'Choose Photo from Gallery'}
            </button>
            <p className="text-[11px] text-slate-400">Up to 3 photos, max 5MB each.</p>

            {imageUrls.length > 0 && (
              <div className="flex gap-2 pt-2 overflow-x-auto">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Upload ${i}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('my-complaints')}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold text-xs hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Registering Ticket...' : 'Submit Complaint Ticket'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};