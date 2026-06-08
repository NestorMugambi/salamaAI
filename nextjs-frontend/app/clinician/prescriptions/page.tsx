"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Pill, 
  Plus, 
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  Search,
  Calendar,
  User,
  FileText,
  Printer,
  Clock,
  Users,
  Activity,
  Mail,
  Phone
} from 'lucide-react';

interface Prescription {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  refills: number;
  prescribedDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Mock patients data
const mockPatients: Patient[] = [
  { id: "p1", name: "Mary Wanjiku", email: "mary.wanjiku@example.com", phone: "+254 712 345 678" },
  { id: "p2", name: "John Otieno", email: "john.otieno@example.com", phone: "+254 723 456 789" },
  { id: "p3", name: "Sarah Kimani", email: "sarah.kimani@example.com", phone: "+254 734 567 890" },
  { id: "p4", name: "James Mwangi", email: "james.mwangi@example.com", phone: "+254 745 678 901" },
];

// Mock prescriptions data
const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    patientName: "Mary Wanjiku",
    patientEmail: "mary.wanjiku@example.com",
    patientPhone: "+254 712 345 678",
    medicationName: "Lisinopril",
    dosage: "10 mg",
    frequency: "Once daily",
    duration: "30 days",
    quantity: 30,
    instructions: "Take one tablet by mouth every morning with or without food.",
    refills: 2,
    prescribedDate: "2025-06-01",
    status: "active",
    notes: "Monitor blood pressure regularly"
  },
  {
    id: "2",
    patientName: "John Otieno",
    patientEmail: "john.otieno@example.com",
    patientPhone: "+254 723 456 789",
    medicationName: "Atorvastatin",
    dosage: "20 mg",
    frequency: "Once daily",
    duration: "90 days",
    quantity: 90,
    instructions: "Take one tablet by mouth every evening.",
    refills: 1,
    prescribedDate: "2025-05-15",
    status: "active",
    notes: "Check liver function tests in 3 months"
  },
  {
    id: "3",
    patientName: "Sarah Kimani",
    patientEmail: "sarah.kimani@example.com",
    patientPhone: "+254 734 567 890",
    medicationName: "Metformin",
    dosage: "500 mg",
    frequency: "Twice daily",
    duration: "60 days",
    quantity: 120,
    instructions: "Take with meals to reduce gastrointestinal side effects.",
    refills: 3,
    prescribedDate: "2025-05-20",
    status: "active",
    notes: "Monitor blood glucose levels"
  },
  {
    id: "4",
    patientName: "Mary Wanjiku",
    patientEmail: "mary.wanjiku@example.com",
    patientPhone: "+254 712 345 678",
    medicationName: "Amlodipine",
    dosage: "5 mg",
    frequency: "Once daily",
    duration: "30 days",
    quantity: 30,
    instructions: "Take one tablet by mouth every morning.",
    refills: 1,
    prescribedDate: "2025-05-10",
    status: "completed",
    notes: "Patient tolerated well"
  },
  {
    id: "5",
    patientName: "James Mwangi",
    patientEmail: "james.mwangi@example.com",
    patientPhone: "+254 745 678 901",
    medicationName: "Hydrochlorothiazide",
    dosage: "25 mg",
    frequency: "Once daily",
    duration: "30 days",
    quantity: 30,
    instructions: "Take in the morning to avoid nighttime urination.",
    refills: 0,
    prescribedDate: "2025-04-01",
    status: "expired",
    notes: "Patient needs follow-up"
  }
];

// Common medications list
const commonMedications = [
  { name: "Lisinopril", dosage: "10 mg", type: "ACE Inhibitor" },
  { name: "Amlodipine", dosage: "5 mg", type: "Calcium Channel Blocker" },
  { name: "Atorvastatin", dosage: "20 mg", type: "Statin" },
  { name: "Metformin", dosage: "500 mg", type: "Biguanide" },
  { name: "Hydrochlorothiazide", dosage: "25 mg", type: "Diuretic" },
  { name: "Losartan", dosage: "50 mg", type: "ARB" },
  { name: "Carvedilol", dosage: "6.25 mg", type: "Beta Blocker" },
  { name: "Clopidogrel", dosage: "75 mg", type: "Antiplatelet" },
  { name: "Warfarin", dosage: "5 mg", type: "Anticoagulant" },
  { name: "Furosemide", dosage: "40 mg", type: "Loop Diuretic" },
];

