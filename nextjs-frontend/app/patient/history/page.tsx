"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  Calendar, 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Download,
  Filter,
  Heart
} from 'lucide-react';

interface RiskHistory {
  id: string;
  date: string;
  riskScore: number;
  riskLevel: 'Low' | 'Borderline' | 'Intermediate' | 'High';
  cvdRisk: number;
  hypRisk: number;
  strokeRisk: number;
  chdRisk: number;
  systolicBP: number;
  diastolicBP: number;
  cholesterol: number;
  bloodGlucose: number;
  bmi: number;
}

// Mock risk history data
const mockRiskHistory: RiskHistory[] = [
  {
    id: "1",
    date: "2025-06-01",
    riskScore: 68,
    riskLevel: "High",
    cvdRisk: 68,
    hypRisk: 99.9,
    strokeRisk: 45,
    chdRisk: 38,
    systolicBP: 146,
    diastolicBP: 94,
    cholesterol: 210,
    bloodGlucose: 105,
    bmi: 28.6
  },
  {
    id: "2",
    date: "2025-05-15",
    riskScore: 42,
    riskLevel: "Intermediate",
    cvdRisk: 42,
    hypRisk: 78.5,
    strokeRisk: 28,
    chdRisk: 22,
    systolicBP: 138,
    diastolicBP: 88,
    cholesterol: 195,
    bloodGlucose: 98,
    bmi: 28.2
  },
  {
    id: "3",
    date: "2025-05-01",
    riskScore: 38,
    riskLevel: "Borderline",
    cvdRisk: 38,
    hypRisk: 65.2,
    strokeRisk: 22,
    chdRisk: 18,
    systolicBP: 132,
    diastolicBP: 85,
    cholesterol: 188,
    bloodGlucose: 95,
    bmi: 27.8
  },
  {
    id: "4",
    date: "2025-04-15",
    riskScore: 35,
    riskLevel: "Borderline",
    cvdRisk: 35,
    hypRisk: 58.4,
    strokeRisk: 18,
    chdRisk: 15,
    systolicBP: 128,
    diastolicBP: 84,
    cholesterol: 182,
    bloodGlucose: 92,
    bmi: 27.5
  },
  {
    id: "5",
    date: "2025-04-01",
    riskScore: 32,
    riskLevel: "Borderline",
    cvdRisk: 32,
    hypRisk: 52.1,
    strokeRisk: 15,
    chdRisk: 12,
    systolicBP: 125,
    diastolicBP: 82,
    cholesterol: 178,
    bloodGlucose: 90,
    bmi: 27.2
  },
  {
    id: "6",
    date: "2025-03-15",
    riskScore: 28,
    riskLevel: "Low",
    cvdRisk: 28,
    hypRisk: 45.3,
    strokeRisk: 12,
    chdRisk: 10,
    systolicBP: 122,
    diastolicBP: 80,
    cholesterol: 172,
    bloodGlucose: 88,
    bmi: 26.8
  }
];

