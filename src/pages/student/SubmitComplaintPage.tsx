import React, { useState } from 'react';

export default function SubmitComplaintPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Complaint Submitted:', formData);
    alert('Complaint submission mock successful!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Submit a New Complaint</h1>
        <p className="text-gray-400 text-sm mt-1">Please fill in the details below to log your problem.</p>
      </div>

      {/* Form Container - Fixed Dark Theme */}
      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5 shadow-lg">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject / Title</label>
          <input
            type="text"
            required
            placeholder="Briefly state the problem..."
            className="w-full bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
          <select
            className="w-full bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Academic">Academic</option>
            <option value="Hostel">Hostel & Accommodation</option>
            <option value="Canteen">Canteen & Food</option>
            <option value="Infrastructure">Infrastructure & Facilities</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Detailed Description</label>
          <textarea
            required
            rows={5}
            placeholder="Describe your complaint in detail so the authorities can understand..."
            className="w-full bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-sm resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-md"
          >
            Submit Complaint
          </button>
        </div>
      </form>
    </div>
  );
}