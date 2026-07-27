import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, Search, MapPin, CheckCircle, Phone, MessageSquare, Trash2, ChevronLeft, ChevronRight, Plus, X, Edit2 } from 'lucide-react';
import FirestoreService from '../services/firestore';
import { format, addDays, subDays, isToday } from 'date-fns';
import PatientHistoryModal from '../components/PatientHistoryModal';
import VisitDetailsModal from '../components/VisitDetailsModal';



const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [clinicFilter, setClinicFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historyPatient, setHistoryPatient] = useState(null);
  const [detailsVisit, setDetailsVisit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [newAppt, setNewAppt] = useState({
    patient: '',
    phone: '',
    clinic: 'West Marredpally',
    time: format(new Date(), 'hh:mm a'),
    complaint: ''
  });

  const resetForm = () => {
    setNewAppt({
      patient: '',
      phone: '',
      clinic: 'West Marredpally',
      time: format(new Date(), 'hh:mm a'),
      complaint: ''
    });
    setEditingAppt(null);
  };
  
  const dateStr = format(selectedDate, 'd MMM yyyy');

  useEffect(() => {
    const unsub = FirestoreService.getAppointments(dateStr, (data) => {
      console.log("Appointments for", dateStr, ":", data);
      setAppointments(data);
    });
    return unsub;
  }, [dateStr]);

  const filtered = appointments.filter(a => {
    const pName = a.patient || a.name || a.patientName || a.Patient || 'Unknown';
    const matchesSearch = pName.toLowerCase().includes(search.toLowerCase()) || (a.phone && a.phone.includes(search));
    const matchesClinic = clinicFilter === 'All' || a.clinic === clinicFilter;
    return matchesSearch && matchesClinic;
  });

  const stats = [
    { label: isToday(selectedDate) ? "Today's Total" : "Day Total", value: appointments.length, icon: <Calendar />, color: "text-primary" },
    { label: "Completed", value: appointments.filter(a => a.status === 'completed').length, icon: <CheckCircle />, color: "text-success" },
    { label: "Upcoming", value: appointments.filter(a => a.status !== 'completed').length, icon: <Clock />, color: "text-warning" },
  ];

  const handleAddAppt = async (e) => {
    e.preventDefault();
    const apptData = {
      patient: newAppt.patient,
      phone: newAppt.phone,
      clinic: newAppt.clinic,
      time: newAppt.time,
      complaint: newAppt.complaint,
      notes: newAppt.complaint,       // Backwards compatibility for dashboard & detail cards
      treatment: newAppt.complaint,   // Backwards compatibility for list views
      date: format(selectedDate, 'd MMM yyyy'),
      status: editingAppt ? editingAppt.status : 'upcoming',
      updatedAt: new Date().toISOString()
    };
    
    if (editingAppt) {
      await FirestoreService.updateAppointment(editingAppt.id, apptData);
    } else {
      await FirestoreService.addAppointment({ ...apptData, createdAt: new Date().toISOString() });
    }
    
    setShowAddModal(false);
    resetForm();
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'upcoming' : 'completed';
    await FirestoreService.updateAppointment(id, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const deleteAppt = async (id) => {
    if (window.confirm("Delete this appointment?")) {
      await FirestoreService.deleteAppointment(id);
    }
  };

  const navigateDate = (amount) => {
    setSelectedDate(prev => amount > 0 ? addDays(prev, amount) : subDays(prev, Math.abs(amount)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateDate(-1)}
              className="p-2 bg-slate-900 border border-glass-border rounded-xl hover:bg-slate-800 transition-all text-text-muted hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => navigateDate(1)}
              className="p-2 bg-slate-900 border border-glass-border rounded-xl hover:bg-slate-800 transition-all text-text-muted hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold font-outfit">
              {isToday(selectedDate) ? "Today's Dashboard" : "Clinic Dashboard"}
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
            className="flex items-center gap-2 btn-primary px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <Plus size={20} /> Add Appointment
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

      {/* Stats - Square boxes in a single line on mobile */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-10">
        {stats.map((s, i) => (
          <div key={i} className="glass-panel p-2 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-4 text-center sm:text-left h-24 sm:h-auto">
            <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-800 flex items-center justify-center ${s.color}`}>
              {React.cloneElement(s.icon, { size: 16 })}
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] text-text-muted font-bold uppercase tracking-tight sm:tracking-widest leading-none mb-1">{s.label.split(' ')[0]}</p>
              <p className="text-base sm:text-2xl font-bold leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map((a, i) => {
          const pName = a.patient || a.name || a.patientName || a.Patient || 'Unknown';
          return (
            <div 
              key={a.id}
              className={`glass-panel p-4 sm:p-5 rounded-2xl border-l-4 transition-all hover:scale-[1.02] ${a.status === 'completed' ? 'border-l-success opacity-75' : 'border-l-primary shadow-lg shadow-primary/10'}`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div 
                  className="flex items-center gap-2 sm:gap-3 cursor-pointer group-hover:opacity-80 transition-opacity"
                  onClick={() => setDetailsVisit(a)}
                  title="View Details"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${a.status === 'completed' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                    {pName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base leading-tight hover:text-primary transition-colors">{pName}</h3>
                    <p className="text-[10px] sm:text-sm text-text-muted">{a.phone}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => {
                      setEditingAppt(a);
                      setNewAppt({
                        patient: a.patient || a.name || a.patientName || a.Patient || '',
                        phone: a.phone || '',
                        clinic: a.clinic || 'West Marredpally',
                        time: a.time || a.timeSlot || format(new Date(), 'hh:mm a'),
                        complaint: a.complaint || a.notes || a.treatment || ''
                      });
                      setShowAddModal(true);
                    }}
                    className="p-1.5 bg-slate-800 border border-glass-border rounded-lg text-text-muted hover:text-primary hover:bg-primary/20 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => toggleStatus(a.id, a.status)}
                    className={`p-1.5 rounded-lg transition-all ${a.status === 'completed' ? 'bg-success text-white' : 'bg-slate-800 text-text-muted hover:text-success hover:bg-success/10 border border-glass-border'}`}
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button 
                    onClick={() => deleteAppt(a.id)}
                    className="p-1.5 bg-slate-800 border border-glass-border rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-[11px] sm:text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin size={12} className="text-primary" />
                  <span>{a.clinic}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock size={12} className="text-primary" />
                  <span>{a.timeSlot || a.time || 'Not scheduled'}</span>
                </div>
                {a.notes && (
                  <div className="mt-2 p-2 bg-slate-900/50 rounded-lg italic text-text-muted border-l-2 border-primary/30">
                    "{a.notes}"
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <a 
                  href={`tel:${a.phone}`} 
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-action-btn font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Phone size={16} /> Call
                </a>
                <a 
                  href={`sms:${a.phone}`} 
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 text-white text-action-btn font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                  <MessageSquare size={16} /> SMS
                </a>
                <a 
                  href={`https://wa.me/${a.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-whatsapp text-white text-action-btn font-bold hover:bg-whatsapp-dark transition-all"
                >
                  <MessageSquare size={16} /> WA
                </a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
            <Calendar className="mx-auto text-text-muted mb-4" size={48} />
            <p className="text-text-muted">No appointments found for {isToday(selectedDate) ? "today" : format(selectedDate, 'do MMMM')}.</p>
          </div>
        )}
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



      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-panel !p-0 rounded-[20px] max-w-2xl w-full relative max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark" />
            
            <form onSubmit={handleAddAppt} className="flex flex-col flex-1 min-h-0 w-full">
              <div className="p-5 pb-4 border-b border-glass-border flex items-center justify-between shrink-0 bg-blue-50/80 dark:bg-slate-950/40">
                <div>
                  <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-white">New Appointment</h2>
                  <p className="text-slate-500 dark:text-text-muted text-[10px] uppercase tracking-widest mt-0.5">For {format(selectedDate, 'do MMMM')}</p>
                </div>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-text-muted">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 py-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 overscroll-contain space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 dark:text-text-muted font-bold uppercase tracking-widest ml-1">Patient Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Full Name"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-glass-border text-slate-800 dark:text-white rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                    value={newAppt.patient}
                    onChange={(e) => setNewAppt({...newAppt, patient: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 dark:text-text-muted font-bold uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    placeholder="10-digit number"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-glass-border text-slate-800 dark:text-white rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                    value={newAppt.phone}
                    onChange={(e) => setNewAppt({...newAppt, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 dark:text-text-muted font-bold uppercase tracking-widest ml-1">Appointment Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-glass-border text-slate-800 dark:text-white rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 dark:text-text-muted font-bold uppercase tracking-widest ml-1">Preferred Time</label>
                  <input 
                    required
                    type="time" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-glass-border text-slate-800 dark:text-white rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs"
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 dark:text-text-muted font-bold uppercase tracking-widest ml-1">Clinic Branch</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-glass-border text-slate-800 dark:text-white rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs [&>option]:bg-white [&>option]:dark:bg-slate-900 [&>option]:text-slate-800 [&>option]:dark:text-white"
                  value={newAppt.clinic}
                  onChange={(e) => setNewAppt({...newAppt, clinic: e.target.value})}
                >
                  <option value="West Marredpally">West Marredpally</option>
                  <option value="Mettuguda">Mettuguda</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 dark:text-text-muted font-bold uppercase tracking-widest ml-1">Complaint Given</label>
                <textarea 
                  placeholder="Describe chief complaint (e.g. Toothache, Scaling, crown consultation)..."
                  rows="4"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-glass-border text-slate-800 dark:text-white rounded-lg px-3.5 py-2 outline-none focus:border-primary text-xs resize-none"
                  value={newAppt.complaint}
                  onChange={(e) => setNewAppt({...newAppt, complaint: e.target.value})}
                ></textarea>
              </div>

              </div>

              <div className="p-5 pt-4 border-t border-glass-border shrink-0 bg-blue-50/80 dark:bg-slate-950/40 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }} 
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-glass-border text-slate-600 dark:text-text-muted font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-xl"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AppointmentsList;