export default function PatientRiskHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<RiskHistory[]>(mockRiskHistory);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'High' | 'Intermediate' | 'Borderline' | 'Low'>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<RiskHistory | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 60) return 'text-rose-600';
    if (score >= 35) return 'text-amber-600';
    if (score >= 15) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 60) return 'bg-rose-500';
    if (score >= 35) return 'bg-amber-500';
    if (score >= 15) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Borderline': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(h => h.riskLevel === filter);

  // Calculate trend
  const getTrend = () => {
    if (history.length < 2) return null;
    const latest = history[0].riskScore;
    const previous = history[1].riskScore;
    const change = latest - previous;
    if (change > 0) return { direction: 'up', value: change, text: 'increasing' };
    if (change < 0) return { direction: 'down', value: Math.abs(change), text: 'decreasing' };
    return { direction: 'stable', value: 0, text: 'stable' };
  };

  const trend = getTrend();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-xs text-zinc-500 mt-3">Loading risk history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/patient/dashboard')}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">Risk History</h1>
              <p className="text-sm text-zinc-500 mt-1">Track your cardiovascular risk over time</p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Assessments</option>
                <option value="High">High Risk Only</option>
                <option value="Intermediate">Intermediate Risk Only</option>
                <option value="Borderline">Borderline Risk Only</option>
                <option value="Low">Low Risk Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Latest Risk Score</p>
                <p className={`text-3xl font-bold ${getRiskColor(history[0]?.riskScore || 0)}`}>
                  {history[0]?.riskScore || 0}%
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {new Date(history[0]?.date || "").toLocaleDateString()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeColor(history[0]?.riskLevel || 'Low')}`}>
                {history[0]?.riskLevel || 'Low'} Risk
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Assessments</p>
                <p className="text-3xl font-bold text-zinc-800">{history.length}</p>
                <p className="text-xs text-zinc-400 mt-1">Over 3 months</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Risk Trend</p>
                {trend && (
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-zinc-800">
                      {trend.direction === 'up' ? '+' : ''}{trend.value}%
                    </p>
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-rose-500" />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown className="h-5 w-5 text-emerald-500" />
                    ) : null}
                  </div>
                )}
                <p className="text-xs text-zinc-400 mt-1">
                  {trend?.text === 'increasing' ? 'Risk increasing - Take action' : 
                   trend?.text === 'decreasing' ? 'Risk decreasing - Good progress' : 
                   'Risk stable'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Trend Chart (Simple Bar Chart) */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Risk Score Trend
          </h2>
          <div className="h-64 flex items-end gap-2">
            {history.slice().reverse().map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center">
                  <div 
                    className={`w-12 rounded-t-lg ${getRiskBgColor(item.riskScore)} transition-all hover:opacity-80 cursor-pointer`}
                    style={{ height: `${item.riskScore * 2}px`, maxHeight: "180px" }}
                    onClick={() => setSelectedAssessment(item)}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                <p className={`text-xs font-bold ${getRiskColor(item.riskScore)}`}>{item.riskScore}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-800">Assessment History</h2>
            <p className="text-sm text-zinc-500 mt-1">Detailed records of all your cardiovascular assessments</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">BP (Sys/Dia)</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Cholesterol</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Glucose</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">BMI</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-5 py-3 text-sm text-zinc-700">
                      {new Date(item.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getRiskColor(item.riskScore)}`}>
                          {item.riskScore}%
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-700">
                      {item.systolicBP}/{item.diastolicBP}
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-700">
                      {item.cholesterol} mg/dL
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-700">
                      {item.bloodGlucose} mg/dL
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-700">
                      {item.bmi}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelectedAssessment(item)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredHistory.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-zinc-500">No assessments found for the selected filter</p>
            </div>
          )}
        </div>

        {/* Assessment Details Modal */}
        {selectedAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-zinc-200 p-5 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-zinc-800">Assessment Details</h2>
                  <p className="text-sm text-zinc-500">
                    {new Date(selectedAssessment.date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="p-1 hover:bg-zinc-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Overall Risk */}
                <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-zinc-600">Overall Cardiovascular Risk</p>
                      <p className={`text-4xl font-bold ${getRiskColor(selectedAssessment.riskScore)}`}>
                        {selectedAssessment.riskScore}%
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold border ${getRiskBadgeColor(selectedAssessment.riskLevel)}`}>
                      {selectedAssessment.riskLevel} Risk
                    </div>
                  </div>
                </div>

                {/* 4 Disease Risks */}
                <div>
                  <h3 className="font-semibold text-zinc-800 mb-3">Multi-Disease Risk Assessment</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <p className="text-xs text-rose-600 font-bold">Cardiovascular Disease</p>
                      <p className="text-2xl font-bold text-rose-700">{selectedAssessment.cvdRisk}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-xs text-amber-600 font-bold">Hypertension</p>
                      <p className="text-2xl font-bold text-amber-700">{selectedAssessment.hypRisk}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                      <p className="text-xs text-cyan-600 font-bold">Stroke</p>
                      <p className="text-2xl font-bold text-cyan-700">{selectedAssessment.strokeRisk}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-bold">Coronary Heart Disease</p>
                      <p className="text-2xl font-bold text-emerald-700">{selectedAssessment.chdRisk}%</p>
                    </div>
                  </div>
                </div>

                {/* Vitals */}
                <div>
                  <h3 className="font-semibold text-zinc-800 mb-3">Vital Measurements</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-zinc-100">
                      <span className="text-zinc-500">Blood Pressure</span>
                      <span className="font-semibold text-zinc-800">{selectedAssessment.systolicBP}/{selectedAssessment.diastolicBP} mmHg</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-100">
                      <span className="text-zinc-500">Cholesterol</span>
                      <span className="font-semibold text-zinc-800">{selectedAssessment.cholesterol} mg/dL</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-100">
                      <span className="text-zinc-500">Blood Glucose</span>
                      <span className="font-semibold text-zinc-800">{selectedAssessment.bloodGlucose} mg/dL</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-100">
                      <span className="text-zinc-500">BMI</span>
                      <span className="font-semibold text-zinc-800">{selectedAssessment.bmi}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      setSelectedAssessment(null);
                      router.push(`/patient/assessment/${selectedAssessment.id}`);
                    }}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
                  >
                    View Full SHAP Analysis →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}