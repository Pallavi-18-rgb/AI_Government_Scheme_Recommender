import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const ApplicationTracker = () => {
  const { t } = useLanguage();
  const { activePreset } = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
        if (res.data.length > 0) setSelectedApp(res.data[0]);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {status}</span>;
      case 'Under Verification':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3.5 h-3.5 mr-1 animate-spin" /> {status}</span>;
      case 'Disbursed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> {status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300"><FileText className="w-3.5 h-3.5 mr-1" /> {status}</span>;
    }
  };

  const getTimelineSteps = (currentStatus) => {
    const steps = [
      { key: 'Submitted', label: 'Application Submitted', desc: 'Received online portal submission' },
      { key: 'Under Verification', label: 'Nodal Officer Verification', desc: 'Aadhaar & income eligibility check' },
      { key: 'Approved', label: 'Department Sanction', desc: 'Application approved for benefit grant' },
      { key: 'Disbursed', label: 'DBT Benefit Transfer', desc: 'Direct Benefit Transfer dispatched to Bank' }
    ];

    const statusOrder = ['Submitted', 'Under Verification', 'Approved', 'Disbursed'];
    const currentIndex = statusOrder.indexOf(currentStatus) >= 0 ? statusOrder.indexOf(currentStatus) : 0;

    return steps.map((step, idx) => ({
      ...step,
      isCompleted: idx <= currentIndex,
      isCurrent: idx === currentIndex
    }));
  };

  const filteredApps = applications.filter(app => 
    app.scheme_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.application_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-500" style={{ background: 'var(--header-bg)' }}>
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-sky-200">Track Portal</span>
          <h1 className="text-3xl font-black mt-1">{t('applications')}</h1>
          <p className="text-sm text-slate-200 mt-1">Real-time status tracking for your submitted government welfare applications.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Application No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-slate-300 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading applications...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Your Submitted Applications ({filteredApps.length})</h2>
            {filteredApps.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
                No matching applications found.
              </div>
            ) : (
              filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 ${
                    selectedApp?.id === app.id
                      ? `bg-white border-2 border-blue-500 shadow-md transform scale-[1.02]`
                      : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{app.category}</span>
                    {getStatusBadge(app.status)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{app.scheme_name}</h3>
                  <p className="text-xs text-slate-500 mt-1">App No: <span className="font-mono text-slate-700 font-semibold">{app.application_no}</span></p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>Applied: {app.applied_date}</span>
                    <span className="font-bold text-emerald-600">{app.benefit_amount}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detailed Application View & Timeline */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">{selectedApp.category} Scheme</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">{selectedApp.scheme_name}</h2>
                    <p className="text-xs text-slate-500 mt-1">Application ID: <span className="font-mono font-bold text-slate-800">{selectedApp.application_no}</span></p>
                  </div>
                  {getStatusBadge(selectedApp.status)}
                </div>

                {/* Progress Timeline */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-6">Application Progress Lifecycle</h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
                    {getTimelineSteps(selectedApp.status).map((step, index) => (
                      <div key={index} className="relative group">
                        <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                          step.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}>
                          {step.isCompleted ? '✓' : index + 1}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${step.isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Sanctioned Benefit</span>
                    <p className="text-lg font-extrabold text-emerald-600 mt-1">{selectedApp.benefit_amount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Submission Date</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">{selectedApp.applied_date}</p>
                  </div>
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-sky-50 border border-sky-100">
                    <span className="text-xs text-sky-600 font-bold uppercase tracking-wider">Next Steps</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{selectedApp.next_step}</p>
                  </div>
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">Department Remarks</span>
                    <p className="text-sm text-slate-700 mt-1">{selectedApp.remarks}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
                Select an application from the left panel to view full progress.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;
