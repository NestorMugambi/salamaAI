"use client";

import Link from 'next/link';
import { Heart, Activity, TrendingUp, Clipboard, Bell, Shield, ArrowRight, CheckCircle, Brain, FileText, UserCheck } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <span className="text-xl font-bold text-emerald-700">Salama AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-zinc-600 hover:text-emerald-600 font-medium">Home</Link>
              <Link href="/about" className="text-zinc-600 hover:text-emerald-600 font-medium">About</Link>
              <Link href="/how-it-works" className="text-emerald-600 font-medium">How It Works</Link>
              <Link href="/contact" className="text-zinc-600 hover:text-emerald-600 font-medium">Contact</Link>
            </nav>
            <Link href="/login">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium transition">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-white text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
            How <span className="text-emerald-600">Salama AI</span> Works
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Three simple steps to understand your cardiovascular risk
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-xl font-bold text-xl mb-4">1</div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-3">Enter Your Health Data</h2>
                <p className="text-zinc-600 mb-3">
                  Simply input your basic health information including:
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Blood pressure readings</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Age and basic demographics</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Lifestyle factors (smoking, activity)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Cholesterol and glucose levels (if available)</li>
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 w-full max-w-sm">
                  <Clipboard className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                  <p className="text-center text-sm text-zinc-500">Simple form • Takes 2 minutes • No medical knowledge required</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1 text-center md:text-right">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-xl font-bold text-xl mb-4">2</div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-3">AI Analyzes Your Risk</h2>
                <p className="text-zinc-600 mb-3">
                  Our XGBoost machine learning model processes your data and:
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-center gap-2 justify-end"><span>Calculates your 10-year CVD risk score</span><CheckCircle className="h-4 w-4 text-emerald-600" /></li>
                  <li className="flex items-center gap-2 justify-end"><span>Evaluates multiple disease risks (CVD, Hypertension, Stroke, CHD)</span><CheckCircle className="h-4 w-4 text-emerald-600" /></li>
                  <li className="flex items-center gap-2 justify-end"><span>Generates SHAP explanations for transparency</span><CheckCircle className="h-4 w-4 text-emerald-600" /></li>
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 w-full max-w-sm">
                  <Brain className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                  <p className="text-center text-sm text-zinc-500">Powered by XGBoost • Explainable AI • 85%+ accuracy</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-xl font-bold text-xl mb-4">3</div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-3">Get Results & Take Action</h2>
                <p className="text-zinc-600 mb-3">
                  Receive a clear, understandable report that shows:
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Your risk score with color-coded meter</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Top factors affecting your risk (with SHAP explanations)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Personalized recommendations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Option to share with your clinician</li>
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 w-full max-w-sm">
                  <FileText className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                  <p className="text-center text-sm text-zinc-500">Clear explanation • Actionable advice • Share with your doctor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Clinicians */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 rounded-3xl p-8 text-center">
            <UserCheck className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">For Healthcare Providers</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto mb-6">
              Clinicians can monitor patient populations, receive high-risk alerts, and access detailed SHAP explanations for each patient.
            </p>
            <Link href="/clinician/dashboard">
              <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
                Clinician Dashboard
                <ArrowRight className="inline ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8">Powered By</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">XGBoost</div>
              <p className="text-xs text-zinc-500">Gradient Boosting</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">SHAP</div>
              <p className="text-xs text-zinc-500">Explainable AI</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">Next.js</div>
              <p className="text-xs text-zinc-500">Frontend</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">FastAPI</div>
              <p className="text-xs text-zinc-500">Backend API</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">PostgreSQL</div>
              <p className="text-xs text-zinc-500">Database</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 to-teal-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to check your heart health?</h2>
          <p className="text-emerald-100 mb-6">It's free, it's fast, and it could save your life</p>
          <Link href="/login">
            <button className="bg-white text-emerald-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition">
              Get Started Now
              <ArrowRight className="inline ml-2 h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Salama AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}