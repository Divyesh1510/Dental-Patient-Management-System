import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Phone, MessageSquare, History, MapPin, ExternalLink, Edit2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import PatientHistoryModal from '../components/PatientHistoryModal';
import FirestoreService from '../services/firestore';
import { ensurePatientExists } from '../services/patientService';

const Patients = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('All');
  const [historyPatient, setHistoryPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await FirestoreService.updatePatientAppointmentsAndConsultations(editingPatient.phone, editForm);
      setEditingPatient(null);
    } catch (err) {
      console.error(err);
      alert("Error updating patient details.");
    } finally {
      setIsSaving(false);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncPatients = async () => {
    setIsSyncing(true);
    try {
      // 1. Get all appointments
      const apptSnap = await getDocs(collection(db, 'appointments'));
      // 2. Get all consultations
      const consSnap = await getDocs(collection(db, 'consultations'));
      // 3. Get all ortho patients
      const orthoSnap = await getDocs(collection(db, 'ortho_patients'));

      const uniquePatients = new Map();

      const addRecord = (doc) => {
        const data = doc.data();
        if (data.phone) {
          const name = data.name || data.patientName || data.patient || data.Patient || 'Unknown';
          const phone = data.phone.replace(/\D/g, ''); // Ensure digits only
          if (phone.length >= 10 && !uniquePatients.has(phone)) {
            uniquePatients.set(phone, name);
          }
        }
      };

      apptSnap.docs.forEach(addRecord);
      consSnap.docs.forEach(addRecord);
      orthoSnap.docs.forEach(addRecord);

      let count = 0;
      for (const [phone, name] of uniquePatients.entries()) {
        await ensurePatientExists(name, phone);
        count++;
      }

      alert(`Successfully synced ${count} patients to the Patient Portal!`);
    } catch (err) {
      console.error("Sync error:", err);
      alert("Error syncing patients.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Deduplicate patients by phone number
  const patientMap = new Map();
  appointments.forEach(a => {
    const pPhone = a.phone || 'N/A';
    if (!patientMap.has(pPhone)) {
      patientMap.set(pPhone, {
        name: a.patient || a.name || a.patientName || a.Patient || 'Unknown',
        phone: pPhone,
        lastVisit: a.date,
        clinic: a.clinic,
        visits: 1
      });
    } else {
      const p = patientMap.get(pPhone);
      p.visits += 1;
    }
  });

  const patients = Array.from(patientMap.values()).filter(p => {
    const matchesSearch = (p.name?.toLowerCase().includes(search.toLowerCase()) || false) || 
                         (p.phone?.includes(search) || false);
    const matchesClinic = selectedClinic === 'All' || p.clinic === selectedClinic;
    return matchesSearch && matchesClinic;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:row items-center justify-between gap-6 mb-10">
        <div>
          <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Radhika Super Speciality</p>
          <h1 className="text-3xl font-bold font-outfit">Patient Registry</h1>
          <p className="text-text-muted text-sm mt-1 tracking-wide uppercase">Radhika Super Speciality Dental Hospital</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..."
              className="bg-slate-900 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSyncPatients}
            disabled={isSyncing}
            className="btn-primary py-3 px-6 text-sm font-bold whitespace-nowrap disabled:opacity-50"
            title="Registers all existing patients so they can log into the Patient Portal"
          >
            {isSyncing ? 'Syncing...' : 'Sync Portal Accounts'}
          </button>
        </div>
      </div>
      
      {/* Clinic Filter Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        {['All', 'West Marredpally', 'Mettuguda'].map(clinic => (
          <button
            key={clinic}
            onClick={() => setSelectedClinic(clinic)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedClinic === clinic
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-slate-900/50 text-text-muted border border-glass-border hover:bg-slate-800'
            }`}
          >
            {clinic}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((p, i) => (
          <motion.div 
            key={p.phone}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setHistoryPatient({ name: p.name, phone: p.phone })}
            className="glass-panel p-6 rounded-2xl group hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold group-hover:bg-primary group-hover:text-white transition-all">
                {p.name ? p.name[0] : '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-sm text-text-muted">{p.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPatient(p);
                    setEditForm({ name: p.name, phone: p.phone });
                  }}
                  className="p-2 bg-slate-800 border border-glass-border rounded-lg text-text-muted hover:text-primary hover:bg-primary/20 transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <div className="text-right">
                   <p className="text-primary font-bold text-lg">{p.visits}</p>
                   <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Visits</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 p-4 bg-slate-800/50 rounded-2xl text-xs">
               <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><History size={12}/> Last Visit</span>
                  <span className="font-medium">{p.lastVisit}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><MapPin size={12}/> Primary Clinic</span>
                  <span className="font-medium">{p.clinic}</span>
               </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <a href={`tel:${p.phone}`} className="flex-1 py-3 rounded-xl bg-blue-600 flex items-center justify-center gap-2 text-white text-action-btn font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                <Phone size={16} /> Call
              </a>
              <a href={`sms:${p.phone}`} className="flex-1 py-3 rounded-xl bg-orange-500 flex items-center justify-center gap-2 text-white text-action-btn font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                <MessageSquare size={16} /> SMS
              </a>
              <a 
                href={`https://wa.me/${p.phone.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-whatsapp flex items-center justify-center gap-2 text-white text-action-btn font-bold hover:bg-whatsapp-dark transition-all"
              >
                <MessageSquare size={16} /> WA
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <PatientHistoryModal 
        isOpen={!!historyPatient}
        onClose={() => setHistoryPatient(null)}
        name={historyPatient?.name}
        phone={historyPatient?.phone}
      />

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-[32px] max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Edit Patient Details</h2>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Patient Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingPatient(null)} 
                  className="flex-1 py-3 rounded-xl border border-glass-border font-medium hover:bg-slate-800 transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-3"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Patients;
