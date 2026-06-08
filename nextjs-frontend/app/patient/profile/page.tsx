"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Save, Sliders, ArrowLeft, CheckCircle } from 'lucide-react';

// Types
interface UserProfile {
  fullName: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  smokingStatus: 'never' | 'former' | 'active';
  diabetesStatus: 'none' | 'prediabetes' | 'type1' | 'type2';
  physicalActivity: 'none' | 'low' | 'moderate' | 'high';
  stressLevel: 'low' | 'medium' | 'high';
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  on_bp_medication?: boolean;
  bp_medication_type?: string;
}

// Mock profile for development
const mockProfile: UserProfile = {
  fullName: "Mary Wanjiku",
  email: "mary.wanjiku@example.com",
  age: 52,
  gender: "female",
  height: 165,
  weight: 78,
  smokingStatus: "never",
  diabetesStatus: "none",
  physicalActivity: "low",
  stressLevel: "medium",
  sleepQuality: "fair",
  on_bp_medication: false,
  bp_medication_type: "none"
};

export default function ProfileManagementPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [fullName, setFullName] = useState(profile.fullName);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [smokingStatus, setSmokingStatus] = useState(profile.smokingStatus);
  const [diabetesStatus, setDiabetesStatus] = useState(profile.diabetesStatus);
  const [physicalActivity, setPhysicalActivity] = useState(profile.physicalActivity);
  const [stressLevel, setStressLevel] = useState(profile.stressLevel);
  const [sleepQuality, setSleepQuality] = useState(profile.sleepQuality);
  const [onBpMedication, setOnBpMedication] = useState(profile.on_bp_medication || false);
  const [bpMedicationType, setBpMedicationType] = useState(profile.bp_medication_type || 'none');

  // Fetch profile on load
  useEffect(() => {
    // TODO: Replace with actual API call
    // fetch('/api/profile/profiles/').then(res => res.json()).then(data => {
    //   setProfile(data);
    //   // Update form state...
    // });
    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile = {
      ...profile,
      fullName,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      smokingStatus,
      diabetesStatus,
      physicalActivity,
      stressLevel,
      sleepQuality,
      on_bp_medication: onBpMedication,
      bp_medication_type: bpMedicationType,
    };

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/profile/profiles/', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedProfile)
      // });
      
      console.log("Saving profile:", updatedProfile);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  };

  const handleBack = () => {
    router.push('/patient/health-data');
  };

  // Calculate BMI
  const calculateBMI = () => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-xs text-zinc-500 mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center space-x-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 group cursor-pointer transition"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Health Data</span>
        </button>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl">
          
          {/* Header */}
          <div className="flex items-center space-x-3.5 border-b border-zinc-200 pb-5 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">Cardiovascular Baseline Profile</h2>
              <p className="text-xs text-zinc-500 mt-1 font-semibold">
                Adjust your biological and habit baseline descriptors; these values initialize new CVD risk scans automatically.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3.5 text-xs text-emerald-700 font-bold">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
              <span>Success: Baseline cardiac biomarkers updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Biographical Baselines */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3.5">1. Biographical Baselines</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Age (Years)</label>
                    <input
                      type="number"
                      min="18"
                      max="110"
                      required
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Sex</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Anthropometrics */}
            <div className="border-t border-zinc-200 pt-5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3.5">2. Anthropometrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    required
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                  />
                </div>
              </div>
              <div className="mt-3.5 text-right">
                <span className="text-[10.5px] text-zinc-500 font-semibold">
                  BMI: <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-1 font-bold">{calculateBMI()}</span>
                </span>
              </div>
            </div>

            {/* 3. Behavioral Risk Markers */}
            <div className="border-t border-zinc-200 pt-5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3.5">3. Behavioral Risk Markers</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Smoking Status</label>
                  <select
                    value={smokingStatus}
                    onChange={(e) => setSmokingStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="never">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="active">Active Smoker</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Diabetes Status</label>
                  <select
                    value={diabetesStatus}
                    onChange={(e) => setDiabetesStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="none">No Diabetes</option>
                    <option value="prediabetes">Prediabetes</option>
                    <option value="type1">Type-1 Diabetes</option>
                    <option value="type2">Type-2 Diabetes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Physical Activity</label>
                  <select
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="none">Sedentary (No regular exercise)</option>
                    <option value="low">Low (Occasional walks)</option>
                    <option value="moderate">Moderate (2-3 workouts/week)</option>
                    <option value="high">High (4+ intensive workouts/week)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Stress Level</label>
                    <select
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-2 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Sleep Quality</label>
                    <select
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-2 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Cardiovascular Therapeutics */}
            <div className="border-t border-zinc-200 pt-5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3.5">4. Cardiovascular Therapeutics</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">BP Medication Status</label>
                  <label className="flex items-center space-x-3 rounded-xl bg-zinc-50 p-3.5 border border-zinc-200 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/20 transition">
                    <input 
                      type="checkbox" 
                      checked={onBpMedication}
                      onChange={e => setOnBpMedication(e.target.checked)}
                      className="rounded border-zinc-300 text-emerald-600 h-4 w-4 cursor-pointer" 
                    />
                    <span className="text-xs text-zinc-700 font-bold">Taking Blood Pressure medication</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Medication Type</label>
                  <select 
                    value={bpMedicationType}
                    onChange={e => setBpMedicationType(e.target.value)}
                    disabled={!onBpMedication}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="none">None / No active drugs</option>
                    <option value="beta-blockers">Beta-blockers (e.g. Metoprolol)</option>
                    <option value="ace-inhibitors">ACE Inhibitors (e.g. Lisinopril)</option>
                    <option value="calcium-channel-blockers">Calcium Channel Blockers (e.g. Amlodipine)</option>
                    <option value="diuretics">Thiazide Diuretics (e.g. Hydrochlorothiazide)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex border-t border-zinc-200 pt-6">
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-95 ml-auto"
              >
                <Save className="h-4 w-4" />
                <span>Save Cardiac Baseline</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}