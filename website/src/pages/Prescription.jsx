import React, { useState, useEffect } from 'react';
import { Search, User, FileText, Printer, Edit2, Plus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FirestoreService from '../services/firestore';
import PrescriptionModal from '../components/PrescriptionModal';
import PrintablePrescription from '../components/PrintablePrescription';
// import toast from 'react-hot-toast';

const Prescription = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // For Editing Prescriptions
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [activeVisit, setActiveVisit] = useState(null);
  const [isNewVisit, setIsNewVisit] = useState(false);
  
  // For Printing
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    const unsubscribe = FirestoreService.getConsultations((data) => {
      const grouped = {};
      data.forEach(consult => {
        const phone = consult.phone;
        if (!phone) return;
        if (!grouped[phone]) {
          grouped[phone] = {
            patientName: consult.patientName || consult.patient,
            phone: phone,
            age: consult.age,
            visits: []
          };
        }
        grouped[phone].visits.push(consult);
      });
      const patientsArray = Object.values(grouped).sort((a, b) => a.patientName?.localeCompare(b.patientName));
      setPatients(patientsArray);
      setFilteredPatients(patientsArray);
      
      // Update selected patient if it exists
      if (selectedPatient) {
        const updated = patientsArray.find(p => p.phone === selectedPatient.phone);
        if (updated) setSelectedPatient(updated);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, [selectedPatient?.phone]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredPatients(patients.filter(p => 
      p.patientName?.toLowerCase().includes(term) || 
      p.phone?.includes(term)
    ));
  }, [searchTerm, patients]);

  const handleEditPrescription = (visit) => {
    setActiveVisit(visit);
    setIsNewVisit(false);
    setShowPrescriptionModal(true);
  };

  const handleNewPrescription = () => {
    if (!selectedPatient) return;
    setActiveVisit({
      patientName: selectedPatient.patientName,
      patient: selectedPatient.patientName,
      phone: selectedPatient.phone,
      age: selectedPatient.age,
      date: new Date().toISOString().split('T')[0],
      clinic: 'Clinic (New Prescription)',
      medication: []
    });
    setIsNewVisit(true);
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async (meds) => {
    if (!activeVisit) return;
    try {
      if (isNewVisit) {
        await FirestoreService.addConsultation({
          ...activeVisit,
          medication: meds
        });
        alert('New prescription added successfully!');
      } else {
        await FirestoreService.updateConsultation(activeVisit.id, {
          medication: meds
        });
        alert('Prescription updated successfully!');
      }
      setShowPrescriptionModal(false);
      setActiveVisit(null);
      setIsNewVisit(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save prescription');
    }
  };

  const handlePrint = (visit, patient) => {
    const printPayload = {
      ...visit,
      patientName: patient.patientName,
      phone: patient.phone,
      age: patient.age
    };
    setPrintData(printPayload);
    setShowPrintPreview(true);
  };

  const executePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* 1. Purely Printable Area - strictly hidden on screen, block on print */}
      <div className="hidden print:block print:absolute print:inset-0 print:w-full print:bg-white print:z-[999999]">
        <PrintablePrescription data={printData} />
      </div>

      {/* 2. On-screen Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-[99999] bg-black/90 overflow-y-auto flex flex-col items-center pt-24 pb-10 print:hidden">
          <div className="fixed top-24 right-8 flex gap-4 z-[100000]">
            <button 
              onClick={executePrint}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center gap-2"
            >
              <Printer size={18} /> Print Now
            </button>
            <button 
              onClick={() => setShowPrintPreview(false)}
              className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all"
            >
              Close Preview
            </button>
          </div>
          <div 
            className="text-black shadow-2xl relative shrink-0"
            style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', border: '10px solid blue' }}
          >
            <PrintablePrescription data={printData} />
          </div>
        </div>
      )}

      {/* 3. Main UI */}
      <div className={`flex flex-col md:flex-row gap-6 print:hidden ${showPrintPreview ? 'hidden' : ''}`}>
        {/* Left Sidebar: Patient List */}
        <div className={`w-full ${selectedPatient ? 'hidden md:block' : 'block'} md:w-80 lg:w-96 flex flex-col gap-4 shrink-0`}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold font-outfit">Prescriptions</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-glass-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 pb-20">
            {filteredPatients.map(patient => (
              <button
                key={patient.phone}
                onClick={() => setSelectedPatient(patient)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  selectedPatient?.phone === patient.phone 
                  ? 'glass-panel !bg-primary/20 !border-primary shadow-lg' 
                  : 'glass-panel hover:!border-primary/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedPatient?.phone === patient.phone ? 'bg-primary text-white' : 'bg-slate-800 text-primary'
                }`}>
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-white">{patient.patientName || 'Unknown Patient'}</div>
                  <div className="text-xs text-text-muted truncate">{patient.phone}</div>
                </div>
                <div className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded-lg text-primary whitespace-nowrap">
                  {patient.visits.length} Visit{patient.visits.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-text-muted text-sm">
                No patients found.
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Patient History */}
        <div className={`flex-1 ${!selectedPatient ? 'hidden md:flex' : 'flex'} flex-col min-w-0`}>
          {!selectedPatient ? (
            <div className="glass-panel flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-glass-border">
                <FileText size={32} className="text-text-muted" />
              </div>
              <h2 className="text-xl font-bold mb-2">Select a Patient</h2>
              <p className="text-text-muted text-sm max-w-md">
                Select a patient from the list to view their consultation history, prescribe medicines, and print prescriptions.
              </p>
            </div>
          ) : (
            <div className="glass-panel flex-1 p-0 flex flex-col overflow-hidden relative">
              {/* Header */}
              <div className="p-6 border-b border-glass-border bg-slate-900/50 flex items-center gap-4 sticky top-0 z-10">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="md:hidden p-2 bg-slate-800 rounded-lg text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{selectedPatient.patientName}</h2>
                  <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                    <span>Phone: {selectedPatient.phone}</span>
                    <span>Age: {selectedPatient.age || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Visits List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <FileText size={16} /> Consultation History
                  </h3>
                  <button 
                    onClick={handleNewPrescription}
                    className="py-2 px-4 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 transition-all font-bold text-xs"
                  >
                    + New Prescription
                  </button>
                </div>
                
                {selectedPatient.visits.map((visit, idx) => (
                  <div key={visit.id} className="bg-slate-900/50 border border-glass-border rounded-2xl p-5 relative overflow-hidden group">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {visit.date || 'Unknown Date'}
                          </span>
                          <span className="text-xs text-text-muted">{visit.clinic}</span>
                        </div>
                        {visit.complaint && (
                          <div className="text-sm mt-3 text-slate-300">
                            <span className="font-bold text-white text-xs mr-2 uppercase tracking-wider">Complaint:</span>
                            {visit.complaint}
                          </div>
                        )}
                        
                        {/* Display existing medication summary */}
                        <div className="mt-4">
                          <span className="font-bold text-white text-xs uppercase tracking-wider mb-2 block">Prescribed Medication:</span>
                          {Array.isArray(visit.medication) && visit.medication.length > 0 ? (
                            <div className="space-y-2">
                              {visit.medication.map((med, i) => (
                                <div key={i} className="text-xs bg-slate-950 p-2.5 rounded-lg border border-glass-border inline-flex items-center gap-4 mr-2 mb-2">
                                  <span className="font-bold text-primary">{med.medicineName}</span>
                                  <span className="text-text-muted whitespace-nowrap">{med.days ? `${med.days} Days` : ''}</span>
                                </div>
                              ))}
                            </div>
                          ) : typeof visit.medication === 'string' && visit.medication.trim() !== '' ? (
                            <div className="text-xs bg-slate-950 p-3 rounded-lg border border-glass-border text-text-muted whitespace-pre-wrap">
                              {visit.medication}
                            </div>
                          ) : (
                            <div className="text-xs text-text-muted italic">No medications prescribed.</div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleEditPrescription(visit)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-primary/20 text-white hover:text-primary rounded-xl border border-glass-border hover:border-primary/50 transition-all text-xs font-bold w-full"
                        >
                          <Edit2 size={14} /> Edit Rx
                        </button>
                        <button
                          onClick={() => handlePrint(visit, selectedPatient)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl border border-primary/50 transition-all text-xs font-bold w-full"
                        >
                          <Printer size={14} /> Print Rx
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        currentMedications={Array.isArray(activeVisit?.medication) ? activeVisit.medication : []}
        onSave={handleSavePrescription}
      />
    </div>
  );
};

export default Prescription;
