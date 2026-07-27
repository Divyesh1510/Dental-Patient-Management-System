import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building, Activity, Stethoscope } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import FirestoreService from '../services/firestore';
import { format, subDays, parse } from 'date-fns';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'];

const DashboardHome = () => {
  const [appointments, setAppointments] = useState([]);
  const [orthoPatients, setOrthoPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubs = [];
    
    // Fetch all appointments
    const qAppt = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    unsubs.push(onSnapshot(qAppt, (snapshot) => {
      setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    // Fetch ortho patients
    unsubs.push(FirestoreService.getOrthoPatients((data) => {
      setOrthoPatients(data);
    }));

    // Fetch all consultations
    unsubs.push(FirestoreService.getConsultations((data) => {
      setConsultations(data);
    }));

    // Fake loading delay to let real-time listeners trigger
    setTimeout(() => setLoading(false), 800);

    return () => unsubs.forEach(u => u && u());
  }, []);

  // Consolidate unique patients across all sources by phone
  const patientMap = new Map();

  const addPatientToMap = (phone, data, type) => {
    const validPhone = phone || 'Unknown';
    if (!patientMap.has(validPhone)) {
      patientMap.set(validPhone, {
        name: data.patientName || data.patient || data.name || 'Unknown',
        clinic: data.clinic || 'Unknown',
        type: type
      });
    }
  };

  appointments.forEach(a => addPatientToMap(a.phone, a, 'General'));
  consultations.forEach(c => addPatientToMap(c.phone, c, 'Walk-in'));
  orthoPatients.forEach(o => addPatientToMap(o.phone, o, 'Ortho'));

  const allUniquePatients = Array.from(patientMap.values());
  const totalPatients = allUniquePatients.length;
  
  const westMarredpallyCount = allUniquePatients.filter(p => p.clinic === 'West Marredpally').length;
  const mettugudaCount = allUniquePatients.filter(p => p.clinic === 'Mettuguda').length;
  const orthoCount = allUniquePatients.filter(p => p.type === 'Ortho').length;

  const clinicData = [
    { name: 'West Marredpally', value: westMarredpallyCount },
    { name: 'Mettuguda', value: mettugudaCount },
  ];

  // Calculate Last 7 Days Activity (Appointments + Walk-ins)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    return format(subDays(new Date(), i), 'd MMM yyyy');
  }).reverse();

  const activityData = last7Days.map(dateStr => {
    const dayAppts = appointments.filter(a => a.date === dateStr).length;
    const dayWalkins = consultations.filter(c => c.date === dateStr).length;
    return {
      date: dateStr.split(' ')[0] + ' ' + dateStr.split(' ')[1], // e.g., "24 May"
      Appointments: dayAppts,
      WalkIns: dayWalkins
    };
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit">Hospital Analytics</h1>
        <p className="text-text-muted text-sm uppercase tracking-widest mt-1">Overview of Patient Data & Clinics</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-primary">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Total Patients</p>
            <h3 className="text-3xl font-bold">{totalPatients}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-blue-500">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
            <Building size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">West Marredpally</p>
            <h3 className="text-3xl font-bold">{westMarredpallyCount}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-indigo-500">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Building size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Mettuguda</p>
            <h3 className="text-3xl font-bold">{mettugudaCount}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Stethoscope size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Total Ortho</p>
            <h3 className="text-3xl font-bold">{orthoCount}</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Distribution Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold mb-6 font-outfit flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Clinic Distribution
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {totalPatients > 0 ? (
              <>
                <div 
                  className="w-48 h-48 rounded-full mb-8"
                  style={{
                    background: `conic-gradient(#38bdf8 ${(westMarredpallyCount/totalPatients)*360}deg, #818cf8 ${(westMarredpallyCount/totalPatients)*360}deg 360deg)`
                  }}
                />
                <div className="flex justify-center gap-6 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-sky-400"></div>
                    <span className="text-sm text-text-muted">W. Marredpally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                    <span className="text-sm text-text-muted">Mettuguda</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-text-muted">No patient data available.</p>
            )}
          </div>
        </motion.div>

        {/* 7 Day Activity Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold mb-6 font-outfit flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Last 7 Days Activity
          </h3>
          <div className="flex-1 flex items-end gap-2 sm:gap-6 min-h-[300px] mt-4 relative pt-10">
            {activityData.map((data, index) => {
              const maxVal = Math.max(...activityData.map(d => Math.max(d.Appointments, d.WalkIns, 1)));
              const apptHeight = (data.Appointments / maxVal) * 100;
              const walkInHeight = (data.WalkIns / maxVal) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="flex gap-1 w-full justify-center h-full items-end pb-2">
                    <div className="w-full max-w-[20px] bg-sky-400 rounded-t-md relative group-hover:opacity-80 transition-all" style={{ height: `${apptHeight}%`, minHeight: data.Appointments > 0 ? '4px' : '0' }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">{data.Appointments}</span>
                    </div>
                    <div className="w-full max-w-[20px] bg-indigo-400 rounded-t-md relative group-hover:opacity-80 transition-all" style={{ height: `${walkInHeight}%`, minHeight: data.WalkIns > 0 ? '4px' : '0' }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">{data.WalkIns}</span>
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-text-muted text-center mt-2 border-t border-glass-border/50 pt-2 w-full truncate">
                    {data.date}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 w-full mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-400"></div>
              <span className="text-sm text-text-muted">Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
              <span className="text-sm text-text-muted">Walk-ins</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
