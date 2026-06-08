"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Activity, 
  Calendar,
  ShieldAlert,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
  Sliders,
  HelpCircle
} from 'lucide-react';

interface ShapValue {
  featureName: string;
  featureValue: string | number;
  shapValueHex: number;
  percentageContribution: number;
  explanation: string;
}

interface AssessmentDetail {
  id: string;
  date: string;
  riskScore: number;
  riskLevel: 'Low' | 'Borderline' | 'Intermediate' | 'High';
  summary: string;
  measurements: {
    age: number;
    systolicBP: number;
    diastolicBP: number;
    cholesterol: number;
    bloodGlucose: number;
    bmi: number;
    smokingStatus: string;
    physicalActivity: string;
  };
  shapValues: ShapValue[];
}

// Mock SHAP values for the assessment
const getMockShapValues = (riskScore: number): ShapValue[] => {
  if (riskScore >= 60) {
    return [
      {
        featureName: "Systolic Blood Pressure",
        featureValue: "146 mmHg",
        shapValueHex: 18.5,
        percentageContribution: 28,
        explanation: "Elevated systolic pressure (above 130 mmHg) significantly increases arterial wall stress. Your reading of 146 mmHg is in Stage 2 hypertension range, contributing heavily to cardiovascular risk."
      },
      {
        featureName: "Age",
        featureValue: "52 years",
        shapValueHex: 12.3,
        percentageContribution: 19,
        explanation: "Age is a non-modifiable risk factor. Cardiovascular risk naturally increases with age due to arterial stiffening and cumulative exposure to risk factors."
      },
      {
        featureName: "Total Cholesterol",
        featureValue: "210 mg/dL",
        shapValueHex: 8.7,
        percentageContribution: 13,
        explanation: "High cholesterol (above 200 mg/dL) contributes to plaque formation in arteries. Your level of 210 mg/dL is in the borderline-high category."
      },
      {
        featureName: "BMI",
        featureValue: "28.6 kg/m²",
        shapValueHex: 5.2,
        percentageContribution: 8,
        explanation: "Being overweight (BMI 25-30) increases workload on the heart and is associated with higher blood pressure and cholesterol levels."
      },
      {
        featureName: "Physical Activity",
        featureValue: "Low",
        shapValueHex: 3.8,
        percentageContribution: 6,
        explanation: "Low physical activity reduces cardiovascular fitness and is associated with higher blood pressure and weight gain."
      },
      {
        featureName: "Blood Glucose",
        featureValue: "105 mg/dL",
        shapValueHex: 2.5,
        percentageContribution: 4,
        explanation: "Elevated fasting glucose (above 100 mg/dL) indicates prediabetes, which increases cardiovascular risk through vascular damage."
      },
      {
        featureName: "Smoking Status",
        featureValue: "Never",
        shapValueHex: -4.2,
        percentageContribution: -6,
        explanation: "Being a non-smoker is protective. Smoking is a major risk factor for cardiovascular disease."
      },
      {
        featureName: "HDL Cholesterol",
        featureValue: "55 mg/dL",
        shapValueHex: -2.8,
        percentageContribution: -4,
        explanation: "Good HDL cholesterol levels (above 40 mg/dL for men, 50 mg/dL for women) help remove harmful cholesterol from arteries."
      }
    ];
  } else if (riskScore >= 35) {
    return [
      {
        featureName: "Systolic Blood Pressure",
        featureValue: "138 mmHg",
        shapValueHex: 10.2,
        percentageContribution: 18,
        explanation: "Your systolic pressure is in the elevated range (130-139 mmHg). While not yet hypertensive, this increases cardiovascular strain."
      },
      {
        featureName: "Age",
        featureValue: "52 years",
        shapValueHex: 8.5,
        percentageContribution: 15,
        explanation: "Age is a non-modifiable risk factor. Cardiovascular risk naturally increases with age."
      },
      {
        featureName: "BMI",
        featureValue: "28.2 kg/m²",
        shapValueHex: 4.8,
        percentageContribution: 8,
        explanation: "Being overweight (BMI 25-30) increases workload on the heart."
      },
      {
        featureName: "Total Cholesterol",
        featureValue: "195 mg/dL",
        shapValueHex: 3.2,
        percentageContribution: 6,
        explanation: "Your cholesterol is near the optimal threshold (<200 mg/dL), but still a contributing factor."
      },
      {
        featureName: "Smoking Status",
        featureValue: "Never",
        shapValueHex: -5.1,
        percentageContribution: -9,
        explanation: "Being a non-smoker is strongly protective against cardiovascular disease."
      },
      {
        featureName: "Physical Activity",
        featureValue: "Moderate",
        shapValueHex: -3.5,
        percentageContribution: -6,
        explanation: "Moderate physical activity helps maintain cardiovascular health and weight management."
      }
    ];
  } else {
    return [
      {
        featureName: "Age",
        featureValue: "52 years",
        shapValueHex: 5.2,
        percentageContribution: 15,
        explanation: "Age is a non-modifiable risk factor but your other protective factors help mitigate this risk."
      },
      {
        featureName: "Smoking Status",
        featureValue: "Never",
        shapValueHex: -6.8,
        percentageContribution: -20,
        explanation: "Being a non-smoker is the strongest protective factor in your profile."
      },
      {
        featureName: "Blood Pressure",
        featureValue: "125/82 mmHg",
        shapValueHex: -3.5,
        percentageContribution: -10,
        explanation: "Your blood pressure is well-controlled in the normal range, reducing cardiovascular strain."
      },
      {
        featureName: "Physical Activity",
        featureValue: "Moderate",
        shapValueHex: -2.8,
        percentageContribution: -8,
        explanation: "Regular physical activity helps maintain heart health and weight management."
      }
    ];
  }
};

