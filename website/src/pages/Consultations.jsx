import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  Plus,
  X,
  Trash2,
  User,
  Phone,
  Stethoscope,
  Receipt,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Edit2
} from 'lucide-react';
import FirestoreService from '../services/firestore';
import { format, addDays, subDays, isToday } from 'date-fns';
import DatePicker from 'react-datepicker';
import PatientHistoryModal from '../components/PatientHistoryModal';
import VisitDetailsModal from '../components/VisitDetailsModal';
import ClinicalFindingsModal from '../components/ClinicalFindingsModal';
import PrescriptionModal from '../components/PrescriptionModal';
import "react-datepicker/dist/react-datepicker.css";

const FINDING_TYPES = [
  "Dental Caries",
  "Gingivitis",
  "Periapical Abscess",
  "Swelling",
  "Periodontal Infection",
  "Grossly Decayed",
  "Cervical Abrasion",
  "Mobility",
  "Missing Teeth",
  "Impaction",
  "Retained Teeth",
  "Supernumerary teeth",
  "Stains",
  "Calculus"
];

const TREATMENT_TYPES = [
  "Scaling",
  "Root Canal",
  "Extraction",
  "GIC Filling",
  "Composite Filling",
  "Miracle Mix Filling",
  "Zinc Oxide Filling",
  "Full Crown",
  "Bridges",
  "Implants",
  "Orthodontic Treatment"
];



