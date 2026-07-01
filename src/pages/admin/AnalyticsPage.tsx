import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time charts and system data overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex flex-col justify-between h-64">
          <h3 className="text-sm font-semibold text-gray-300">Complaints by Category</h3>
          <div className="flex items-end justify-between h-36 px-4 pt-4 border-b border-l border-gray-700">
            <div className="w-12 bg-indigo-500 h-[60%] rounded-t-md relative group"><span className="absolute -top-6 left-2 text-xs text-white">60%</span></div>
            <div className="w-12 bg-purple-500 h-[40%] rounded-t-md relative group"><span className="absolute -top-6 left-2 text-xs text-white">40%</span></div>
            <div className="w-12 bg-amber-500 h-[25%] rounded-t-md relative group"><span className="absolute -top-6 left-2 text-xs text-white">25%</span></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 pt-1">
            <span>Academic</span><span>Facilities</span><span>Hostel</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex flex-col justify-between h-64">
          <h3 className="text-sm font-semibold text-gray-300">Resolution Efficiency</h3>
          <div className="flex items-center justify-center h-full">
            <div className="w-28 h-28 rounded-full border-8 border-indigo-600 border-r-gray-700 flex items-center justify-center animate-spin-slow">
              <span className="text-xl font-bold text-white rotate-0">75%</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">75% of total complaints resolved within 48 hours</p>
        </div>
      </div>
    </div>
  );
}