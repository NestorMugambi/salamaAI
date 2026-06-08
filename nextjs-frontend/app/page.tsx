"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Activity, LineChart, ShieldCheck, ArrowRight, BrainCircuit, HeartHandshake, Phone, Mail, MapPin, ChevronRight, Clock, Smile, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  const handlePatientStart = () => {
    router.push("/login?bypass=true");
  };

  const handleClinicianDemo = () => {
    localStorage.setItem("access_token", "dev_token");
    localStorage.setItem("user_role", "clinician");
    localStorage.setItem("user_email", "clinician@salama.ai");
    router.push("/clinician/dashboard");
  };

  return (
    <div className="bg-slate-50 text-zinc-900 min-h-screen">
      
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <span className="text-xl font-bold text-emerald-700">Salama AI</span>
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-zinc-600 hover:text-emerald-600 font-medium">Home</Link>
              <Link href="/about" className="text-zinc-600 hover:text-emerald-600 font-medium">About</Link>
              <Link href="/how-it-works" className="text-zinc-600 hover:text-emerald-600 font-medium">How It Works</Link>
              <Link href="/contact" className="text-zinc-600 hover:text-emerald-600 font-medium">Contact</Link>
            </nav>
            
            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePatientStart}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center border-b border-zinc-200 pb-16">
            {/* Column 1 - Copy */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                <BrainCircuit className="h-3.5 w-3.5 text-emerald-600" />
                <span>Explainable AI in Clinical Practice</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
                CVD Risk Prediction <br />
                <span className="text-emerald-600">Perfectly Explained.</span>
              </h1>
              <p className="font-sans text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                Salama AI guides cardiovascular medicine forward. Securely project 10-year coronary disease hazards, demystify predictive decisions using SHAP waterfall graphs, and sync findings instantly to medical caregivers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handlePatientStart}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition cursor-pointer"
                >
                  <span>Evaluate My CVD Risk</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={handleClinicianDemo}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-white border border-zinc-200 px-6 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer shadow-sm"
                >
                  <span>Enter Clinician Suite</span>
                </button>
              </div>
              <div className="flex items-center space-x-6 text-xs text-zinc-400 font-mono mt-8">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>PostgreSQL Sync</span>
                </div>
                <div>•</div>
                <div>XGBoost Risk Matrices</div>
                <div>•</div>
                <div>SHAP Explainability</div>
              </div>
            </div>

            {/* Column 2 - Interactive Mock Preview */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl leading-none text-left">
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 opacity-60 shadow-[0_0_15px_rgba(244,63,94,0.3)]"></div>
                
                <div className="flex items-center justify-between border-b border-zinc-150 pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    <span className="font-display font-bold text-zinc-800 text-sm">CVD Vector Inference</span>
                  </div>
                  <span className="rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[9px] font-bold text-rose-700 tracking-wider uppercase">
                    Stage 2 Alert
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="block font-sans text-xs text-zinc-400">Predicted CVD Risk</span>
                      <span className="font-display text-4xl font-extrabold text-zinc-900 tracking-tight">68%</span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100/60 px-2.5 py-1 rounded-lg">High Risk Matrix</span>
                  </div>

                  {/* SHAP Bar Chart Mock */}
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                      <span>Feature Impact Analysis</span>
                      <span className="text-rose-600 font-bold">SHAP Value</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-700 font-medium">
                        <span>Systolic BP (146 mmHg)</span>
                        <span className="text-rose-600 font-bold">+18%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full w-[78%] bg-rose-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-700 font-medium">
                        <span>Active Smoker</span>
                        <span className="text-rose-600 font-bold">+16%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full w-[65%] bg-rose-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-700 font-medium">
                        <span>Physical Activity (None)</span>
                        <span className="text-amber-600 font-bold">+11%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full w-[45%] bg-amber-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-700 font-medium">
                        <span>Age Metric (58 yrs)</span>
                        <span className="text-rose-600 font-bold">+15%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full w-[60%] bg-rose-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <p className="font-sans text-[11px] text-zinc-500 italic leading-normal border-t border-zinc-150 pt-3">
                    "Patient metrics exhibit heavy synergistic macrovascular risk modifiers. Immediate tobacco counseling and hypertension triage is advised."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-zinc-100/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-900">
              The Salama Predictive Workflow
            </h2>
            <p className="font-sans text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto">
              How health metrics progress seamlessly from clinical logs to explainable medical indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-12 sm:mt-16 text-left">
            <div className="space-y-4 border border-zinc-200 bg-white p-6 rounded-2xl hover:border-zinc-300 shadow-sm transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-md">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900">1. Medical Telemetry</h3>
              <p className="font-sans text-xs sm:text-sm text-zinc-500 leading-normal">
                Patients easily declare clinical metrics including cholesterol counts, blood pressure, glucose registers, and BMI weight ratios.
              </p>
            </div>

            <div className="space-y-4 border border-zinc-200 bg-white p-6 rounded-2xl hover:border-zinc-300 shadow-sm transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold shadow-md">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900">2. AI Prediction</h3>
              <p className="font-sans text-xs sm:text-sm text-zinc-500 leading-normal">
                XGBoost projects precise 10-year probabilities using explainable AI values alongside clinical recommendations.
              </p>
            </div>

            <div className="space-y-4 border border-zinc-200 bg-white p-6 rounded-2xl hover:border-zinc-300 shadow-sm transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-md">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900">3. Clinician Integration</h3>
              <p className="font-sans text-xs sm:text-sm text-zinc-500 leading-normal">
                Caregivers are instantly notified of high-risk outliers, allowing physicians to view detail cards and adjust therapeutics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">24.5%</div>
              <div className="text-zinc-500">Hypertension prevalence in Kenya</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">&lt;16%</div>
              <div className="text-zinc-500">Current awareness rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">XGBoost + SHAP</div>
              <div className="text-zinc-500">Explainable AI engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Salama AI Section */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Why Salama AI?</h2>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              Simple, free, and designed for you — not for doctors
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white hover:shadow-lg transition border border-zinc-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smile className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-2">Easy to Understand</h3>
              <p className="text-zinc-500">We explain your risk in plain English — no confusing medical terms</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white hover:shadow-lg transition border border-zinc-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-2">Quick & Easy</h3>
              <p className="text-zinc-500">Takes just 2 minutes to get your personalized risk assessment</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white hover:shadow-lg transition border border-zinc-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-2">Your Data is Safe</h3>
              <p className="text-zinc-500">We protect your privacy — no sharing your information</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 to-teal-600 mx-4 rounded-3xl mb-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Check Your Heart Health?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            It's free, it's fast, and it could save your life.
          </p>
          <button
            onClick={handlePatientStart}
            className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl font-bold shadow-lg transition cursor-pointer"
          >
            Start Your Free Check
            <ChevronRight className="inline ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-red-400" />
                <span className="text-xl font-bold text-white">Salama AI</span>
              </div>
              <p className="text-sm">AI-powered heart health for every Kenyan.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> salama@jkuat.ac.ke</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +254 XXX XXX XXX</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Nairobi, Kenya</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <span className="text-sm">Coming soon on social media</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Salama AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}