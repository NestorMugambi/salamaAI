"use client";

import Link from 'next/link';
import { Heart, Activity, Shield, Users, Target, Award, ArrowRight, CheckCircle } from 'lucide-react';

export default function AboutPage() {
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
              <Link href="/about" className="text-emerald-600 font-medium">About</Link>
              <Link href="/how-it-works" className="text-zinc-600 hover:text-emerald-600 font-medium">How It Works</Link>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-emerald-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
            About <span className="text-emerald-600">Salama AI</span>
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Transforming cardiovascular healthcare in Kenya through explainable artificial intelligence
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Our Mission</h2>
              <p className="text-zinc-600 mb-4 leading-relaxed">
                To democratize access to cardiovascular risk assessment by providing 
                <strong className="text-emerald-700"> free, explainable, and trustworthy AI-powered tools</strong> 
                for every Kenyan, regardless of their location or economic status.
              </p>
              <p className="text-zinc-600 mb-6 leading-relaxed">
                We believe that early detection of cardiovascular risk should not be a luxury. 
                By combining cutting-edge machine learning with transparent explanations, 
                we empower healthcare workers and patients to make informed decisions about heart health.
              </p>
              <div className="flex items-center gap-2 text-emerald-600">
                <Target className="h-5 w-5" />
                <span className="font-semibold">SDG 3: Good Health & Well-being</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 text-center">
              <Heart className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <p className="text-emerald-800 font-semibold">"Prevention is better than cure"</p>
              <p className="text-emerald-600 text-sm mt-2">— Kenyan Proverb</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">The Problem We're Solving</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Cardiovascular disease is a growing crisis in Kenya
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">24.5%</div>
              <p className="text-zinc-600">of Kenyan adults have hypertension</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-rose-600 mb-2">&lt;16%</div>
              <p className="text-zinc-600">are aware of their condition</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-amber-600 mb-2">&lt;3%</div>
              <p className="text-zinc-600">have their blood pressure controlled</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-emerald-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">How Salama AI Helps</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Our platform addresses these challenges through innovative technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Early Detection</h3>
              <p className="text-zinc-600 text-sm">Identify at-risk patients before they develop serious complications.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Explainable AI</h3>
              <p className="text-zinc-600 text-sm">Understand why a patient is at risk with transparent SHAP explanations.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Accessible Care</h3>
              <p className="text-zinc-600 text-sm">Free for Kenyan public health use, designed for low-resource settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Our Team</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Dedicated to improving heart health in Kenya
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-emerald-600">NM</span>
              </div>
              <h3 className="font-bold text-zinc-900">Nestor Mugambi</h3>
              <p className="text-sm text-zinc-500">Project Lead</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-emerald-600">AN</span>
              </div>
              <h3 className="font-bold text-zinc-900">Anthony Njuguna</h3>
              <p className="text-sm text-zinc-500">Frontend Developer</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-emerald-600">NS</span>
              </div>
              <h3 className="font-bold text-zinc-900">Nathan Sikalo</h3>
              <p className="text-sm text-zinc-500">Backend Developer</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-emerald-600">JM</span>
              </div>
              <h3 className="font-bold text-zinc-900">Julius Mwangi</h3>
              <p className="text-sm text-zinc-500">ML & XAI Specialist</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-zinc-500">Supervised by Prof. Waweru Mwangi & Dr. Richard Rimiru</p>
            <p className="text-sm text-zinc-500">Jomo Kenyatta University of Agriculture and Technology</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 to-teal-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to take control of your heart health?</h2>
          <p className="text-emerald-100 mb-6">Join Salama AI today — free for Kenyan patients</p>
          <Link href="/login">
            <button className="bg-white text-emerald-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition">
              Get Started Free
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