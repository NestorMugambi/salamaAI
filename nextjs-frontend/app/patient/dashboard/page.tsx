"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, Plus, TrendingUp, Sliders, Settings, Calendar, Heart, 
  ArrowRight, UserCheck, Menu, X, LogOut, History, Home 
} from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
}

interface Assessment {
  id: string;
  timestamp: string;
  cvdRiskPercentage: number;
  riskCategory: string;
  summary: string;
  measurements?: any;
  diseasePredictions?: any[];
}

interface DiseasePrediction {
  id: string;
  disease: 'cvd' | 'hyp' | 'stroke' | 'chd';
  risk_score: number;
  risk_percentage: number;
  risk_label: 'Low' | 'Borderline' | 'Intermediate' | 'High';
  model_version: string;
  predicted_at: string;
  explanation?: string;
}

// Mock profile for development
const mockProfile: UserProfile = {
  fullName: "Mary Wanjiku",
  email: "mary.wanjiku@example.com"
};

// Mock assessments for development
const mockAssessments: Assessment[] = [
  {
    id: "1",
    timestamp: "2025-06-01T10:30:00Z",
    cvdRiskPercentage: 32.7,
    riskCategory: "High",
    summary: "Elevated blood pressure and cholesterol levels detected. Lifestyle modifications recommended.",
    measurements: {
      age: 52,
      systolicBP: 146,
      diastolicBP: 94,
      cholesterol: 210,
      bloodGlucose: 105,
      smokingStatus: "never",
      weight: 78,
      height: 165
    }
  },
  {
    id: "2",
    timestamp: "2025-05-15T09:15:00Z",
    cvdRiskPercentage: 28.4,
    riskCategory: "Borderline",
    summary: "Risk factors within borderline range. Continue monitoring blood pressure.",
    measurements: {
      age: 52,
      systolicBP: 138,
      diastolicBP: 88,
      cholesterol: 195,
      bloodGlucose: 98,
      smokingStatus: "never",
      weight: 77,
      height: 165
    }
  }
];

// Mock BP data for development
const mockBpData = [
  { 
    systolic_value: 118, diastolic_value: 78, start_date_time: "2025-05-01T09:00:00Z",
    body_posture: "sitting", measurement_location: "home", 
    temporal_relationship_to_physical_activity: "rest", temporal_relationship_to_sleep: "awake" 
  },
  { 
    systolic_value: 122, diastolic_value: 82, start_date_time: "2025-05-08T10:30:00Z",
    body_posture: "sitting", measurement_location: "clinic",
    temporal_relationship_to_physical_activity: "rest", temporal_relationship_to_sleep: "awake" 
  },
  { 
    systolic_value: 135, diastolic_value: 88, start_date_time: "2025-05-15T08:15:00Z",
    body_posture: "sitting", measurement_location: "home",
    temporal_relationship_to_physical_activity: "light", temporal_relationship_to_sleep: "awake" 
  },
  { 
    systolic_value: 142, diastolic_value: 92, start_date_time: "2025-05-22T14:45:00Z",
    body_posture: "standing", measurement_location: "pharmacy",
    temporal_relationship_to_physical_activity: "moderate", temporal_relationship_to_sleep: "awake" 
  },
  { 
    systolic_value: 146, diastolic_value: 94, start_date_time: "2025-05-29T11:00:00Z",
    body_posture: "sitting", measurement_location: "home",
    temporal_relationship_to_physical_activity: "rest", temporal_relationship_to_sleep: "awake" 
  }
];

