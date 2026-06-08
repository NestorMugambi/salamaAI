"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Sliders, Check, ArrowRight, HeartHandshake, Loader2, ArrowLeft } from 'lucide-react';

// Types
interface UserProfile {
  fullName: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  smokingStatus: string;
  diabetesStatus: string;
  physicalActivity: string;
  stressLevel: number;
  sleepQuality: string;
}

interface HealthMeasurements {
  age: number;
  height: number;
  weight: number;
  smokingStatus: string;
  diabetesStatus: string;
  physicalActivity: string;
  stressLevel: number;
  sleepQuality: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  cholesterol: number;
  bloodGlucose: number;
}

// Mock profile for development
const mockProfile: UserProfile = {
  fullName: "Mary Wanjiku",
  email: "mary.wanjiku@example.com",
  age: 52,
  height: 165,
  weight: 78,
  smokingStatus: "never",
  diabetesStatus: "no",
  physicalActivity: "low",
  stressLevel: 3,
  sleepQuality: "good"
};

// Mock result data (would come from API response)
const generateMockResult = (measurements: HealthMeasurements) => {
  // Simple risk calculation for demo
  let riskScore = 10;
  if (measurements.systolicBP > 130) riskScore += (measurements.systolicBP - 130) * 0.5;
  if (measurements.diastolicBP > 85) riskScore += (measurements.diastolicBP - 85) * 0.3;
  if (measurements.cholesterol > 200) riskScore += (measurements.cholesterol - 200) * 0.2;
  if (measurements.bloodGlucose > 100) riskScore += (measurements.bloodGlucose - 100) * 0.3;
  if (measurements.age > 50) riskScore += (measurements.age - 50) * 0.5;
  if (measurements.smokingStatus === 'active') riskScore += 15;
  if (measurements.physicalActivity === 'low') riskScore += 8;
  
  riskScore = Math.min(Math.max(Math.round(riskScore), 5), 95);
  
  let riskCategory = 'Low';
  if (riskScore >= 60) riskCategory = 'High';
  else if (riskScore >= 35) riskCategory = 'Intermediate';
  else if (riskScore >= 15) riskCategory = 'Borderline';
  
  return {
    id: Date.now().toString(),
    cvdRiskPercentage: riskScore,
    riskCategory,
    summary: `${riskCategory} risk of cardiovascular disease detected based on your health metrics.`,
    measurements: {
      systolicBP: measurements.systolicBP,
      diastolicBP: measurements.diastolicBP,
      cholesterol: measurements.cholesterol,
      bloodGlucose: measurements.bloodGlucose,
      smokingStatus: measurements.smokingStatus,
      age: measurements.age
    },
    recommendations: [
      riskCategory === 'High' ? 'Schedule a follow-up with your clinician within 2 weeks' : 'Continue regular monitoring every 3 months',
      'Monitor blood pressure regularly at home',
      riskScore > 30 ? 'Consider dietary changes to lower cholesterol' : 'Maintain your current healthy diet',
      'Aim for at least 30 minutes of physical activity daily'
    ],
    shapValues: [
      { featureName: "Systolic Blood Pressure", featureValue: `${measurements.systolicBP} mmHg`, shapValueHex: measurements.systolicBP > 130 ? 15 : 5, percentageContribution: 25, explanation: "Elevated systolic pressure increases arterial wall stress." },
      { featureName: "Age", featureValue: `${measurements.age} years`, shapValueHex: measurements.age > 50 ? 12 : 4, percentageContribution: 20, explanation: "Cardiovascular risk naturally increases with age." },
      { featureName: "Cholesterol", featureValue: `${measurements.cholesterol} mg/dL`, shapValueHex: measurements.cholesterol > 200 ? 10 : 3, percentageContribution: 18, explanation: "High cholesterol contributes to plaque formation." },
      { featureName: "Physical Activity", featureValue: measurements.physicalActivity, shapValueHex: measurements.physicalActivity === 'low' ? 8 : -5, percentageContribution: measurements.physicalActivity === 'low' ? 15 : -10, explanation: "Regular physical activity is protective against heart disease." }
    ]
  };
};

