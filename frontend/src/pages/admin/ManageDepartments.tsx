import React, { useEffect, useState } from 'react';
import { Department, Category } from '../../types';
import { Building2, Plus, Wrench, Shield, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const ManageDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchDepts = () => {
    apiFetch('/api/departments')
      .then((res) => res.json())
      .then((d) => setDepartments(d.departments || []));
    apiFetch('/api/categories')
      .then((res) => res.json())
      .then((c) => setCategories(c.categories || []));
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Departments & Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure campus maintenance wings, head contacts & SLA response targets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Departments List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Active University Departments
          </h3>
          <div className="space-y-3">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</span>
                  <span className="font-mono text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                    {dept.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{dept.description}</p>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                  <span>Head: {dept.headName}</span>
                  <span>Staff: {dept.staffCount} · Active: {dept.activeComplaintsCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Grievance Categories & SLA Priority Mapping
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">{cat.description}</span>
                </div>
                <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">
                  {cat.departmentName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};