import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Phone, History, IndianRupee, ChevronDown, ChevronUp, Calendar, MessageSquare, Edit2 } from 'lucide-react';
import FirestoreService from '../services/firestore';
import { format } from 'date-fns';

const Ortho = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [clinicFilter, setClinicFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', clinic: 'West Marredpally' });
  const [editingPatient, setEditingPatient] = useState(null);

  useEffect(() => {
    const unsub = FirestoreService.getOrthoPatients((data) => {
      setPatients(data);
    });
    return unsub;
  }, []);

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search);
    const matchesClinic = clinicFilter === 'All' || p.clinic === clinicFilter;
    return matchesSearch && matchesClinic;
  });

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPatient(null);
    setNewPatient({ name: '', phone: '', clinic: 'West Marredpally' });
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (editingPatient) {
      await FirestoreService.updateOrthoPatient(editingPatient.id, newPatient);
    } else {
      await FirestoreService.addOrthoPatient(newPatient);
    }
    handleCloseModal();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:row items-center justify-between gap-6 mb-10">
        <div>
          <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Radhika Super Speciality</p>
          <h1 className="text-3xl font-bold font-outfit">Ortho Patients</h1>
          <p className="text-text-muted text-sm mt-1 tracking-wide uppercase">Radhika Super Speciality Dental Hospital</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search ortho patients..."
              className="bg-slate-900 border border-glass-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus size={18} /> Add Patient
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['All', 'West Marredpally', 'Mettuguda'].map(c => (
          <button
            key={c}
            onClick={() => setClinicFilter(c)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${clinicFilter === c ? 'bg-primary border-primary text-white' : 'glass-panel text-text-muted border-glass-border hover:border-primary/50'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p, i) => (
          <OrthoCard 
            key={p.id} 
            patient={p} 
            index={i} 
            onEdit={(patient) => {
              setEditingPatient(patient);
              setNewPatient({ name: patient.name || 'Unknown', phone: patient.phone, clinic: patient.clinic });
              setShowAddModal(true);
            }}
          />
        ))}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-[32px] max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">{editingPatient ? 'Edit Ortho Patient' : 'New Ortho Patient'}</h2>
            <form onSubmit={handleAddPatient} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Patient Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Clinic Branch</label>
                <select
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary [&>option]:bg-slate-900"
                  value={newPatient.clinic}
                  onChange={(e) => setNewPatient({ ...newPatient, clinic: e.target.value })}
                >
                  <option value="West Marredpally" className="bg-slate-900">West Marredpally</option>
                  <option value="Mettuguda" className="bg-slate-900">Mettuguda</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 rounded-xl border border-glass-border font-medium hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-3">{editingPatient ? 'Save Changes' : 'Add Patient'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const OrthoCard = ({ patient, index, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [newVisit, setNewVisit] = useState({ date: format(new Date(), 'dd MMM yyyy'), amount: '', mode: 'cash' });
  const totalPaid = (patient.visits || []).reduce((sum, v) => sum + (Number(v.paidAmount) || 0), 0);

  const handleAddVisit = async (e) => {
    e.preventDefault();
    await FirestoreService.addOrthoVisit(patient.id, {
      date: newVisit.date,
      paidAmount: Number(newVisit.amount),
      paymentMode: newVisit.mode
    }, patient.visits || []);
    setShowAddVisit(false);
    setNewVisit({ date: format(new Date(), 'dd MMM yyyy'), amount: '', mode: 'cash' });
  };

  const pName = patient.name || patient.patient || patient.patientName || 'Unknown';
  const isCompleted = patient.status === 'completed';

  const handleToggleStatus = async (e) => {
    e.stopPropagation();
    const newStatus = isCompleted ? 'active' : 'completed';
    await FirestoreService.updateOrthoPatient(patient.id, { status: newStatus });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-panel p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-lg">
            {pName[0]}
          </div>
          <div>
            <h3 className="font-bold">{pName}</h3>
            <p className="text-sm text-text-muted">{patient.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
              isCompleted 
                ? 'bg-success/20 text-success border border-success/30 hover:bg-success/30' 
                : 'bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30'
            }`}
            title="Toggle Status"
          >
            {isCompleted ? 'Completed' : 'Active'}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(patient);
            }}
            className="p-2 bg-slate-800 border border-glass-border rounded-lg text-text-muted hover:text-primary hover:bg-primary/20 transition-all"
          >
            <Edit2 size={16} />
          </button>
          <div className="text-right">
            <p className="text-xl font-bold text-success">₹{totalPaid}</p>
            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Total Paid</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <a 
          href={`tel:${patient.phone}`} 
          className="py-3 rounded-xl bg-blue-600 flex items-center justify-center gap-2 text-white text-action-btn font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Phone size={16} /> Call
        </a>
        <a 
          href={`sms:${patient.phone}`} 
          className="py-3 rounded-xl bg-orange-500 flex items-center justify-center gap-2 text-white text-action-btn font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
        >
          <MessageSquare size={16} /> SMS
        </a>
        <a 
          href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`} 
          target="_blank" 
          rel="noreferrer"
          className="py-3 rounded-xl bg-whatsapp flex items-center justify-center gap-2 text-white text-action-btn font-bold hover:bg-whatsapp-dark transition-all"
        >
          <MessageSquare size={16} /> WA
        </a>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mb-6">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <span>{patient.clinic}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary font-bold flex items-center gap-1 hover:underline"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Close' : 'History'}
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-4 border-t border-glass-border"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <History size={16} className="text-primary" />
              Visits Log
            </h4>
            <button
              onClick={() => setShowAddVisit(true)}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
            >
              Add Visit
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {(patient.visits || []).map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] bg-slate-800 px-2 py-1 rounded text-text-muted font-bold uppercase tracking-tighter">
                    {v.date.split(' ')[1]}
                  </div>
                  <span className="text-sm">{v.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${v.paymentMode === 'online' ? 'bg-success/20 text-success' : v.paymentMode === 'cash' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>
                    {v.paymentMode}
                  </span>
                  <span className="font-bold">₹{v.paidAmount}</span>
                </div>
              </div>
            ))}
            {(patient.visits || []).length === 0 && (
              <p className="text-xs text-text-muted text-center py-4">No visits recorded yet.</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Add Visit Modal */}
      {showAddVisit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-[32px] max-w-sm w-full"
          >
            <h2 className="text-xl font-bold mb-6">Record Monthly Visit</h2>
            <form onSubmit={handleAddVisit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-bold uppercase tracking-widest">Date</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-4 py-3 outline-none"
                  value={newVisit.date}
                  onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-bold uppercase tracking-widest">Amount Paid</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    required
                    type="number"
                    placeholder="2500"
                    className="w-full bg-slate-900 border border-glass-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary"
                    value={newVisit.amount}
                    onChange={(e) => setNewVisit({ ...newVisit, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-bold uppercase tracking-widest">Mode</label>
                <select
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-4 py-3 outline-none"
                  value={newVisit.mode}
                  onChange={(e) => setNewVisit({ ...newVisit, mode: e.target.value })}
                >
                  <option value="cash">CASH</option>
                  <option value="online">ONLINE</option>
                  <option value="pending">PENDING</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddVisit(false)} className="flex-1 py-3 rounded-xl border border-glass-border font-medium hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-3 text-sm">Save Visit</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Ortho;
