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
  Stethoscope,
  Users,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  type: 'virtual' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  location?: string;
  notes?: string;
  reason?: string;
}

// Mock appointments data for clinician
const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Mary Wanjiku",
    patientEmail: "mary.wanjiku@example.com",
    patientPhone: "+254 712 345 678",
    date: "2025-06-15",
    time: "10:00 AM",
    type: "in-person",
    status: "scheduled",
    location: "Nairobi Heart Clinic, Suite 204",
    reason: "Follow-up on hypertension management",
    notes: "Patient has elevated BP readings"
  },
  {
    id: "2",
    patientName: "John Otieno",
    patientEmail: "john.otieno@example.com",
    patientPhone: "+254 723 456 789",
    date: "2025-06-15",
    time: "11:30 AM",
    type: "virtual",
    status: "scheduled",
    reason: "Initial consultation for CVD risk assessment",
    notes: "New patient - review recent lab results"
  },
  {
    id: "3",
    patientName: "Sarah Kimani",
    patientEmail: "sarah.kimani@example.com",
    patientPhone: "+254 734 567 890",
    date: "2025-06-16",
    time: "2:00 PM",
    type: "in-person",
    status: "scheduled",
    location: "Karen Medical Centre, 3rd Floor",
    reason: "Medication review and BP check",
    notes: "Check if current medication is effective"
  },
  {
    id: "4",
    patientName: "James Mwangi",
    patientEmail: "james.mwangi@example.com",
    patientPhone: "+254 745 678 901",
    date: "2025-06-10",
    time: "9:00 AM",
    type: "virtual",
    status: "completed",
    reason: "Routine check-up",
    notes: "Patient doing well, continue current plan"
  },
  {
    id: "5",
    patientName: "Grace Akinyi",
    patientEmail: "grace.akinyi@example.com",
    patientPhone: "+254 756 789 012",
    date: "2025-06-05",
    time: "3:00 PM",
    type: "in-person",
    status: "cancelled",
    location: "Nairobi Heart Clinic, Suite 204",
    reason: "Stress test results review",
    notes: "Patient cancelled - reschedule needed"
  }
];

// Available time slots
const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
];