// Mock assessment data
const getMockAssessment = (id: string): AssessmentDetail | null => {
  const assessments: Record<string, AssessmentDetail> = {
    "1": {
      id: "1",
      date: "2025-06-01",
      riskScore: 68,
      riskLevel: "High",
      summary: "Elevated blood pressure and cholesterol levels detected. Immediate lifestyle modifications recommended.",
      measurements: {
        age: 52,
        systolicBP: 146,
        diastolicBP: 94,
        cholesterol: 210,
        bloodGlucose: 105,
        bmi: 28.6,
        smokingStatus: "never",
        physicalActivity: "low"
      },
      shapValues: getMockShapValues(68)
    },
    "2": {
      id: "2",
      date: "2025-05-15",
      riskScore: 42,
      riskLevel: "Intermediate",
      summary: "Moderate risk factors detected. Continue monitoring and consider lifestyle improvements.",
      measurements: {
        age: 52,
        systolicBP: 138,
        diastolicBP: 88,
        cholesterol: 195,
        bloodGlucose: 98,
        bmi: 28.2,
        smokingStatus: "never",
        physicalActivity: "moderate"
      },
      shapValues: getMockShapValues(42)
    }
  };
  
  return assessments[id] || null;
};

export default function AssessmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;
  
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<ShapValue | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = getMockAssessment(assessmentId);
      setAssessment(data);
      if (data?.shapValues.length) {
        setSelectedFeature(data.shapValues[0]);
      }
      setLoading(false);
    }, 500);
  }, [assessmentId]);

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

  // Separate positive/negative factors
  const riskBoosters = assessment?.shapValues
    .filter(s => s.shapValueHex > 0)
    .sort((a, b) => b.shapValueHex - a.shapValueHex) || [];

  const riskReducers = assessment?.shapValues
    .filter(s => s.shapValueHex <= 0)
    .sort((a, b) => a.shapValueHex - b.shapValueHex) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-xs text-zinc-500 mt-3">Loading SHAP analysis...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500">Assessment not found</p>
          <button 
            onClick={() => router.push('/patient/dashboard')}
            className="mt-3 text-emerald-600 hover:underline"
          >
            Back to Dashboard
          </button>
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
            onClick={() => router.push('/patient/history')}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Risk History
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">SHAP Analysis</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Explainable AI - Understanding your {new Date(assessment.date).toLocaleDateString()} assessment
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold border ${getRiskBadgeColor(assessment.riskLevel)}`}>
              {assessment.riskLevel} Risk • {assessment.riskScore}%
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-emerald-100 text-sm">Overall Cardiovascular Risk</p>
              <p className="text-5xl font-bold">{assessment.riskScore}%</p>
              <p className="text-emerald-100 text-sm mt-2">{assessment.summary}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-1" />
              <p className="text-sm">{new Date(assessment.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className="text-xs text-zinc-500">Blood Pressure</p>
            <p className="text-xl font-bold text-zinc-800">{assessment.measurements.systolicBP}/{assessment.measurements.diastolicBP}</p>
            <p className="text-xs text-zinc-400">mmHg</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className="text-xs text-zinc-500">Cholesterol</p>
            <p className="text-xl font-bold text-zinc-800">{assessment.measurements.cholesterol}</p>
            <p className="text-xs text-zinc-400">mg/dL</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className="text-xs text-zinc-500">Blood Glucose</p>
            <p className="text-xl font-bold text-zinc-800">{assessment.measurements.bloodGlucose}</p>
            <p className="text-xs text-zinc-400">mg/dL</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className="text-xs text-zinc-500">BMI</p>
            <p className="text-xl font-bold text-zinc-800">{assessment.measurements.bmi}</p>
            <p className="text-xs text-zinc-400">kg/m²</p>
          </div>
        </div>

        {/* SHAP Explanation Component */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-zinc-800 text-base">XGBoost & SHAP Attribution Logic</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                Explainable AI
              </span>
            </div>

            <p className="text-xs text-zinc-500 leading-normal max-w-2xl mb-6">
              SHAP (Shapley Additive exPlanations) distributes credit among each cardiovascular biomarker. 
              <strong className="text-rose-600 ml-1">Red indicators</strong> reflect factors driving your risk <strong className="text-rose-600">UPWARD</strong>. 
              <strong className="text-emerald-600 ml-1">Green indicators</strong> reflect protective factors driving risk <strong className="text-emerald-600">DOWNWARD</strong>.
            </p>

            {/* Grid container */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              
              {/* Graph Columns */}
              <div className="lg:col-span-3 space-y-5">
                
                {/* Risk Boosters Segment */}
                {riskBoosters.length > 0 && (
                  <div className="space-y-3.5">
                    <span className="inline-flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Risk Amplifiers (↑ Increases Risk)</span>
                    </span>
                    
                    <div className="space-y-3">
                      {riskBoosters.map((shap, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedFeature(shap)}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            selectedFeature?.featureName === shap.featureName
                              ? 'border-rose-200 bg-rose-50/50 shadow-sm'
                              : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/30 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-1.5">
                            <span>{shap.featureName}</span>
                            <span className="text-rose-600 font-mono">+{shap.shapValueHex}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (shap.percentageContribution / 30) * 100)}%` }}
                              className="h-full bg-rose-500 rounded-full"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">{shap.featureValue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Reducers Segment */}
                {riskReducers.length > 0 && (
                  <div className="space-y-3.5 border-t border-zinc-100 pt-5">
                    <span className="inline-flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span>Protective Factors (↓ Decreases Risk)</span>
                    </span>

                    <div className="space-y-3">
                      {riskReducers.map((shap, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedFeature(shap)}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            selectedFeature?.featureName === shap.featureName
                              ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
                              : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/30 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-1.5">
                            <span>{shap.featureName}</span>
                            <span className="text-emerald-700 font-mono">{shap.shapValueHex}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (Math.abs(shap.percentageContribution) / 30) * 100)}%` }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">{shap.featureValue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Explainer Card */}
              <div className="lg:col-span-2">
                {selectedFeature ? (
                  <div className="sticky top-24 rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-sm bg-white">
                    <div className="flex items-center space-x-2.5">
                      <HelpCircle className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-bold text-zinc-800 text-sm">Biomarker Explanation</h4>
                    </div>

                    <div className="border-t border-zinc-100 pt-3 space-y-2">
                      <div className="text-[9px] text-zinc-400 font-extrabold uppercase">Target Feature</div>
                      <div className="font-bold text-zinc-800 text-base">
                        {selectedFeature.featureName}
                      </div>
                      <div className="inline-flex items-center space-x-2 rounded-lg bg-zinc-50 border border-zinc-200 py-1.5 px-2.5">
                        <span className="text-zinc-500 text-xs font-semibold">Value:</span>
                        <span className="font-mono text-zinc-800 font-bold">{selectedFeature.featureValue}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-zinc-100 pt-3">
                      <div className="text-[9px] text-zinc-400 font-extrabold uppercase">Impact</div>
                      <div className={`text-base font-bold flex items-center space-x-1.5 ${
                        selectedFeature.shapValueHex > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {selectedFeature.shapValueHex > 0 ? (
                          <>
                            <ShieldAlert className="h-4.5 w-4.5" />
                            <span>+{selectedFeature.shapValueHex}% Risk Increase</span>
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="h-4.5 w-4.5" />
                            <span>{selectedFeature.shapValueHex}% Risk Decrease</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 mt-2.5">
                        {selectedFeature.explanation}
                      </p>
                    </div>

                    <div className="text-[10px] text-zinc-400 font-bold text-center pt-1 bg-zinc-50 py-2 rounded-lg border border-zinc-200">
                      Click any factor above to see detailed explanation
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 bg-zinc-50">
                    Select a factor to view explanation
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Clinical Recommendations
          </h3>
          <div className="space-y-2 text-sm text-amber-700">
            <p>• {assessment.riskLevel === 'High' ? 'Schedule a follow-up with your clinician within 2 weeks' : 'Continue regular monitoring every 3 months'}</p>
            <p>• Focus on the red factors above - these are the biggest contributors to your risk</p>
            <p>• Maintain the green protective factors - they are helping lower your risk</p>
          </div>
        </div>
      </div>
    </div>
  );
}