export default function ClinicianPrescriptions() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [patients] = useState<Patient[]>(mockPatients);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled' | 'expired'>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Prescription form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    medicationName: "",
    dosage: "",
    frequency: "Once daily",
    duration: "30 days",
    quantity: 30,
    instructions: "",
    refills: 0,
    notes: ""
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'expired': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const handleSelectPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setPrescriptionForm({
        ...prescriptionForm,
        patientId: patient.id,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone
      });
    }
  };

  const handleSelectMedication = (medication: typeof commonMedications[0]) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicationName: medication.name,
      dosage: medication.dosage
    });
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prescriptionForm.patientName || !prescriptionForm.medicationName || !prescriptionForm.dosage) {
      setErrorMessage("Please fill in all required fields");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/clinicians/clinicians/me/prescriptions', {
      //   method: 'POST',
      //   body: JSON.stringify(prescriptionForm)
      // });

      const newPrescription: Prescription = {
        id: Date.now().toString(),
        patientName: prescriptionForm.patientName,
        patientEmail: prescriptionForm.patientEmail,
        patientPhone: prescriptionForm.patientPhone,
        medicationName: prescriptionForm.medicationName,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        duration: prescriptionForm.duration,
        quantity: prescriptionForm.quantity,
        instructions: prescriptionForm.instructions,
        refills: prescriptionForm.refills,
        prescribedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: prescriptionForm.notes
      };
      
      setPrescriptions(prev => [newPrescription, ...prev]);
      setShowPrescribeModal(false);
      setPrescriptionForm({
        patientId: "", patientName: "", patientEmail: "", patientPhone: "",
        medicationName: "", dosage: "", frequency: "Once daily", duration: "30 days",
        quantity: 30, instructions: "", refills: 0, notes: ""
      });
      setSuccessMessage("Prescription created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to create prescription");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleCancelPrescription = async (prescriptionId: string) => {
    if (confirm("Are you sure you want to cancel this prescription?")) {
      try {
        setPrescriptions(prev => 
          prev.map(p => 
            p.id === prescriptionId 
              ? { ...p, status: 'cancelled' } 
              : p
          )
        );
        setSuccessMessage("Prescription cancelled");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        setErrorMessage("Failed to cancel prescription");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const viewPrescriptionDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesPatient = selectedPatient === 'all' || 
                          (selectedPatient === p.patientEmail);
    return matchesSearch && matchesStatus && matchesPatient;
  });

  const activeCount = prescriptions.filter(p => p.status === 'active').length;
  const totalPatients = new Set(prescriptions.map(p => p.patientEmail)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-xs text-zinc-500 mt-3">Loading prescriptions...</p>
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
              <h1 className="text-2xl font-bold text-zinc-800">Prescriptions</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage patient medications and prescriptions</p>
            </div>
            <button
              onClick={() => setShowPrescribeModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              <Plus className="h-4 w-4" />
              New Prescription
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Active Prescriptions</p>
                <p className="text-3xl font-bold text-zinc-800">{activeCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Pill className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Patients</p>
                <p className="text-3xl font-bold text-zinc-800">{totalPatients}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Prescriptions</p>
                <p className="text-3xl font-bold text-zinc-800">{prescriptions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by patient or medication..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Patients</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.email}>{patient.name}</option>
              ))}
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

        {/* Prescriptions Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Patient</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Medication</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Dosage & Frequency</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Prescribed Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPrescriptions.map((pres) => (
                  <tr key={pres.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-semibold text-zinc-800">{pres.patientName}</p>
                        <p className="text-xs text-zinc-500">{pres.patientEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-800">{pres.medicationName}</p>
                      <p className="text-xs text-zinc-500">{pres.dosage}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm">{pres.frequency}</p>
                      <p className="text-xs text-zinc-500">for {pres.duration}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm">{new Date(pres.prescribedDate).toLocaleDateString()}</p>
                      <p className="text-xs text-zinc-500">{pres.refills} refills left</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(pres.status)}`}>
                        {pres.status.charAt(0).toUpperCase() + pres.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewPrescriptionDetails(pres)}
                          className="p-1 hover:bg-zinc-100 rounded-lg text-emerald-600"
                          title="View Details"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        {pres.status === 'active' && (
                          <button
                            onClick={() => handleCancelPrescription(pres.id)}
                            className="p-1 hover:bg-zinc-100 rounded-lg text-rose-600"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPrescriptions.length === 0 && (
            <div className="py-12 text-center">
              <Pill className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">No prescriptions found</p>
            </div>
          )}
        </div>

        {/* New Prescription Modal */}
        {showPrescribeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-zinc-200 p-5 flex justify-between items-center">
                <h2 className="font-bold text-zinc-800">New Prescription</h2>
                <button
                  onClick={() => setShowPrescribeModal(false)}
                  className="p-1 hover:bg-zinc-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitPrescription} className="p-5 space-y-5">
                {/* Select Patient */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Select Patient *</label>
                  <select
                    required
                    value={prescriptionForm.patientId}
                    onChange={(e) => handleSelectPatient(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select a patient --</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name} - {patient.email}</option>
                    ))}
                  </select>
                </div>

                {prescriptionForm.patientName && (
                  <div className="bg-emerald-50 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-emerald-800">{prescriptionForm.patientName}</p>
                    <div className="flex gap-3 mt-1 text-xs text-emerald-700">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {prescriptionForm.patientEmail}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {prescriptionForm.patientPhone}</span>
                    </div>
                  </div>
                )}

                {/* Select Medication */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Medication *</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {commonMedications.slice(0, 6).map(med => (
                      <button
                        key={med.name}
                        type="button"
                        onClick={() => handleSelectMedication(med)}
                        className="text-left px-3 py-2 rounded-lg border border-zinc-200 text-sm hover:border-emerald-300 hover:bg-emerald-50 transition"
                      >
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-zinc-500">{med.dosage} - {med.type}</p>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Medication name"
                      required
                      value={prescriptionForm.medicationName}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicationName: e.target.value })}
                      className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g., 10 mg)"
                      required
                      value={prescriptionForm.dosage}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                      className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Frequency</label>
                    <select
                      value={prescriptionForm.frequency}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Every 8 hours</option>
                      <option>Every 12 hours</option>
                      <option>As needed (PRN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Duration</label>
                    <select
                      value={prescriptionForm.duration}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={prescriptionForm.quantity}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, quantity: parseInt(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Refills</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={prescriptionForm.refills}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refills: parseInt(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Take with food, avoid grapefruit..."
                    value={prescriptionForm.instructions}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Clinical Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Internal notes..."
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescribeModal(false)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Create Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Prescription Details Modal */}
        {showDetailsModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="border-b border-zinc-200 p-5 flex justify-between items-center">
                <h2 className="font-bold text-zinc-800">Prescription Details</h2>
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
                    <p className="font-bold text-zinc-800">{selectedPrescription.patientName}</p>
                    <p className="text-sm text-zinc-500">{selectedPrescription.patientEmail}</p>
                    <p className="text-sm text-zinc-500">{selectedPrescription.patientPhone}</p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 font-bold mb-1">Medication</p>
                  <p className="text-lg font-bold text-zinc-800">{selectedPrescription.medicationName}</p>
                  <p className="text-sm">{selectedPrescription.dosage} - {selectedPrescription.frequency}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-400 font-bold">Duration</p>
                    <p className="text-sm font-medium">{selectedPrescription.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-bold">Quantity</p>
                    <p className="text-sm font-medium">{selectedPrescription.quantity} tablets</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-bold">Refills</p>
                    <p className="text-sm font-medium">{selectedPrescription.refills} remaining</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-bold">Prescribed Date</p>
                    <p className="text-sm font-medium">{new Date(selectedPrescription.prescribedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedPrescription.instructions && (
                  <div>
                    <p className="text-xs text-zinc-400 font-bold">Instructions</p>
                    <p className="text-sm">{selectedPrescription.instructions}</p>
                  </div>
                )}

                {selectedPrescription.notes && (
                  <div>
                    <p className="text-xs text-zinc-400 font-bold">Notes</p>
                    <p className="text-sm italic">{selectedPrescription.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      if (selectedPrescription.status === 'active') {
                        handleCancelPrescription(selectedPrescription.id);
                      }
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                      selectedPrescription.status === 'active'
                        ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {selectedPrescription.status === 'active' ? 'Cancel Prescription' : 'Close'}
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