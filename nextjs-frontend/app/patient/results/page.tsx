"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sliders, HelpCircle, HeartHandshake, ArrowLeft, ShieldAlert, CheckCircle, ChevronRight } from 'lucide-react';
import ShapExplanationView from '@/components/ShapExplanationView';

// This would come from your API response
const mockAssessmentData = {
  id: "new-1",
  patientName: "Mary Wanjiku",
  timestamp: new Date().toISOString(),
  cvdRiskPercentage: 68,
  riskCategory: "High",
  summary: "Elevated blood pressure and cholesterol levels detected. Immediate lifestyle modifications recommended.",
  measurements: {
    systolicBP: 146,
    diastolicBP: 94,
    cholesterol: 210,
    bloodGlucose: 105,
    smokingStatus: "never",
    weight: 78,
    height: 165
  },
  recommendations: [
    "Schedule follow-up with your clinician within 2 weeks",
    "Begin regular blood pressure monitoring at home",
    "Reduce sodium intake to less than 2,300mg per day",
    "Increase physical activity to at least 30 minutes daily",
    "Consider dietary changes to lower cholesterol"
  ],
  shapValues: [
    { featureName: "Systolic Blood Pressure", featureValue: "146 mmHg", shapValueHex: 18.5, percentageContribution: 28, explanation: "Elevated systolic pressure significantly increases arterial wall stress." },
    { featureName: "Age", featureValue: "52 years", shapValueHex: 12.3, percentageContribution: 19, explanation: "Cardiovascular risk naturally increases with age." },
    { featureName: "Cholesterol", featureValue: "210 mg/dL", shapValueHex: 8.7, percentageContribution: 13, explanation: "High cholesterol contributes to plaque formation in arteries." }
  ]
};

export default function RiskAssessmentResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState<'overview' | 'shap'>('overview');

  // In production, fetch assessment data by ID from API
  const assessment = mockAssessmentData;

  const getRiskColor = (cat: string) => {
    switch (cat) {
      case 'High': return 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
      case 'Intermediate': return 'text-amber-700 bg-amber-50 border-amber-200 font-bold';
      case 'Borderline': return 'text-yellow-700 bg-yellow-50 border-yellow-200 font-bold';
      default: return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
    }
  };

  const getRiskRingColor = (cat: string) => {
    switch (cat) {
      case 'High': return 'stroke-rose-500';
      case 'Intermediate': return 'stroke-amber-500';
      case 'Borderline': return 'stroke-yellow-500';
      default: return 'stroke-emerald-500';
    }
  };

  const formattedDate = new Date(assessment.timestamp).toLocaleDateString([], {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        
        {/* Return button */}
        <button
          onClick={() => router.push('/patient/dashboard')}
          className="mb-6 flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Main Container */}
        <div className="rounded-3xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-zinc-50 px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                  New Assessment Complete
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">ID: {assessment.id?.slice(0, 8)}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900">
                CVD Risk Assessment Results
              </h1>
              <p className="text-xs text-zinc-500 font-semibold">Completed on {formattedDate}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-200 bg-zinc-50/50 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              📋 Risk Overview
            </button>
            <button
              onClick={() => setActiveTab('shap')}
              className={`flex-1 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
                activeTab === 'shap'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              📊 SHAP Explanation (AI)
            </button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'overview' ? (
              <div className="space-y-8">
                {/* Risk Dial */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-zinc-200 rounded-3xl bg-zinc-50/50">
                    <div className="relative flex h-36 w-36 items-center justify-center">
                      <svg className="absolute top-0 left-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" className="stroke-zinc-200" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className={`transition-all duration-1000 ${getRiskRingColor(assessment.riskCategory)}`}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * assessment.cvdRiskPercentage) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="text-center">
                        <span className="block text-4xl font-extrabold text-zinc-900">
                          {assessment.cvdRiskPercentage}%
                        </span>
                        <span className="block text-[10px] uppercase text-zinc-500 font-extrabold">
                          10-Yr CVD Risk
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border ${getRiskColor(assessment.riskCategory)}`}>
                        {assessment.riskCategory} Risk
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-bold text-zinc-800 text-sm">AI Diagnostic Statement</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      {assessment.summary}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="border p-3 rounded-xl bg-zinc-50/40">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Systolic BP</div>
                        <div className="text-sm font-extrabold font-mono">{assessment.measurements.systolicBP} mmHg</div>
                      </div>
                      <div className="border p-3 rounded-xl bg-zinc-50/40">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Cholesterol</div>
                        <div className="text-sm font-extrabold font-mono">{assessment.measurements.cholesterol} mg/dL</div>
                      </div>
                      <div className="border p-3 rounded-xl bg-zinc-50/40">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Smoking</div>
                        <div className="text-sm font-extrabold capitalize">{assessment.measurements.smokingStatus}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartHandshake className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-bold text-zinc-800 text-sm">Personalized Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {assessment.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-zinc-700 font-medium">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ShapExplanationView 
                shapValues={assessment.shapValues} 
                riskPercentage={assessment.cvdRiskPercentage} 
              />
            )}
          </div>

          {/* Footer */}
          <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 text-center text-[11px] text-zinc-500">
            Salama AI is a predictive diagnostic assist tool. Always consult with a physician.
          </div>
        </div>
      </div>
    </div>
  );
}