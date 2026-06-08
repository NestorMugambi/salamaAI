"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Send, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setIsSubmitted(false), 5000);
  };

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
              <Link href="/how-it-works" className="text-zinc-600 hover:text-emerald-600 font-medium">How It Works</Link>
              <Link href="/contact" className="text-emerald-600 font-medium">Contact</Link>
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
            Contact <span className="text-emerald-600">Us</span>
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
                <h2 className="text-xl font-bold text-zinc-900 mb-6">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-zinc-800">Email</p>
                      <p className="text-sm text-zinc-500">salama@jkuat.ac.ke</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-zinc-800">Phone</p>
                      <p className="text-sm text-zinc-500">+254 (0) 123 456 789</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-zinc-800">Location</p>
                      <p className="text-sm text-zinc-500">
                        Jomo Kenyatta University of Agriculture and Technology<br />
                        Nairobi, Kenya
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6">
                <h3 className="font-bold text-zinc-900 mb-2">Emergency?</h3>
                <p className="text-sm text-zinc-600 mb-3">
                  If you're experiencing chest pain, shortness of breath, or other emergency symptoms, please call emergency services immediately.
                </p>
                <p className="font-bold text-emerald-700">Call 911 or 999</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-zinc-200">
                <h2 className="text-xl font-bold text-zinc-900 mb-6">Send Us a Message</h2>
                
                {isSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-bold text-emerald-800 mb-1">Message Sent!</h3>
                    <p className="text-sm text-emerald-600">We'll get back to you within 48 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="What is this regarding?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Message *</label>
                      <textarea
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-zinc-500">Quick answers to common questions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-800 mb-1">Is Salama AI free?</h3>
              <p className="text-sm text-zinc-500">Yes! Salama AI is completely free for Kenyan patients and public health facilities.</p>
            </div>
            <div className="p-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-800 mb-1">How accurate is the risk prediction?</h3>
              <p className="text-sm text-zinc-500">Our XGBoost model achieves ~85% accuracy, comparable to leading clinical tools.</p>
            </div>
            <div className="p-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-800 mb-1">Is my data secure?</h3>
              <p className="text-sm text-zinc-500">Yes, we use encryption and follow strict privacy protocols. Your data is never shared.</p>
            </div>
            <div className="p-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-800 mb-1">Can clinicians use this?</h3>
              <p className="text-sm text-zinc-500">Absolutely! Clinicians have a dedicated dashboard to monitor patients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 to-teal-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to check your heart health?</h2>
          <Link href="/login">
            <button className="bg-white text-emerald-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition">
              Get Started
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