export default function ClinicianAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    date: "",
    time: "",
    type: "virtual" as 'virtual' | 'in-person',
    reason: "",
    notes: "",
    location: ""
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'virtual' ? Video : MapPin;
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/clinicians/clinicians/me/appointments/${appointmentId}`, {
        //   method: 'PATCH',
        //   body: JSON.stringify({ status: 'cancelled' })
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

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setScheduleForm({
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      reason: appointment.reason || "",
      notes: appointment.notes || "",
      location: appointment.location || ""
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedAppointment) {
        // Reschedule existing
        // TODO: PATCH /api/clinicians/clinicians/me/appointments/{id}
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === selectedAppointment.id 
              ? { ...apt, date: scheduleForm.date, time: scheduleForm.time, status: 'scheduled' }
              : apt
          )
        );
        setSuccessMessage("Appointment rescheduled successfully");
      } else {
        // New appointment
        // TODO: POST /api/clinicians/clinicians/me/appointments
        const newAppointment: Appointment = {
          id: Date.now().toString(),
          patientName: scheduleForm.patientName,
          patientEmail: scheduleForm.patientEmail,
          patientPhone: scheduleForm.patientPhone,
          date: scheduleForm.date,
          time: scheduleForm.time,
          type: scheduleForm.type,
          status: 'scheduled',
          location: scheduleForm.location,
          reason: scheduleForm.reason,
          notes: scheduleForm.notes
        };
        setAppointments(prev => [newAppointment, ...prev]);
        setSuccessMessage("Appointment scheduled successfully");
      }
      
      setShowScheduleModal(false);
      setSelectedAppointment(null);
      setScheduleForm({
        patientName: "", patientEmail: "", patientPhone: "", date: "", time: "",
        type: "virtual", reason: "", notes: "", location: ""
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to save appointment");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const viewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const upcomingCount = appointments.filter(a => a.status === 'scheduled').length;
  const todayCount = appointments.filter(a => a.status === 'scheduled' && a.date === new Date().toISOString().split('T')[0]).length;

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/clinician/dashboard')}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">Appointments</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage patient appointments and schedules</p>
            </div>
            <button
              onClick={() => {
                setSelectedAppointment(null);
                setScheduleForm({
                  patientName: "", patientEmail: "", patientPhone: "", date: "", time: "",
                  type: "virtual", reason: "", notes: "", location: ""
                });
                setShowScheduleModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              <Plus className="h-4 w-4" />
              Schedule Appointment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Scheduled</p>
                <p className="text-3xl font-bold text-zinc-800">{upcomingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Today's Appointments</p>
                <p className="text-3xl font-bold text-zinc-800">{todayCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Patients</p>
                <p className="text-3xl font-bold text-zinc-800">
                  {new Set(appointments.map(a => a.patientEmail)).size}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Appointments</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Patient</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Date & Time</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Reason</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredAppointments.map((apt) => {
                  const TypeIcon = getTypeIcon(apt.type);
                  return (
                    <tr key={apt.id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-semibold text-zinc-800">{apt.patientName}</p>
                          <p className="text-xs text-zinc-500">{apt.patientEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-sm">{new Date(apt.date).toLocaleDateString()}</span>
                          <Clock className="h-3.5 w-3.5 text-zinc-400 ml-2" />
                          <span className="text-sm">{apt.time}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <TypeIcon className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm capitalize">{apt.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-zinc-600 max-w-xs truncate">{apt.reason || '—'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewAppointmentDetails(apt)}
                            className="p-1 hover:bg-zinc-100 rounded-lg text-emerald-600"
                            title="View Details"
                          >
                            <Stethoscope className="h-4 w-4" />
                          </button>
                          {apt.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleReschedule(apt)}
                                className="p-1 hover:bg-zinc-100 rounded-lg text-blue-600"
                                title="Reschedule"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="p-1 hover:bg-zinc-100 rounded-lg text-rose-600"
                                title="Cancel"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredAppointments.length === 0 && (
            <div className="py-12 text-center">
              <Calendar className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">No appointments found</p>
            </div>
          )}
        </div>

        {/* Schedule/Reschedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-zinc-200 p-5 flex justify-between items-center">
                <h2 className="font-bold text-zinc-800">
                  {selectedAppointment ? 'Reschedule Appointment' : 'Schedule New Appointment'}
                </h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1 hover:bg-zinc-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleScheduleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.patientName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, patientName: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={scheduleForm.patientEmail}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, patientEmail: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={scheduleForm.patientPhone}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, patientPhone: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Time *</label>
                    <select
                      required
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Appointment Type *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="virtual"
                        checked={scheduleForm.type === "virtual"}
                        onChange={() => setScheduleForm({ ...scheduleForm, type: "virtual" })}
                        className="text-emerald-600"
                      />
                      <Video className="h-4 w-4" />
                      <span>Virtual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="in-person"
                        checked={scheduleForm.type === "in-person"}
                        onChange={() => setScheduleForm({ ...scheduleForm, type: "in-person" })}
                        className="text-emerald-600"
                      />
                      <MapPin className="h-4 w-4" />
                      <span>In-person</span>
                    </label>
                  </div>
                </div>

                {scheduleForm.type === "in-person" && (
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                      placeholder="e.g., Nairobi Heart Clinic, Suite 204"
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Reason for Visit</label>
                  <textarea
                    rows={2}
                    value={scheduleForm.reason}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, reason: e.target.value })}
                    placeholder="e.g., Follow-up on hypertension, Initial consultation..."
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Clinical Notes (internal)</label>
                  <textarea
                    rows={2}
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    placeholder="Any notes for the appointment..."
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
                  >
                    {selectedAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="border-b border-zinc-200 p-5 flex justify-between items-center">
                <h2 className="font-bold text-zinc-800">Appointment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 hover:bg-zinc-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-800">{selectedAppointment.patientName}</p>
                    <p className="text-sm text-zinc-500">{selectedAppointment.patientEmail}</p>
                    <p className="text-sm text-zinc-500">{selectedAppointment.patientPhone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Date & Time</p>
                  <p className="text-zinc-800">{new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Type</p>
                  <p className="capitalize">{selectedAppointment.type}</p>
                </div>

                {selectedAppointment.location && (
                  <div>
                    <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Location</p>
                    <p>{selectedAppointment.location}</p>
                  </div>
                )}

                {selectedAppointment.reason && (
                  <div>
                    <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Reason</p>
                    <p className="text-sm">{selectedAppointment.reason}</p>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Notes</p>
                    <p className="text-sm italic">{selectedAppointment.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleReschedule(selectedAppointment);
                        }}
                        className="flex-1 rounded-xl border border-blue-200 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => {
                          handleCancelAppointment(selectedAppointment.id);
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 rounded-xl border border-rose-200 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}