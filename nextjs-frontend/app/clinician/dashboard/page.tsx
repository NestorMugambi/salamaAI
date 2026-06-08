"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, AlertCircle, FileText, Activity, Check,
  Calendar, Pill, Clock, Video, MapPin, Plus, LogOut, Menu, X,
  Heart, TrendingUp, Sliders, UserCheck, ShieldAlert, ChevronRight
} from 'lucide-react';

// Types
interface Measurement {
  systolicBP: number;
  diastolicBP: number;
  cholesterol: number;
  bloodGlucose: number;
  heartRate: number;
  age: number;
  weight: number;
  height: number;
  smokingStatus: string;
  diabetesStatus: string;
  physicalActivity: string;
}

interface Assessment {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  cvdRiskPercentage: number;
  riskCategory: 'Low' | 'Borderline' | 'Intermediate' | 'High';
  summary: string;
  measurements: Measurement;
  diseasePredictions?: any[];
}

interface Notification {
  id: string;
  message: string;
  severity: 'alert' | 'info';
  recipientRole: string;
  isRead: boolean;
  createdAt: string;
}

interface PatientSummary {
  name: string;
  email: string;
  latestAssessment: Assessment;
  allAssessmentsCount: number;
  history: Assessment[];
}

// Mock data for development
const mockAssessments: Assessment[] = [
  {
    id: "1",
    timestamp: "2025-06-01T10:30:00Z",
    patientId: "p1",
    patientName: "Mary Wanjiku",
    patientEmail: "mary@example.com",
    cvdRiskPercentage: 68,
    riskCategory: "High",
    summary: "Elevated blood pressure and cholesterol levels detected.",
    measurements: {
      systolicBP: 146, diastolicBP: 94, cholesterol: 210, bloodGlucose: 105,
      heartRate: 82, age: 52, weight: 78, height: 165,
      smokingStatus: "never", diabetesStatus: "no", physicalActivity: "low"
    }
  },
  {
    id: "2",
    timestamp: "2025-05-15T09:15:00Z",
    patientId: "p2",
    patientName: "John Otieno",
    patientEmail: "john@example.com",
    cvdRiskPercentage: 32,
    riskCategory: "Intermediate",
    summary: "Moderate risk factors detected. Lifestyle modifications recommended.",
    measurements: {
      systolicBP: 128, diastolicBP: 84, cholesterol: 185, bloodGlucose: 92,
      heartRate: 75, age: 45, weight: 82, height: 175,
      smokingStatus: "former", diabetesStatus: "no", physicalActivity: "moderate"
    }
  },
  {
    id: "3",
    timestamp: "2025-05-20T11:00:00Z",
    patientId: "p3",
    patientName: "Sarah Kimani",
    patientEmail: "sarah@example.com",
    cvdRiskPercentage: 72,
    riskCategory: "High",
    summary: "High cardiovascular risk. Immediate intervention recommended.",
    measurements: {
      systolicBP: 158, diastolicBP: 96, cholesterol: 235, bloodGlucose: 118,
      heartRate: 88, age: 58, weight: 85, height: 162,
      smokingStatus: "active", diabetesStatus: "yes", physicalActivity: "low"
    }
  },
  {
    id: "4",
    timestamp: "2025-05-25T14:30:00Z",
    patientId: "p4",
    patientName: "James Mwangi",
    patientEmail: "james@example.com",
    cvdRiskPercentage: 18,
    riskCategory: "Low",
    summary: "Low risk. Maintaining healthy lifestyle.",
    measurements: {
      systolicBP: 118, diastolicBP: 78, cholesterol: 165, bloodGlucose: 85,
      heartRate: 68, age: 35, weight: 70, height: 170,
      smokingStatus: "never", diabetesStatus: "no", physicalActivity: "high"
    }
  }
];

const mockNotifications: Notification[] = [
  {
    id: "n1",
    message: "⚠️ High CVD risk alert for Mary Wanjiku (68%). Immediate review recommended.",
    severity: "alert",
    recipientRole: "clinician",
    isRead: false,
    createdAt: "2025-06-01T10:35:00Z"
  },
  {
    id: "n2",
    message: "⚠️ Critical hypertension indicator for Sarah Kimani (99.9%).",
    severity: "alert",
    recipientRole: "clinician",
    isRead: false,
    createdAt: "2025-05-20T11:05:00Z"
  }
];