export default function HealthMeasurementFormsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);

  // Fetch user profile on load
  useEffect(() => {
    // TODO: Replace with actual API call
    setProfile(mockProfile);
  }, []);

  // Pull default values from active user profile parameters
  const [age, setAge] = useState(profile.age);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [smokingStatus, setSmokingStatus] = useState(profile.smokingStatus);
  const [diabetesStatus, setDiabetesStatus] = useState(profile.diabetesStatus);
  const [physicalActivity, setPhysicalActivity] = useState(profile.physicalActivity);
  const [stressLevel, setStressLevel] = useState(profile.stressLevel);
  const [sleepQuality, setSleepQuality] = useState(profile.sleepQuality);

  // Core biometric inputs
  const [systolicBP, setSystolicBP] = useState(128);
  const [diastolicBP, setDiastolicBP] = useState(82);
  const [heartRate, setHeartRate] = useState(72);
  const [cholesterol, setCholesterol] = useState(195);
  const [bloodGlucose, setBloodGlucose] = useState(95);

  // Update form when profile loads
  useEffect(() => {
    setAge(profile.age);
    setHeight(profile.height);
    setWeight(profile.weight);
    setSmokingStatus(profile.smokingStatus);
    setDiabetesStatus(profile.diabetesStatus);
    setPhysicalActivity(profile.physicalActivity);
    setStressLevel(profile.stressLevel);
    setSleepQuality(profile.sleepQuality);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const measurements: HealthMeasurements = {
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      smokingStatus,
      diabetesStatus,
      physicalActivity,
      stressLevel: Number(stressLevel),
      sleepQuality,
      systolicBP: Number(systolicBP),
      diastolicBP: Number(diastolicBP),
      heartRate: Number(heartRate),
      cholesterol: Number(cholesterol),
      bloodGlucose: Number(bloodGlucose),
    };

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/predictions/predictions/run', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(measurements)
      // });
      // const result = await response.json();
      
      console.log("Submitting measurements:", measurements);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock result
      const result = generateMockResult(measurements);
      
      // Store result in sessionStorage to pass to results page
      sessionStorage.setItem('lastAssessmentResult', JSON.stringify(result));
      
      // Redirect to results page with the assessment ID
      router.push(`/patient/results?id=${result.id}`);
    } catch (error) {
      console.error("Error submitting measurements:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Health Data
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-xl">
          
          {/* Header */}
          <div className="flex items-center space-x-3.5 border-b border-zinc-200 pb-5 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest">
                New Evaluation Session
              </span>
              <h2 className="text-xl font-extrabold text-zinc-900 mt-1.5">Launch New Cardiovascular Scan</h2>
              <p className="text-xs text-zinc-500 mt-1 font-semibold">
                Enter current physiological telemetry parameters. Results are processed instantly through our diagnostic intelligence engine.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Main measurements grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Blood Pressure (Systolic) */}
              <div className="space-y-2 border border-zinc-200 p-4 rounded-2xl bg-zinc-50/40 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Systolic BP (mmHg)</label>
                  <span className="font-mono text-[9px] text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">Ref: 120</span>
                </div>
                <input
                  type="number"
                  min="70"
                  max="240"
                  required
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                />
                <div className="text-[10px] text-zinc-500 font-semibold">Arterial pressure during contraction (ideal is below 120).</div>
              </div>

              {/* Blood Pressure (Diastolic) */}
              <div className="space-y-2 border border-zinc-200 p-4 rounded-2xl bg-zinc-50/40 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Diastolic BP (mmHg)</label>
                  <span className="font-mono text-[9px] text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">Ref: 80</span>
                </div>
                <input
                  type="number"
                  min="40"
                  max="150"
                  required
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                />
                <div className="text-[10px] text-zinc-500 font-semibold">Arterial pressure during relaxation (ideal is below 80).</div>
              </div>

              {/* Cholesterol */}
              <div className="space-y-2 border border-zinc-200 p-4 rounded-2xl bg-zinc-50/40 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Serum Cholesterol (mg/dL)</label>
                  <span className="font-mono text-[9px] text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">Ref: &lt;200</span>
                </div>
                <input
                  type="number"
                  min="100"
                  max="450"
                  required
                  value={cholesterol}
                  onChange={(e) => setCholesterol(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                />
                <div className="text-[10px] text-zinc-500 font-semibold">Total systemic lipid loading (elevated if above 200).</div>
              </div>

              {/* Fasting Glucose */}
              <div className="space-y-2 border border-zinc-200 p-4 rounded-2xl bg-zinc-50/40 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Fasting Glucose (mg/dL)</label>
                  <span className="font-mono text-[9px] text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">Ref: &lt;100</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="400"
                  required
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                />
                <div className="text-[10px] text-zinc-500 font-semibold">Fasting glucose concentration (prediabetic reads above 100).</div>
              </div>

              {/* Resting Heart Rate */}
              <div className="space-y-2 border border-zinc-200 p-4 rounded-2xl bg-zinc-50/40 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Resting Heart Rate (BPM)</label>
                  <span className="font-mono text-[9px] text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">Range: 60-90</span>
                </div>
                <input
                  type="number"
                  min="40"
                  max="180"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                />
                <div className="text-[10px] text-zinc-500 font-semibold">Pacemaker contractions per minute under rested baseline.</div>
              </div>

              {/* Profile Summary Card */}
              <div className="space-y-2 border border-emerald-200 p-4 rounded-2xl bg-emerald-50/40">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 mb-2">Your Profile Data</span>
                  <p className="text-[10px] text-zinc-600 leading-relaxed font-semibold">
                    Your profile variables are preset as:
                  </p>
                  <div className="mt-2.5 text-[10px] font-mono space-y-1 text-zinc-700 font-bold">
                    <div>• Age: <strong className="text-zinc-900">{age} years</strong></div>
                    <div>• Height & Weight: <strong className="text-zinc-900">{height}cm, {weight}kg</strong></div>
                    <div>• Smoking: <strong className="text-zinc-900 capitalize">{smokingStatus}</strong></div>
                    <div>• Diabetes: <strong className="text-zinc-900 capitalize">{diabetesStatus}</strong></div>
                    <div>• Activity: <strong className="text-zinc-900 capitalize">{physicalActivity}</strong></div>
                  </div>
                </div>
                <div className="text-[9px] font-extrabold text-emerald-700 flex items-center space-x-1 mt-2.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Update in Settings if needed</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-200 pt-6 gap-4">
              <div className="text-[10px] text-zinc-500 font-sans max-w-md flex items-start space-x-2">
                <HeartHandshake className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">
                  By requesting the scan, parameters are routed through AI predictors and SHAP explanations.
                </span>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-6 py-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 active:scale-95 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit CVD Scan</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}