const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clinicFilter, setClinicFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConsult, setEditingConsult] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);
  const [detailsVisit, setDetailsVisit] = useState(null);
  const [activeFinding, setActiveFinding] = useState(null);
  const [activeTreatment, setActiveTreatment] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [newConsult, setNewConsult] = useState({
    patientName: '',
    phone: '',
    age: '',
    date: new Date(),
    time: format(new Date(), 'hh:mm a'),
    clinic: 'West Marredpally',
    clinicalFindings: {},
    advisedTreatment: {},
    treatmentProvided: '',
    medication: [],
    medicalHistory: '',
    allergies: '',
    complaint: ''
  });

  const resetForm = () => {
    setNewConsult({
      patientName: '',
      phone: '',
      age: '',
      date: new Date(),
      time: format(new Date(), 'hh:mm a'),
      clinic: 'West Marredpally',
      clinicalFindings: {},
      advisedTreatment: {},
      treatmentProvided: '',
      medication: [],
      medicalHistory: '',
      allergies: '',
      complaint: ''
    });
    setEditingConsult(null);
  };

  const dateStr = format(selectedDate, 'd MMM yyyy');

  useEffect(() => {

    const unsub = FirestoreService.getConsultations(dateStr, (data) => {
      setConsultations(data);
    });
    return unsub;
  }, [dateStr]);

  const filtered = consultations.filter(c => {
    const pName = c.patientName || c.patient || c.name || 'Unknown';
    const pPhone = c.phone || '';
    const matchesSearch = pName.toLowerCase().includes(search.toLowerCase()) || pPhone.includes(search);
    const matchesClinic = clinicFilter === 'All' || c.clinic === clinicFilter;
    return matchesSearch && matchesClinic;
  });

  const handleAddConsult = async (e) => {
    e.preventDefault();
    if (editingConsult) {
      await FirestoreService.updateConsultation(editingConsult.id, {
        ...newConsult,
        date: format(newConsult.date, 'd MMM yyyy')
      });
    } else {
      await FirestoreService.addConsultation({
        ...newConsult,
        date: format(newConsult.date, 'd MMM yyyy')
      });
    }
    setShowAddModal(false);
    resetForm();
  };

  const deleteConsult = async (id) => {
    if (window.confirm("Delete this consultation record?")) {
      await FirestoreService.deleteConsultation(id);
    }
  };

  const navigateDate = (amount) => {
    setSelectedDate(prev => amount > 0 ? addDays(prev, amount) : subDays(prev, Math.abs(amount)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 bg-slate-900 border border-glass-border rounded-xl hover:bg-slate-800 transition-all text-text-muted hover:text-primary"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 bg-slate-900 border border-glass-border rounded-xl hover:bg-slate-800 transition-all text-text-muted hover:text-primary"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold font-outfit">
              {isToday(selectedDate) ? "Today's Walk-ins" : "Walk-in Records"}
            </h1>
            <p className="text-text-muted text-sm uppercase tracking-widest mt-1">
              {format(selectedDate, 'EEEE, do MMMM yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-950/50 border border-glass-border rounded-2xl px-5 py-3 w-full lg:w-80 focus-within:border-primary transition-all">
            <Search size={18} className="text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full bg-transparent border-none outline-none text-sm placeholder:text-text-muted/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center gap-2 px-6 py-3 text-sm shrink-0 whitespace-nowrap"
          >
            <Plus size={18} /> New Record
          </button>
        </div>
      </div>

      {/* Clinic Filters (Pills) */}
      <div className="flex flex-wrap gap-3 mb-10">
        {['All', 'West Marredpally', 'Mettuguda'].map(c => (
          <button
            key={c}
            onClick={() => setClinicFilter(c)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${clinicFilter === c ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-900/50 text-text-muted border-glass-border hover:border-primary/50'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <PatientHistoryModal 
        isOpen={!!historyPatient}
        onClose={() => setHistoryPatient(null)}
        name={historyPatient?.name}
        phone={historyPatient?.phone}
      />

      <VisitDetailsModal
        isOpen={!!detailsVisit}
        onClose={() => setDetailsVisit(null)}
        data={detailsVisit}
      />

      <ClinicalFindingsModal
        isOpen={!!activeFinding}
        onClose={() => setActiveFinding(null)}
        type={activeFinding}
        currentData={newConsult.clinicalFindings?.[activeFinding]}
        onSave={(type, data) => {
          setNewConsult({
            ...newConsult,
            clinicalFindings: {
              ...newConsult.clinicalFindings,
              [type]: data
            }
          });
        }}
      />

      {/* Consultations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border-t-4 border-t-primary hover:scale-[1.02] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity"
                  onClick={() => setDetailsVisit(c)}
                  title="View Details"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {(c.patientName || c.patient || c.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight hover:text-primary transition-colors">{c.patientName || c.patient || c.name || 'Unknown'}</h3>
                    <p className="text-sm text-text-muted">{c.phone || ''}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingConsult(c);
                        setNewConsult({
                          patientName: c.patientName || c.patient || c.name || '',
                          phone: c.phone || '',
                          age: c.age || '',
                          date: new Date(c.date || new Date()),
                        time: c.time || '',
                        clinic: c.clinic || 'West Marredpally',
                        clinicalFindings: c.clinicalFindings || {},
                        advisedTreatment: c.advisedTreatment || [],
                        treatmentProvided: c.treatmentProvided || '',
                        medication: c.medication || [],
                        medicalHistory: c.medicalHistory || '',
                        allergies: c.allergies || '',
                        complaint: c.complaint || ''
                      });
                      setShowAddModal(true);
                    }}
                    className="p-2 bg-slate-800 border border-glass-border rounded-lg text-text-muted hover:text-primary hover:bg-primary/20 transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteConsult(c.id)}
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <CalendarIcon size={16} className="text-primary" />
                  <span>{c.date}</span>
                  <span className="mx-2">•</span>
                  <MapPin size={16} className="text-primary" />
                  <span>{c.clinic}</span>
                </div>

                {c.complaint && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted flex items-center gap-1.5">
                      <Stethoscope size={12} /> Chief Complaint
                    </p>
                    <p className="text-sm bg-slate-900/50 p-3 rounded-xl border border-glass-border">
                      {c.complaint}
                    </p>
                  </div>
                )}

                {c.treatmentProvided && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted flex items-center gap-1.5">
                      <ClipboardList size={12} /> Treatment Provided
                    </p>
                    <p className="text-sm bg-primary/5 p-3 rounded-xl border border-primary/20">
                      {c.treatmentProvided}
                    </p>
                  </div>
                )}

                {c.time && (
                  <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Time</span>
                    <span className="text-sm font-bold text-primary flex items-center gap-1">
                      <Clock size={16} /> {c.time}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6">
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-action-btn font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Phone size={16} /> Call
                </a>
                <a
                  href={`sms:${c.phone}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 text-white text-action-btn font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                  <MessageSquare size={16} /> SMS
                </a>
                <a
                  href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-whatsapp text-white text-action-btn font-bold hover:bg-whatsapp-dark transition-all"
                >
                  <MessageSquare size={16} /> WA
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
            <ClipboardList className="mx-auto text-text-muted mb-4 opacity-20" size={64} />
            <p className="text-text-muted">No walk-in records found for this date.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-panel !p-0 rounded-[32px] max-w-2xl w-full relative max-h-[85vh] overflow-hidden flex flex-col"
          >
            <form onSubmit={handleAddConsult} className="flex flex-col flex-1 min-h-0 w-full">
              <div className="p-8 pb-5 border-b border-glass-border flex items-center justify-between shrink-0 bg-slate-900/40">
                <h2 className="text-2xl font-bold font-outfit">{editingConsult ? 'Edit Consultation' : 'New Consultation'}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-text-muted"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 py-5 overflow-y-auto custom-scrollbar flex-1 min-h-0 overscroll-contain space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Patient Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Full Name"
                    className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                    value={newConsult.patientName}
                    onChange={(e) => setNewConsult({...newConsult, patientName: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    placeholder="10-digit number"
                    className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                    value={newConsult.phone}
                    onChange={(e) => setNewConsult({...newConsult, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Patient Age</label>
                <input 
                  type="number" 
                  placeholder="Age"
                  className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                  value={newConsult.age}
                  onChange={(e) => setNewConsult({...newConsult, age: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Consultation Date</label>
                  <DatePicker
                    selected={newConsult.date}
                    onChange={(date) => setNewConsult({ ...newConsult, date: date })}
                    dateFormat="MMMM d, yyyy"
                    className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Time</label>
                  <input 
                    required
                    type="time" 
                    className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                    value={newConsult.time}
                    onChange={(e) => setNewConsult({...newConsult, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Clinic Branch</label>
                  <select 
                    className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs [&>option]:bg-slate-900"
                    value={newConsult.clinic}
                    onChange={(e) => setNewConsult({...newConsult, clinic: e.target.value})}
                  >
                    <option value="West Marredpally">West Marredpally</option>
                    <option value="Mettuguda">Mettuguda</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Clinical Findings</label>
                <div className="grid grid-cols-2 gap-2">
                  {FINDING_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveFinding(type)}
                      className={`text-left p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${newConsult.clinicalFindings?.[type] ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-900 border-glass-border text-text-muted hover:border-primary/50'}`}
                    >
                      <span className="truncate">{type}</span>
                      {newConsult.clinicalFindings?.[type] && <Edit2 size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Advised Treatment</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {TREATMENT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (t === 'Scaling') {
                          const updated = { ...newConsult.advisedTreatment };
                          if (updated[t]) delete updated[t];
                          else updated[t] = { selected: true };
                          setNewConsult({ ...newConsult, advisedTreatment: updated });
                        } else {
                          setActiveTreatment(t);
                        }
                      }}
                      className={`text-left p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${newConsult.advisedTreatment?.[t] ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-900 border-glass-border text-text-muted hover:border-primary/50'}`}
                    >
                      <span className="truncate">{t}</span>
                      {newConsult.advisedTreatment?.[t] && <Edit2 size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Treatment Provided</label>
                <textarea 
                  rows="2"
                  placeholder="Details of treatment provided..."
                  className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs resize-none"
                  value={newConsult.treatmentProvided}
                  onChange={(e) => setNewConsult({...newConsult, treatmentProvided: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Prescription</label>
                <div className="bg-slate-900 border border-glass-border rounded-lg p-3.5">
                  {Array.isArray(newConsult.medication) && newConsult.medication.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {newConsult.medication.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-slate-950 p-2.5 rounded-lg border border-glass-border">
                          <span className="font-bold text-primary truncate max-w-[150px]">{med.medicineName}</span>
                          <span className="text-text-muted">{med.days ? `${med.days} Days` : ''}</span>
                        </div>
                      ))}
                    </div>
                  ) : typeof newConsult.medication === 'string' && newConsult.medication.trim() !== '' ? (
                    <div className="text-xs bg-slate-950 p-2.5 rounded-lg border border-glass-border mb-4 text-text-muted">
                      {newConsult.medication}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(true)}
                    className="w-full py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Manage Prescription
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Patient Medical History</label>
                <textarea 
                  rows="2"
                  placeholder="Past medical history..."
                  className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs resize-none"
                  value={newConsult.medicalHistory}
                  onChange={(e) => setNewConsult({...newConsult, medicalHistory: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Allergies</label>
                <textarea 
                  rows="2"
                  placeholder="Any known allergies..."
                  className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs resize-none"
                  value={newConsult.allergies}
                  onChange={(e) => setNewConsult({...newConsult, allergies: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Chief Complaint / Notes</label>
                <textarea 
                  placeholder="Reason for visit..."
                  rows="2"
                  className="w-full bg-slate-900 border border-glass-border rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs resize-none"
                  value={newConsult.complaint}
                  onChange={(e) => setNewConsult({...newConsult, complaint: e.target.value})}
                ></textarea>
              </div>

              </div>

              <div className="p-8 pt-5 border-t border-glass-border shrink-0 bg-slate-900/40 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 rounded-xl border border-glass-border font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  {editingConsult ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <ClinicalFindingsModal 
        isOpen={!!activeFinding} 
        onClose={() => setActiveFinding(null)} 
        type={activeFinding} 
        currentData={newConsult.clinicalFindings?.[activeFinding]}
        onSave={(type, data) => {
          const updated = { ...newConsult.clinicalFindings };
          if (Object.keys(data).length === 0) {
            delete updated[type];
          } else {
            updated[type] = data;
          }
          setNewConsult({ ...newConsult, clinicalFindings: updated });
        }}
      />

      <ClinicalFindingsModal 
        isOpen={!!activeTreatment} 
        onClose={() => setActiveTreatment(null)} 
        type={activeTreatment} 
        currentData={newConsult.advisedTreatment?.[activeTreatment]}
        onSave={(type, data) => {
          const updated = { ...newConsult.advisedTreatment };
          if (Object.keys(data).length === 0) {
            delete updated[type];
          } else {
            updated[type] = data;
          }
          setNewConsult({ ...newConsult, advisedTreatment: updated });
        }}
      />

      <PrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        currentMedications={Array.isArray(newConsult.medication) ? newConsult.medication : []}
        onSave={(meds) => {
          setNewConsult({ ...newConsult, medication: meds });
        }}
      />
    </div>
  );
};

export default Consultations;