export default function ClinicianDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high_risk' | 'intermediate'>('all');
  const [selectedPatientEmail, setSelectedPatientEmail] = useState<string | null>(null);
  const [assessments] = useState<Assessment[]>(mockAssessments);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Filter alert notifications
  const alertNotifications = notifications.filter(
    n => n.recipientRole === 'clinician' && n.severity === 'alert' && !n.isRead
  );

  // Group assessments by unique patients
  const uniquePatientsMap: { [email: string]: Assessment[] } = {};
  assessments.forEach(a => {
    const email = a.patientEmail.toLowerCase();
    if (!uniquePatientsMap[email]) {
      uniquePatientsMap[email] = [];
    }
    uniquePatientsMap[email].push(a);
  });

  const patientEntries: PatientSummary[] = Object.values(uniquePatientsMap).map(pList => {
    const latest = pList[0];
    return {
      name: latest.patientName,
      email: latest.patientEmail,
      latestAssessment: latest,
      allAssessmentsCount: pList.length,
      history: pList,
    };
  });

  // Filter patients
  const filteredPatients = patientEntries.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const latestRisk = p.latestAssessment.riskCategory;

    if (filterType === 'high_risk') {
      return matchesSearch && latestRisk === 'High';
    }
    if (filterType === 'intermediate') {
      return matchesSearch && (latestRisk === 'Intermediate' || latestRisk === 'Borderline');
    }
    return matchesSearch;
  });

  // Get active patient
  const activePatient = selectedPatientEmail 
    ? patientEntries.find(p => p.email.toLowerCase() === selectedPatientEmail.toLowerCase()) 
    : (filteredPatients[0] || null);

  const getRiskBadgeColor = (cat: string) => {
    switch (cat) {
      case 'High': return 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
      case 'Intermediate': return 'text-amber-700 bg-amber-50 border-amber-200 font-bold';
      case 'Borderline': return 'text-yellow-700 bg-yellow-50 border-yellow-200 font-bold';
      default: return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
    }
  };

  const getRiskBgColor = (cat: string) => {
    switch (cat) {
      case 'High': return 'bg-rose-500';
      case 'Intermediate': return 'bg-amber-500';
      case 'Borderline': return 'bg-yellow-500';
      default: return 'bg-emerald-500';
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleViewAssessment = (assessment: Assessment) => {
    alert(`Viewing detailed assessment for ${assessment.patientName}\nRisk: ${assessment.cvdRiskPercentage}%\nSHAP analysis would show here.`);
  };

  const handleScheduleAppointment = () => {
    alert("Schedule appointment - This would open the appointment scheduler");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    router.push("/");
  };

  // Get 4 disease predictions for a patient
  const getFourDiseasePredictions = (assessment: Assessment) => {
    const m = assessment.measurements;
    const age = m.age;
    const systolic = m.systolicBP;
    const diastolic = m.diastolicBP;
    const cholesterol = m.cholesterol;
    const smoking = m.smokingStatus;

    const cvdRisk = assessment.cvdRiskPercentage;

    let hypBase = 12;
    if (systolic > 115) hypBase += (systolic - 115) * 1.3;
    if (diastolic > 75) hypBase += (diastolic - 75) * 1.5;
    if (age > 35) hypBase += (age - 35) * 0.5;
    const hypRisk = Math.round(Math.max(5, Math.min(99.9, hypBase)));

    let strokeBase = 4;
    if (systolic > 115) strokeBase += (systolic - 110) * 0.6;
    if (age > 40) strokeBase += (age - 35) * 0.5;
    if (smoking === 'active') strokeBase += 15;
    const strokeRisk = Math.round(Math.max(2, Math.min(95, strokeBase)));

    let chdBase = 6;
    if (cholesterol > 180) chdBase += (cholesterol - 180) * 0.3;
    if (age > 35) chdBase += (age - 35) * 0.5;
    if (smoking === 'active') chdBase += 12;
    const chdRisk = Math.round(Math.max(3, Math.min(95, chdBase)));

    const getLabel = (percentage: number) => {
      if (percentage >= 60) return 'High';
      if (percentage >= 35) return 'Intermediate';
      if (percentage >= 15) return 'Borderline';
      return 'Low';
    };

    return [
      { id: 'cvd', disease: 'cvd', name: 'Cardiovascular Disease', risk_percentage: cvdRisk, risk_label: getLabel(cvdRisk), explanation: `CVD risk evaluated at ${cvdRisk}% based on age, blood pressure, and cholesterol levels.` },
      { id: 'hyp', disease: 'hyp', name: 'Hypertension Indicator', risk_percentage: hypRisk, risk_label: getLabel(hypRisk), explanation: `Hypertension risk calculated from systolic pressure of ${systolic} mmHg.` },
      { id: 'stroke', disease: 'stroke', name: 'Stroke Potential', risk_percentage: strokeRisk, risk_label: getLabel(strokeRisk), explanation: `Stroke risk factors include blood pressure and ${smoking === 'active' ? 'active smoking' : 'non-smoking status'}.` },
      { id: 'chd', disease: 'chd', name: 'Coronary Heart Disease', risk_percentage: chdRisk, risk_label: getLabel(chdRisk), explanation: `CHD risk influenced by cholesterol levels of ${cholesterol} mg/dL.` }
    ];
  };

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
            <Link href="/clinician/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-700 bg-emerald-50 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Patients</span>
            </Link>
            <Link href="/clinician/appointments" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5" />
              <span>Appointments</span>
            </Link>
            <Link href="/clinician/prescriptions" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">
              <Pill className="w-5 h-5" />
              <span>Prescriptions</span>
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
          
          {/* Header */}
          <div className="mb-6 border-b border-zinc-200 pb-6">
            <span className="font-mono text-[9px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              Clinician Suite
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
              Clinician Monitoring Console
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Real-time cardiovascular triage alerts and patient medical record reviews.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Patients</span>
                <div className="text-xl font-black text-zinc-900">{patientEntries.length}</div>
                <p className="text-[10px] text-zinc-400">Active records</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-rose-600 font-bold uppercase">High Risk Alerts</span>
                <div className="text-xl font-black text-rose-700">
                  {patientEntries.filter(p => p.latestAssessment.riskCategory === 'High').length}
                </div>
                <p className="text-[10px] text-rose-400">Need immediate attention</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center animate-pulse">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Assessments</span>
                <div className="text-xl font-black text-zinc-900">{assessments.length}</div>
                <p className="text-[10px] text-zinc-400">ML predictions run</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Alert Notifications */}
          {alertNotifications.length > 0 && (
            <div className="mb-6 border border-rose-200 rounded-2xl bg-rose-50/50 p-5">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-3">
                <AlertCircle className="h-5 w-5 animate-pulse" />
                <span>Critical Alerts ({alertNotifications.length})</span>
              </div>
              <div className="space-y-2">
                {alertNotifications.map(alert => (
                  <div key={alert.id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-rose-100">
                    <p className="text-sm text-zinc-700">{alert.message}</p>
                    <button
                      onClick={() => handleMarkNotificationRead(alert.id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Panel - Patient List */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4">
                  {[
                    { key: 'all', label: 'All Patients' },
                    { key: 'high_risk', label: 'High Risk 🚨' },
                    { key: 'intermediate', label: 'Intermediate' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterType(filter.key as any)}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition ${
                        filterType === filter.key
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Patient List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.email}
                      onClick={() => setSelectedPatientEmail(patient.email)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        activePatient?.email === patient.email
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-800">{patient.name}</p>
                          <p className="text-xs text-zinc-400">{patient.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getRiskBadgeColor(patient.latestAssessment.riskCategory)}`}>
                            {patient.latestAssessment.cvdRiskPercentage}%
                          </span>
                          <div className={`w-16 h-1.5 mt-2 rounded-full bg-zinc-200 overflow-hidden`}>
                            <div 
                              className={`h-full rounded-full ${getRiskBgColor(patient.latestAssessment.riskCategory)}`}
                              style={{ width: `${Math.min(patient.latestAssessment.cvdRiskPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Patient Details */}
            <div className="lg:col-span-7">
              {activePatient ? (
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6">
                  
                  {/* Patient Header */}
                  <div className="border-b border-zinc-100 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-zinc-800">{activePatient.name}</h2>
                    <p className="text-sm text-zinc-500">{activePatient.email}</p>
                    <div className="flex gap-2 mt-3">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${getRiskBadgeColor(activePatient.latestAssessment.riskCategory)}`}>
                        CVD Risk: {activePatient.latestAssessment.cvdRiskPercentage}%
                      </span>
                      <button
                        onClick={handleScheduleAppointment}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Calendar className="h-3 w-3" />
                        Schedule Appointment
                      </button>
                    </div>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Blood Pressure</p>
                      <p className="text-lg font-bold text-zinc-800">
                        {activePatient.latestAssessment.measurements.systolicBP}/{activePatient.latestAssessment.measurements.diastolicBP}
                      </p>
                      <p className="text-[9px] text-zinc-400">mmHg</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Cholesterol</p>
                      <p className="text-lg font-bold text-zinc-800">{activePatient.latestAssessment.measurements.cholesterol}</p>
                      <p className="text-[9px] text-zinc-400">mg/dL</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Glucose</p>
                      <p className="text-lg font-bold text-zinc-800">{activePatient.latestAssessment.measurements.bloodGlucose}</p>
                      <p className="text-[9px] text-zinc-400">mg/dL</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Heart Rate</p>
                      <p className="text-lg font-bold text-zinc-800">{activePatient.latestAssessment.measurements.heartRate}</p>
                      <p className="text-[9px] text-zinc-400">BPM</p>
                    </div>
                  </div>

                  {/* Lifestyle Factors */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-zinc-50 text-center">
                      <p className="text-[9px] text-zinc-400">Smoking</p>
                      <p className="text-xs font-bold capitalize">{activePatient.latestAssessment.measurements.smokingStatus}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-50 text-center">
                      <p className="text-[9px] text-zinc-400">Diabetes</p>
                      <p className="text-xs font-bold capitalize">{activePatient.latestAssessment.measurements.diabetesStatus}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-50 text-center">
                      <p className="text-[9px] text-zinc-400">Physical Activity</p>
                      <p className="text-xs font-bold capitalize">{activePatient.latestAssessment.measurements.physicalActivity}</p>
                    </div>
                  </div>

                  {/* 4 Disease Predictions */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      Multi-Disease Risk Assessment
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getFourDiseasePredictions(activePatient.latestAssessment).map((pred) => (
                        <div key={pred.id} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/30">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-zinc-700">{pred.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getRiskBadgeColor(pred.risk_label)}`}>
                              {pred.risk_label}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-xl font-bold text-zinc-800">{pred.risk_percentage.toFixed(1)}%</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">{pred.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* History and Action */}
                  <div className="border-t border-zinc-100 pt-4">
                    <h3 className="text-sm font-bold text-zinc-800 mb-3">Assessment History</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {activePatient.history.map((hist, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-zinc-50">
                          <div>
                            <p className="text-xs text-zinc-500">{new Date(hist.timestamp).toLocaleDateString()}</p>
                            <p className="text-xs font-bold">{hist.summary.substring(0, 60)}...</p>
                          </div>
                          <button
                            onClick={() => handleViewAssessment(hist)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                          >
                            <Sliders className="h-3 w-3" />
                            SHAP Analysis
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* API Endpoint Note */}
                  <div className="mt-4 p-3 bg-slate-100 rounded-lg text-[10px] text-slate-500">
                    <p className="font-bold mb-1">📡 API Routes Available:</p>
                    <p>• GET /clinicians/clinicians/me/patients - List all patients</p>
                    <p>• GET /clinicians/clinicians/me/patients/{`{patient_id}`} - View patient details</p>
                    <p>• POST /clinicians/clinicians/me/appointments - Schedule appointment</p>
                  </div>

                </div>
              ) : (
                <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50">
                  <p className="text-zinc-500">Select a patient to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}