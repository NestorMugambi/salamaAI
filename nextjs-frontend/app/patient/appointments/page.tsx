"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Plus, 
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from 'lucide-react';

interface Appointment {
  id: string;
  clinicianName: string;
  clinicianSpecialty: string;
  clinicianEmail: string;
  clinicianPhone: string;
  date: string;
  time: string;
  type: 'virtual' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
  location?: string;
  notes?: string;
}

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    clinicianName: "Dr. Sarah Kimani",
    clinicianSpecialty: "Cardiologist",
    clinicianEmail: "sarah.kimani@salama.ai",
    clinicianPhone: "+254 712 345 678",
    date: "2025-06-15",
    time: "10:00 AM",
    type: "in-person",
    status: "upcoming",
    location: "Nairobi Heart Clinic, Suite 204, Nairobi",
    notes: "Please bring your recent blood pressure readings"
  },
  {
    id: "2",
    clinicianName: "Dr. James Otieno",
    clinicianSpecialty: "General Physician",
    clinicianEmail: "james.otieno@salama.ai",
    clinicianPhone: "+254 723 456 789",
    date: "2025-06-22",
    time: "2:30 PM",
    type: "virtual",
    status: "upcoming",
    notes: "Video call link will be sent via email"
  },
  {
    id: "3",
    clinicianName: "Dr. Mercy Wanjiku",
    clinicianSpecialty: "Endocrinologist",
    clinicianEmail: "mercy.wanjiku@salama.ai",
    clinicianPhone: "+254 734 567 890",
    date: "2025-05-10",
    time: "11:00 AM",
    type: "in-person",
    status: "completed",
    location: "Karen Medical Centre, 3rd Floor, Nairobi"
  }
];

// Available clinicians for booking
const availableClinicians = [
  { id: "c1", name: "Dr. Sarah Kimani", specialty: "Cardiologist", email: "sarah.kimani@salama.ai", phone: "+254 712 345 678" },
  { id: "c2", name: "Dr. James Otieno", specialty: "General Physician", email: "james.otieno@salama.ai", phone: "+254 723 456 789" },
  { id: "c3", name: "Dr. Mercy Wanjiku", specialty: "Endocrinologist", email: "mercy.wanjiku@salama.ai", phone: "+254 734 567 890" },
  { id: "c4", name: "Dr. Peter Mwangi", specialty: "Cardiologist", email: "peter.mwangi@salama.ai", phone: "+254 745 678 901" }
];

export default function PatientAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingType, setBookingType] = useState<"virtual" | "in-person">("virtual");
  const [bookingNotes, setBookingNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'virtual' ? Video : MapPin;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/appointments/appointments/me/${appointmentId}`, {
        //   method: 'DELETE'
        // });
        
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled' } 
              : apt
          )
        );
        setSuccessMessage("Appointment cancelled successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        setErrorMessage("Failed to cancel appointment");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinician || !bookingDate || !bookingTime) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/appointments/appointments/book', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     clinician_id: selectedClinician.id,
      //     date: bookingDate,
      //     time: bookingTime,
      //     type: bookingType,
      //     notes: bookingNotes
      //   })
      // });

      const newAppointment: Appointment = {
        id: Date.now().toString(),
        clinicianName: selectedClinician.name,
        clinicianSpecialty: selectedClinician.specialty,
        clinicianEmail: selectedClinician.email,
        clinicianPhone: selectedClinician.phone,
        date: bookingDate,
        time: bookingTime,
        type: bookingType,
        status: 'upcoming',
        location: bookingType === 'in-person' ? "To be confirmed" : undefined,
        notes: bookingNotes
      };
      
      setAppointments(prev => [newAppointment, ...prev]);
      setShowBookingModal(false);
      setSelectedClinician(null);
      setBookingDate("");
      setBookingTime("");
      setBookingType("virtual");
      setBookingNotes("");
      setSuccessMessage("Appointment booked successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to book appointment");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-xs text-zinc-500 mt-3">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/patient/dashboard')}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">My Appointments</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage your upcoming and past appointments</p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              <Plus className="h-4 w-4" />
              Book Appointment
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Upcoming Appointments
          </h2>
          
          {upcomingAppointments.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
              <Calendar className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">No upcoming appointments</p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="mt-3 text-emerald-600 text-sm font-semibold hover:underline"
              >
                Book an appointment →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => {
                const TypeIcon = getTypeIcon(apt.type);
                return (
                  <div key={apt.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-emerald-50 p-3 rounded-xl">
                          <Stethoscope className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-800">{apt.clinicianName}</h3>
                          <p className="text-sm text-emerald-600">{apt.clinicianSpecialty}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{apt.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TypeIcon className="h-3.5 w-3.5" />
                              <span className="capitalize">{apt.type}</span>
                            </div>
                          </div>
                          {apt.location && (
                            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {apt.location}
                            </p>
                          )}
                          {apt.notes && (
                            <p className="text-xs text-zinc-400 mt-2 italic">"{apt.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-400" />
              Past Appointments
            </h2>
            <div className="space-y-3">
              {pastAppointments.map((apt) => {
                const TypeIcon = getTypeIcon(apt.type);
                return (
                  <div key={apt.id} className="rounded-xl border border-zinc-200 bg-white p-4 opacity-75">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-zinc-100 p-2 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-800">{apt.clinicianName}</h3>
                          <p className="text-xs text-zinc-500">{apt.clinicianSpecialty}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-zinc-500">
                            <span>{new Date(apt.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{apt.time}</span>
                            <span>•</span>
                            <span className="capitalize">{apt.type}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-zinc-200 p-4 flex justify-between items-center">
                <h2 className="font-bold text-zinc-800">Book an Appointment</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-1 hover:bg-zinc-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleBookAppointment} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Select Clinician *</label>
                  <select
                    required
                    value={selectedClinician?.id || ""}
                    onChange={(e) => {
                      const clinician = availableClinicians.find(c => c.id === e.target.value);
                      setSelectedClinician(clinician);
                    }}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select a clinician</option>
                    {availableClinicians.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.specialty}</option>
                    ))}
                  </select>
                </div>

                {selectedClinician && (
                  <div className="bg-emerald-50 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-emerald-800">{selectedClinician.name}</p>
                    <p className="text-emerald-600 text-xs">{selectedClinician.specialty}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700">
                      <Mail className="h-3 w-3" />
                      <span>{selectedClinician.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                      <Phone className="h-3 w-3" />
                      <span>{selectedClinician.phone}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Time *</label>
                    <select
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select time</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Appointment Type *</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="virtual"
                        checked={bookingType === "virtual"}
                        onChange={() => setBookingType("virtual")}
                        className="text-emerald-600"
                      />
                      <Video className="h-4 w-4" />
                      <span>Virtual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="in-person"
                        checked={bookingType === "in-person"}
                        onChange={() => setBookingType("in-person")}
                        className="text-emerald-600"
                      />
                      <MapPin className="h-4 w-4" />
                      <span>In-person</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Additional Notes</label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any specific concerns or questions..."
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}