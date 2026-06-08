"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Activity, 
  User, 
  TrendingUp, 
  Plus, 
  Check, 
  Calendar, 
  Clipboard, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function HealthDataAndForms() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'form_profile' | 'form_bp' | 'form_hr' | 'form_ha'>('form_profile');
  
  // Data State
  const [profileData, setProfileData] = useState<any>(null);
  const [bpList, setBpList] = useState<any[]>([]);
  const [hrList, setHrList] = useState<any[]>([]);
  const [haList, setHaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Inputs
  // 1. Profile fields
  const [profileForm, setProfileForm] = useState({
    first_name: '', middle_name: '', last_name: '', phone_number: '',
    date_of_birth: '', sex: 'male', work_type: 'private', education: 'undergraduate',
    diabetes: false, heart_disease: false, history_cvd: false, kidney_disease: false,
    prevalent_stroke: false, prevalent_hypertension: false, bp_history: 'normal',
    family_history_htn: false, family_history_cvd: false, smoking: 'never',
    cigs_per_day: 0, alcohol_use: 'none', physical_activity_level: 'moderate',
    exercise_frequency: '3-4 times/week', diet_quality: 'healthy', salt_intake: 2.5,
    stress_score: 3, sleep_duration: 8, sleep_quality: 'good'
  });

  // 2. BP fields
  const [bpForm, setBpForm] = useState({
    systolic_value: 120,
    diastolic_value: 80,
    body_posture: 'sitting',
    measurement_location: 'left wrist',
    descriptive_statistic: 'average',
    temporal_relationship_to_physical_activity: 'before exercise',
    temporal_relationship_to_sleep: 'before sleep',
    start_date_time: new Date().toISOString().substring(0, 16)
  });

  // 3. HR fields
  const [hrForm, setHrForm] = useState({
    value: 72,
    body_posture: 'sitting',
    measurement_location: 'left wrist',
    descriptive_statistic: 'average',
    temporal_relationship_to_physical_activity: 'before exercise',
    temporal_relationship_to_sleep: 'before sleep',
    start_date_time: new Date().toISOString().substring(0, 16)
  });

  // 4. HA fields
  const [haForm, setHaForm] = useState({
    weight: 74,
    height: 1.78,
    glucose: 95,
    avg_glucose_level: 95,
    total_cholesterol: 195,
    hdl_cholesterol: 50,
    on_bp_medication: false,
    bp_medication_type: 'none',
    smoking_status: 'never',
    cigs_per_day: 0,
    alcohol_use: 'none',
    physical_activity_level: 'moderate',
    assessment_notes: 'Standard checkup'
  });

  // Fetch from APIs on load
  const loadData = async () => {
    try {
      setLoading(true);
      // Mock API calls - replace with actual endpoints when ready
      // const [resProfile, resBp, resHr, resHa] = await Promise.all([
      //   fetch('/api/profile').then(r => r.json()),
      //   fetch('/api/bp').then(r => r.json()),
      //   fetch('/api/hr').then(r => r.json()),
      //   fetch('/api/health_assessment').then(r => r.json())
      // ]);

      // Mock data for development
      const mockProfile = { first_name: 'Mary', last_name: 'Wanjiku', phone_number: '0712345678', date_of_birth: '1973-05-15', sex: 'female' };
      const mockBp: any[] = [];
      const mockHr: any[] = [];
      const mockHa: any[] = [];

      if (mockProfile) {
        setProfileData(mockProfile);
        setProfileForm({
          ...profileForm,
          ...mockProfile,
          date_of_birth: mockProfile.date_of_birth || ''
        });
      }
      if (mockBp) setBpList(mockBp);
      if (mockHr) setHrList(mockHr);
      if (mockHa) setHaList(mockHa);

      setLoading(false);
    } catch (err) {
      console.error("Error loading clinical data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerAlertMessage = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMessage(text);
      setTimeout(() => setSuccessMessage(''), 4500);
    } else {
      setErrorMessage(text);
      setTimeout(() => setErrorMessage(''), 4500);
    }
  };

  // Submit operations
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      triggerAlertMessage('success', 'User profile parameters synced successfully (Form 1 of 4)');
    } catch (err) {
      triggerAlertMessage('error', 'Failed to update profile form values.');
    }
  };

  const handleBpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBp = { ...bpForm, id: Date.now() };
      setBpList(prev => [newBp, ...prev]);
      triggerAlertMessage('success', 'Blood Pressure log recorded successfully (Form 2 of 4)');
    } catch (err) {
      triggerAlertMessage('error', 'Failed to log Blood Pressure values.');
    }
  };

  const handleHrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newHr = { ...hrForm, id: Date.now() };
      setHrList(prev => [newHr, ...prev]);
      triggerAlertMessage('success', 'Resting Heart Rate log recorded successfully (Form 3 of 4)');
    } catch (err) {
      triggerAlertMessage('error', 'Failed to log heart rate values.');
    }
  };

  const handleHaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newHa = { ...haForm, id: Date.now() };
      setHaList(prev => [newHa, ...prev]);
      triggerAlertMessage('success', 'Clinical Health Assessment record filed successfully (Form 4 of 4)');
    } catch (err) {
      triggerAlertMessage('error', 'Failed to file clinical health assessment.');
    }
  };

  // Navigate to full assessment form
  const handleNewFullAssessment = () => {
    router.push('/patient/health-measurement');
  };

  // SVG Blood Pressure Plot generator
  const renderBloodPressureGraph = () => {
    if (bpList.length === 0) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-zinc-500 py-10">
          <Activity className="h-10 w-10 text-rose-500/50 mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-zinc-400">No Blood Pressure Readings</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm text-center">Add a blood pressure measurement using Form 2 to generate an active telemetry graph.</p>
        </div>
      );
    }

    const sortedBp = [...bpList].sort((a, b) => new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime());
    
    const svgWidth = 800;
    const svgHeight = 280;
    const paddingLeft = 50;
    const paddingRight = 40;
    const paddingTop = 30;
    const paddingBottom = 40;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const minVal = 30;
    const maxVal = 180;
    const valRange = maxVal - minVal;

    const getX = (idx: number) => {
      if (sortedBp.length <= 1) return paddingLeft + plotWidth / 2;
      return paddingLeft + (idx / (sortedBp.length - 1)) * plotWidth;
    };

    const getY = (val: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      const ratio = (clamped - minVal) / valRange;
      return paddingTop + plotHeight - (ratio * plotHeight);
    };

    let sysPath = "";
    let diaPath = "";
    sortedBp.forEach((bp, idx) => {
      const x = getX(idx);
      const ySys = getY(bp.systolic_value || 120);
      const yDia = getY(bp.diastolic_value || 80);
      
      if (idx === 0) {
        sysPath = `M ${x} ${ySys}`;
        diaPath = `M ${x} ${yDia}`;
      } else {
        sysPath += ` L ${x} ${ySys}`;
        diaPath += ` L ${x} ${yDia}`;
      }
    });

    return (
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 text-left">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
          <div>
            <span className="font-mono text-[9px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              Live Clinical Telemetry
            </span>
            <h2 className="font-bold text-xl text-zinc-900 mt-1">
              Active Blood Pressure Assessment
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Chronological systolic and diastolic values plotted from medical log entries.</p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500 block shadow-sm" />
              <span className="text-zinc-600 font-semibold">Systolic (mmHg)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-cyan-500 block shadow-sm" />
              <span className="text-zinc-600 font-semibold">Diastolic (mmHg)</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg className="w-full min-w-[700px] h-[280px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {[40, 60, 80, 100, 120, 140, 160, 180].map((level) => {
              const y = getY(level);
              return (
                <g key={level}>
                  <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-zinc-400 text-[10px] font-mono">
                    {level}
                  </text>
                </g>
              );
            })}

            {sortedBp.map((bp, idx) => {
              const x = getX(idx);
              const dateObj = new Date(bp.start_date_time);
              const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
              return (
                <g key={idx}>
                  <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + plotHeight} stroke="#e4e4e7" strokeWidth="0.5" />
                  <text x={x} y={paddingTop + plotHeight + 16} textAnchor="middle" className="fill-zinc-500 text-[9px] font-mono">
                    {dateStr}
                  </text>
                  <text x={x} y={paddingTop + plotHeight + 28} textAnchor="middle" className="fill-zinc-400 text-[8px] font-mono">
                    {timeStr}
                  </text>
                </g>
              );
            })}

            {sortedBp.length > 0 && (
              <path d={sysPath} fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {sortedBp.length > 0 && (
              <path d={diaPath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {sortedBp.map((bp, idx) => {
              const x = getX(idx);
              const ySys = getY(bp.systolic_value || 120);
              const yDia = getY(bp.diastolic_value || 80);
              return (
                <g key={idx}>
                  <circle cx={x} cy={ySys} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={x} cy={yDia} r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-sm text-zinc-800 mb-4">Historical Log Entries</h3>
          <div className="overflow-hidden border border-zinc-200 rounded-xl bg-white">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono text-[9px] uppercase">
                  <th className="p-3">DATE & TIME</th>
                  <th className="p-3">BP READING</th>
                  <th className="p-3">POSTURE</th>
                  <th className="p-3">LOCATION</th>
                  <th className="p-3">ACTIVITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedBp.slice().reverse().map((bp, idx) => {
                  const dateVal = new Date(bp.start_date_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                  return (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="p-3 font-mono text-zinc-500">{dateVal}</td>
                      <td className="p-3">
                        <span className="font-extrabold text-zinc-900 font-mono text-sm">{bp.systolic_value}/{bp.diastolic_value}</span>
                        <span className="text-[10px] text-zinc-400 ml-1">mmHg</span>
                      </td>
                      <td className="p-3 capitalize text-zinc-600">{bp.body_posture}</td>
                      <td className="p-3 capitalize text-zinc-600">{bp.measurement_location}</td>
                      <td className="p-3 text-zinc-500">{bp.temporal_relationship_to_physical_activity} ({bp.temporal_relationship_to_sleep})</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Back button */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-5">
        <div>
          <button 
            onClick={() => router.push('/patient/dashboard')}
            className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer mb-2"
          >
            <span>← Back to Patient Dashboard</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Health Telemetry Hub & Patient Forms
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-semibold">
            Log physical telemetry, compile diagnostic baseline data layers, and plot automated clinical assessment charts.
          </p>
        </div>
        
        {/* New Full Assessment Button */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleNewFullAssessment}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>New Full Assessment</span>
          </button>
        </div>
      </div>

      {/* Alert messages */}
      {successMessage && (
        <div className="mb-6 flex items-center space-x-3.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-semibold">
          <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 flex items-center space-x-3.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 flex flex-wrap border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('form_profile')}
          className={`px-5 py-4 text-xs font-bold transition cursor-pointer border-b-2 ${
            activeTab === 'form_profile' 
              ? 'text-emerald-700 border-emerald-600 bg-emerald-50/50' 
              : 'text-zinc-500 border-transparent hover:text-zinc-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Form 1: User Profile</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('form_bp')}
          className={`px-5 py-4 text-xs font-bold transition cursor-pointer border-b-2 ${
            activeTab === 'form_bp' 
              ? 'text-emerald-700 border-emerald-600 bg-emerald-50/50' 
              : 'text-zinc-500 border-transparent hover:text-zinc-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Form 2: Blood Pressure</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('form_hr')}
          className={`px-5 py-4 text-xs font-bold transition cursor-pointer border-b-2 ${
            activeTab === 'form_hr' 
              ? 'text-emerald-700 border-emerald-600 bg-emerald-50/50' 
              : 'text-zinc-500 border-transparent hover:text-zinc-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Form 3: Heart Rate</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('form_ha')}
          className={`px-5 py-4 text-xs font-bold transition cursor-pointer border-b-2 ${
            activeTab === 'form_ha' 
              ? 'text-emerald-700 border-emerald-600 bg-emerald-50/50' 
              : 'text-zinc-500 border-transparent hover:text-zinc-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clipboard className="h-4 w-4" />
            <span>Form 4: Health Assessment</span>
          </div>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-xs text-zinc-500 mt-3">Fetching synchronized medical database store...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Form 1: User Profile */}
          {activeTab === 'form_profile' && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
              <div className="border-b border-zinc-200 pb-5 mb-6">
                <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded">
                  Form 01 of 04
                </span>
                <h2 className="font-extrabold text-xl text-zinc-900 mt-2.5">User Profile Configuration</h2>
                <p className="text-xs text-zinc-500 mt-1 font-semibold">Define patient identity, medical history, and lifestyle habits.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-4">1. Personal Demographics</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">First Name</label>
                      <input type="text" required value={profileForm.first_name} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Middle Name</label>
                      <input type="text" value={profileForm.middle_name} onChange={e => setProfileForm({ ...profileForm, middle_name: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Last Name</label>
                      <input type="text" required value={profileForm.last_name} onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Phone Number</label>
                      <input type="tel" value={profileForm.phone_number} onChange={e => setProfileForm({ ...profileForm, phone_number: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Date of Birth</label>
                      <input type="date" required value={profileForm.date_of_birth} onChange={e => setProfileForm({ ...profileForm, date_of_birth: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Sex</label>
                      <select value={profileForm.sex} onChange={e => setProfileForm({ ...profileForm, sex: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-zinc-200 text-right">
                  <button type="submit" className="rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form 2: Blood Pressure */}
          {activeTab === 'form_bp' && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
              <div className="border-b border-zinc-200 pb-5 mb-6">
                <span className="text-[9px] font-mono font-bold text-rose-700 uppercase tracking-wider bg-rose-50 border border-rose-100 px-2.5 py-1 rounded">
                  Form 02 of 04
                </span>
                <h2 className="font-extrabold text-xl text-zinc-900 mt-2.5">Blood Pressure Measurement</h2>
                <p className="text-xs text-zinc-500 mt-1 font-semibold">Log clinical arterial pressure readings.</p>
              </div>

              <form onSubmit={handleBpSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Systolic (mmHg)</label>
                    <input type="number" required value={bpForm.systolic_value} onChange={e => setBpForm({ ...bpForm, systolic_value: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Diastolic (mmHg)</label>
                    <input type="number" required value={bpForm.diastolic_value} onChange={e => setBpForm({ ...bpForm, diastolic_value: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Date & Time</label>
                  <input type="datetime-local" required value={bpForm.start_date_time} onChange={e => setBpForm({ ...bpForm, start_date_time: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Body Posture</label>
                    <select value={bpForm.body_posture} onChange={e => setBpForm({ ...bpForm, body_posture: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="sitting">Sitting</option>
                      <option value="standing">Standing</option>
                      <option value="supine">Supine (Lying)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Location</label>
                    <select value={bpForm.measurement_location} onChange={e => setBpForm({ ...bpForm, measurement_location: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="left wrist">Left Wrist</option>
                      <option value="left upper arm">Left Upper Arm</option>
                      <option value="right wrist">Right Wrist</option>
                      <option value="right upper arm">Right Upper Arm</option>
                    </select>
                  </div>
                </div>
                <div className="pt-5 border-t border-zinc-200 text-right">
                  <button type="submit" className="rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition">
                    Save BP Entry
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form 3: Heart Rate */}
          {activeTab === 'form_hr' && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
              <div className="border-b border-zinc-200 pb-5 mb-6">
                <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded">
                  Form 03 of 04
                </span>
                <h2 className="font-extrabold text-xl text-zinc-900 mt-2.5">Heart Rate Measurement</h2>
                <p className="text-xs text-zinc-500 mt-1 font-semibold">Log resting or active heart rate values.</p>
              </div>

              <form onSubmit={handleHrSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Heart Rate (BPM)</label>
                  <input type="number" min="35" max="220" required value={hrForm.value} onChange={e => setHrForm({ ...hrForm, value: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-lg font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Date & Time</label>
                  <input type="datetime-local" required value={hrForm.start_date_time} onChange={e => setHrForm({ ...hrForm, start_date_time: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Body Posture</label>
                    <select value={hrForm.body_posture} onChange={e => setHrForm({ ...hrForm, body_posture: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="sitting">Sitting</option>
                      <option value="standing">Standing</option>
                      <option value="supine">Supine (Lying)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Location</label>
                    <select value={hrForm.measurement_location} onChange={e => setHrForm({ ...hrForm, measurement_location: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="left wrist">Left Wrist</option>
                      <option value="right wrist">Right Wrist</option>
                      <option value="chest strap">Chest Strap</option>
                    </select>
                  </div>
                </div>
                <div className="pt-5 border-t border-zinc-200 text-right">
                  <button type="submit" className="rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition">
                    Save Heart Rate
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form 4: Health Assessment */}
          {activeTab === 'form_ha' && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm max-w-3xl mx-auto">
              <div className="border-b border-zinc-200 pb-5 mb-6">
                <span className="text-[9px] font-mono font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border border-blue-100 px-2.5 py-1 rounded">
                  Form 04 of 04
                </span>
                <h2 className="font-extrabold text-xl text-zinc-900 mt-2.5">Health Assessment</h2>
                <p className="text-xs text-zinc-500 mt-1 font-semibold">Biometric vitals, blood panels, and clinical notes.</p>
              </div>

              <form onSubmit={handleHaSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Weight (kg)</label>
                    <input type="number" required value={haForm.weight} onChange={e => setHaForm({ ...haForm, weight: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Height (m)</label>
                    <input type="number" step="0.01" required value={haForm.height} onChange={e => setHaForm({ ...haForm, height: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Blood Glucose (mg/dL)</label>
                    <input type="number" required value={haForm.glucose} onChange={e => setHaForm({ ...haForm, glucose: Number(e.target.value), avg_glucose_level: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Total Cholesterol (mg/dL)</label>
                    <input type="number" required value={haForm.total_cholesterol} onChange={e => setHaForm({ ...haForm, total_cholesterol: Number(e.target.value) })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Assessment Notes</label>
                  <textarea rows={3} value={haForm.assessment_notes} onChange={e => setHaForm({ ...haForm, assessment_notes: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="pt-5 border-t border-zinc-200 text-right">
                  <button type="submit" className="rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition">
                    Submit Assessment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BP Graph (shown on all tabs as a visual summary) */}
          <div className="mt-8">
            {renderBloodPressureGraph()}
          </div>
        </div>
      )}
    </div>
  );
}