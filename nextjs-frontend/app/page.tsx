import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Shield, Clock, Users, Phone, Mail, MapPin, ChevronRight, Activity, Smile, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span className="text-xl font-bold text-blue-700">Salama AI</span>
          </Link>
          
          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-blue-600 font-medium">Home</Link>
            <Link href="/about" className="text-slate-600 hover:text-blue-600 font-medium">About</Link>
            <Link href="/how-it-works" className="text-slate-600 hover:text-blue-600 font-medium">How It Works</Link>
            <Link href="/contact" className="text-slate-600 hover:text-blue-600 font-medium">Contact</Link>
          </nav>
          
          {/* Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/patient/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5 mb-6">
              <Heart className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Free for Kenyans</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Know Your Heart{" "}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Health
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed">
              Salama AI helps you understand your heart disease risk in simple terms. 
              No medical jargon. Just clear answers and helpful guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/patient/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-blue-200">
                  Check Your Risk Free
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="border-2 px-8 py-6 text-lg rounded-2xl">
                  How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              ✓ No cost  ✓ Secure  ✓ Takes 2 minutes
            </p>
          </div>
          
          {/* Right Image/Illustration */}
          <div className="flex-1 flex justify-center">
            <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl p-8 text-center max-w-sm">
              <Heart className="w-20 h-20 text-red-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">24.5% of Kenyans have high blood pressure</p>
              <p className="text-sm text-slate-400 mt-2">Most don't know it. Let's change that.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Simple Icons */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Why Salama AI?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Simple, free, and designed for you — not for doctors
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-blue-50/50 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smile className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Easy to Understand</h3>
              <p className="text-slate-500">We explain your risk in plain English — no confusing medical terms</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-teal-50/50 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Quick & Easy</h3>
              <p className="text-slate-500">Takes just 2 minutes to get your personalized risk assessment</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-green-50/50 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Your Data is Safe</h3>
              <p className="text-slate-500">We protect your privacy — no sharing your information</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Three simple steps to understand your heart health
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-200">1</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Answer Simple Questions</h3>
              <p className="text-slate-500 text-sm">Age, blood pressure, lifestyle — things you already know</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-teal-200">2</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Get Your Results</h3>
              <p className="text-slate-500 text-sm">We show your risk level in a simple color-coded meter</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-green-200">3</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Understand & Act</h3>
              <p className="text-slate-500 text-sm">We explain what you can do to lower your risk</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Trust Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold mb-4">Trusted By</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <span className="text-xl font-semibold text-slate-400">JKUAT</span>
            <span className="text-xl font-semibold text-slate-400">Kenya MoH</span>
            <span className="text-xl font-semibold text-slate-400">CHWs Nationwide</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-teal-600 mx-4 rounded-3xl mb-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Check Your Heart Health?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            It's free, it's fast, and it could save your life.
          </p>
          <Link href="/patient/dashboard">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl">
              Start Your Free Check
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-red-400" />
                <span className="text-xl font-bold text-white">Salama AI</span>
              </div>
              <p className="text-sm">AI-powered heart health for every Kenyan.</p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> salama@jkuat.ac.ke</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +254 XXX XXX XXX</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Nairobi, Kenya</li>
              </ul>
            </div>
            
            {/* Newsletter / Social */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <span className="text-sm">Coming soon on social media</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Salama AI. SALAMAAI.COM, INC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}