export default function PatientDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile] = useState<UserProfile>(mockProfile);
  const [assessments] = useState<Assessment[]>(mockAssessments);
  const [bpList, setBpList] = useState<any[]>([]);
  const [loadingBp, setLoadingBp] = useState<boolean>(true);

  const latestAssessment = assessments[0] || null;

  // Fetch BP data (using mock data for development)
  useEffect(() => {
    setTimeout(() => {
      setBpList(mockBpData);
      setLoadingBp(false);
    }, 500);
  }, []);

  const getRiskBadgeColor = (cat: string) => {
    switch (cat) {
      case 'High': return 'text-rose-700 bg-rose-50 border-rose-100 font-bold';
      case 'Intermediate': return 'text-amber-700 bg-amber-50 border-amber-100 font-bold';
      case 'Borderline': return 'text-yellow-700 bg-yellow-50 border-yellow-100 font-bold';
      default: return 'text-emerald-700 bg-emerald-50 border-emerald-100 font-bold';
    }
  };

  // Extract or backfill the 4-disease structure
  const getFourDiseasePredictions = (): DiseasePrediction[] => {
    if (latestAssessment && latestAssessment.diseasePredictions && latestAssessment.diseasePredictions.length === 4) {
      return latestAssessment.diseasePredictions as DiseasePrediction[];
    }

    if (latestAssessment) {
      const m = latestAssessment.measurements || {};
      const age = Number(m.age || 52);
      const systolic = Number(m.systolicBP || 146);
      const diastolic = Number(m.diastolicBP || 94);
      const cholesterol = Number(m.cholesterol || 210);
      const smoking = m.smokingStatus || 'never';

      const cvdRisk = latestAssessment.cvdRiskPercentage || 32.7;

      let hypBase = 12;
      if (systolic > 115) hypBase += (systolic - 115) * 1.3;
      if (diastolic > 75) hypBase += (diastolic - 75) * 1.5;
      if (age > 35) hypBase += (age - 35) * 0.5;
      const hypRisk = Math.round(Math.max(5, Math.min(99.9, hypBase)));

      let strokeBase = 4;
      if (systolic > 115) strokeBase += (systolic - 115) * 0.6;
      if (age > 40) strokeBase += (age - 40) * 0.7;
      if (smoking === 'active') strokeBase += 20;
      const strokeRisk = Math.round(Math.max(2, Math.min(95, strokeBase)));

      let chdBase = 6;
      if (cholesterol > 180) chdBase += (cholesterol - 180) * 0.3;
      if (age > 35) chdBase += (age - 35) * 0.6;
      if (smoking === 'active') chdBase += 15;
      const chdRisk = Math.round(Math.max(3, Math.min(95, chdBase)));

      const getLabel = (percentage: number): 'Low' | 'Borderline' | 'Intermediate' | 'High' => {
        if (percentage >= 60) return 'High';
        if (percentage >= 35) return 'Intermediate';
        if (percentage >= 15) return 'Borderline';
        return 'Low';
      };

      const ts = latestAssessment.timestamp;

      return [
        { id: 'dp-cvd', disease: 'cvd', risk_score: cvdRisk / 100, risk_percentage: cvdRisk, risk_label: getLabel(cvdRisk), model_version: 'xgbcvd_v3', predicted_at: ts, explanation: `CVD 10-year risk of ${cvdRisk}% reflects core metrics, chronobiological age, and blood pressure indicators.` },
        { id: 'dp-hyp', disease: 'hyp', risk_score: hypRisk / 100, risk_percentage: hypRisk, risk_label: getLabel(hypRisk), model_version: 'xgbhyp_v1', predicted_at: ts, explanation: `Arterial tension overload risk (${hypRisk}%) is calculated primarily based on systolic pressure loading.` },
        { id: 'dp-stroke', disease: 'stroke', risk_score: strokeRisk / 100, risk_percentage: strokeRisk, risk_label: getLabel(strokeRisk), model_version: 'xgbstroke_v5', predicted_at: ts, explanation: `Ischemic stroke potential of ${strokeRisk}% is calculated against vascular shear stress parameters.` },
        { id: 'dp-chd', disease: 'chd', risk_score: chdRisk / 100, risk_percentage: chdRisk, risk_label: getLabel(chdRisk), model_version: 'xgbchd_v2', predicted_at: ts, explanation: `Coronary indicators evaluate total lipid levels (${cholesterol} mg/dL) as active plaque accumulation coefficients.` }
      ];
    }

    // Default mock values
    return [
      { id: 'mock-1', disease: 'cvd', risk_score: 0.327, risk_percentage: 32.7, risk_label: 'High', model_version: 'xgbcvd_v3', predicted_at: new Date().toISOString(), explanation: "CVD risk is evaluated with chronobiological metrics and baseline resting hemodynamics." },
      { id: 'mock-2', disease: 'hyp', risk_score: 0.9991, risk_percentage: 99.91, risk_label: 'High', model_version: 'xgbhyp_v1', predicted_at: new Date().toISOString(), explanation: "Hypertension index shows high arterial wall shear stress and vascular resistance." },
      { id: 'mock-3', disease: 'stroke', risk_score: 0.0002, risk_percentage: 0.02, risk_label: 'Low', model_version: 'xgbstroke_v5', predicted_at: new Date().toISOString(), explanation: "Stroke potential is low reflecting resilient blood vessels elastic parameters." },
      { id: 'mock-4', disease: 'chd', risk_score: 0.0002, risk_percentage: 0.02, risk_label: 'Low', model_version: 'xgbchd_v2', predicted_at: new Date().toISOString(), explanation: "Coronary artery block potential calculation displays protective lipids distribution rates." }
    ];
  };

  const diseaseNames = {
    cvd: { title: 'Cardiovascular Disease', icon: Heart, desc: 'Atherosclerosis and coronary block' },
    hyp: { title: 'Hypertension Indicator', icon: TrendingUp, desc: 'High arterial pressure overload' },
    stroke: { title: 'Ischemic Stroke Potential', icon: Activity, desc: 'Acute cerebral hypoperfusion' },
    chd: { title: 'Coronary Heart Disease', icon: Heart, desc: 'Coronary arterial muscle oxygenation' }
  };

  const predictions = getFourDiseasePredictions();

  // Navigation Handlers
  const handleNewScan = () => {
    router.push('/patient/health-measurement');
  };

  const handleEditProfile = () => {
    router.push('/patient/profile');
  };

  const handleViewAssessment = (assessment: Assessment) => {
    router.push(`/patient/assessment/${assessment.id}`);
  };

  const handleViewHealthData = () => {
    router.push('/patient/health-data');
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    router.push("/");
  };

  // SVG Blood Pressure Plot generator
  const renderBloodPressureGraph = () => {
    if (loadingBp) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-zinc-400 py-10 bg-white shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
          <p className="text-xs text-zinc-500 mt-3 font-semibold">Fetching synchronized vital logs...</p>
        </div>
      );
    }

    if (bpList.length === 0) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-zinc-400 py-10 bg-white shadow-sm">
          <Activity className="h-10 w-10 text-rose-500/50 mb-3 animate-pulse" />
          <p className="text-sm font-bold text-zinc-800">No Blood Pressure Readings</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm text-center font-medium">Add a blood pressure measurement to generate telemetry data.</p>
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
            <p className="text-xs text-zinc-500 mt-0.5 font-medium">Chronological systolic and diastolic values plotted from medical log entries.</p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500 block shadow-sm" />
              <span className="text-zinc-600 font-bold">Systolic (mmHg)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-cyan-500 block shadow-sm" />
              <span className="text-zinc-600 font-bold">Diastolic (mmHg)</span>
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
                  <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-zinc-400 text-[10px] font-mono font-semibold">
                    {level}
                  </text>
                </g>
              );
            })}

            {sortedBp.map((bp, idx) => {
              const x = getX(idx);
              const dateObj = new Date(bp.start_date_time);
              const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
              return (
                <g key={idx}>
                  <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + plotHeight} stroke="#e4e4e7" strokeWidth="0.5" />
                  <text x={x} y={paddingTop + plotHeight + 16} textAnchor="middle" className="fill-zinc-500 text-[9px] font-mono font-bold">
                    {dateStr}
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
          <h3 className="font-bold text-sm text-zinc-800 mb-4">Historical Log Entries</h3>
          <div className="overflow-hidden border border-zinc-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-xs text-left text-zinc-700">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold tracking-wider text-[9px] uppercase">
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
                      <td className="p-3 font-mono text-zinc-500 font-semibold">{dateVal}</td>
                      <td className="p-3">
                        <span className="font-extrabold text-zinc-900 font-mono text-sm">{bp.systolic_value}/{bp.diastolic_value}</span>
                        <span className="text-[10px] text-zinc-400 ml-1">mmHg</span>
                      </td>
                      <td className="p-3 capitalize">{bp.body_posture || 'sitting'}</td>
                      <td className="p-3 capitalize">{bp.measurement_location || 'home'}</td>
                      <td className="p-3 text-zinc-500">{bp.temporal_relationship_to_physical_activity || 'rest'}</td>
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

  const ChevronRightIcon = () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="h-3 w-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-zinc-200 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span className="text-xl font-bold text-emerald-700">Salama AI</span>
          </Link>
          
          <nav className="space-y-2">
            <Link href="/patient/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-700 bg-emerald-50 rounded-lg">
              <Home className="w-5 h-5 text-emerald-600" />
              <span>Dashboard</span>
            </Link>
            <Link href="/patient/health-data" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">
              <Activity className="w-5 h-5" />
              <span>Health Data</span>
            </Link>
            <Link href="/patient/appointments" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5" />
              <span>Appointments</span>
            </Link>
            <Link href="/patient/history" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">
              <History className="w-5 h-5" />
              <span>Risk History</span>
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        <div className="mx-auto max-w-7xl">
          
          {/* Welcome banner */}
          <div className="mb-8 flex flex-col md:flex-row md:items-stretch justify-between gap-6 border-b border-zinc-200 pb-6">
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-mono text-[9px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 self-start">
                Secure Patient Portal Connected
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2.5">
                Welcome back, {profile.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-semibold">
                Salama AI provides multi-disease cardiac predictions. Your email: <strong className="text-zinc-700">{profile.email}</strong>
              </p>
            </div>

            {/* Action Cards */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:max-w-xl">
              <div 
                onClick={handleNewScan}
                className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/60 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">New Scan</span>
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 mb-1">Launch Cardiovascular Scan</h3>
                <p className="text-[10.5px] text-zinc-500 font-semibold mb-4">
                  Input your health data for real-time multi-disease predictions.
                </p>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-xs transition">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Begin New Scan</span>
                </button>
              </div>

              <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Portals</span>
                  <h3 className="font-extrabold text-sm text-zinc-900 mt-2 mb-1">Clinical Health Sheets</h3>
                  <p className="text-[10.5px] text-zinc-500 font-semibold mb-4">
                    Submit health records to sync diagnostic profiles.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleViewHealthData}
                    className="flex items-center justify-center gap-2 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 py-2.5 rounded-lg text-[10px] font-bold text-zinc-700 transition"
                  >
                    <Activity className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Health Forms</span>
                  </button>
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center justify-center gap-2 border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 py-2.5 rounded-lg text-[10px] font-bold text-emerald-700 transition"
                  >
                    <Settings className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Disease Risk Cards */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {predictions.map((p) => {
              const detail = diseaseNames[p.disease];
              const IconComp = detail.icon;
              return (
                <div key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 transition">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-zinc-800">{detail.title}</span>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">{detail.desc}</span>
                    </div>
                    <IconComp className={`h-5 w-5 ${p.disease === 'cvd' ? 'text-rose-600' : p.disease === 'hyp' ? 'text-amber-600' : p.disease === 'stroke' ? 'text-cyan-600' : 'text-emerald-600'}`} />
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div>
                      <span className="text-3xl font-extrabold text-zinc-900">
                        {p.risk_percentage.toFixed(2).replace(/\.00$/, '')}%
                      </span>
                      <span className="block text-[8px] text-zinc-400 mt-1">Model: {p.model_version}</span>
                    </div>
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold ${getRiskBadgeColor(p.risk_label)}`}>
                      {p.risk_label}
                    </span>
                  </div>

                  {p.explanation && (
                    <p className="mt-3 text-[10.5px] text-zinc-500 font-semibold">
                      {p.explanation.substring(0, 100)}...
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between text-[8px] text-zinc-400 font-bold">
                    <span>PREDICTED</span>
                    <span>{new Date(p.predicted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Blood Pressure Graph */}
          <div className="mb-8">
            {renderBloodPressureGraph()}
          </div>

          {/* Assessment History and Info */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-zinc-800 text-sm sm:text-base">Cardiovascular Assessments</h3>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 border border-zinc-200">
                    {assessments.length} records
                  </span>
                </div>

                {assessments.length === 0 ? (
                  <div className="py-12 text-center text-sm text-zinc-500">
                    <p>No historical assessments yet.</p>
                    <button onClick={handleNewScan} className="mt-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 border border-emerald-100">
                      Create Assessment
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {assessments.map((a, idx) => {
                      const dateStr = new Date(a.timestamp).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-800">Scan on {dateStr}</span>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${getRiskBadgeColor(a.riskCategory)}`}>
                                {a.cvdRiskPercentage}% • {a.riskCategory}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-1">{a.summary}</p>
                          </div>
                          <button
                            onClick={() => handleViewAssessment(a)}
                            className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <span>View Details</span>
                            <ChevronRightIcon />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="flex items-start gap-3 rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
                <UserCheck className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-zinc-800 text-sm">Profile Information</span>
                  <p className="text-xs text-zinc-500 mt-2">
                    Your demographic data configures XGBoost baseline predictions for accurate risk assessment.
                  </p>
                  <button 
                    onClick={handleEditProfile}
                    className="text-xs text-emerald-600 font-semibold mt-2 hover:underline"
                  >
                    Edit Profile →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}