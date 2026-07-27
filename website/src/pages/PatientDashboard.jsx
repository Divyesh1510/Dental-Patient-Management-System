import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LogOut, Calendar, ClipboardList, Stethoscope, ChevronLeft } from 'lucide-react';

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [orthoRecords, setOrthoRecords] = useState([]);
  const [expandedApptId, setExpandedApptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('patientSession');
    if (!session) {
      navigate('/patient-portal');
      return;
    }
    setPatient(JSON.parse(session));
  }, [navigate]);

  useEffect(() => {
    if (!patient) return;

    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const phone = patient.phone;

        // Fetch Appointments
        const apptQ = query(collection(db, 'appointments'), where('phone', '==', phone));
        const apptSnap = await getDocs(apptQ);
        const apptData = apptSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fetch Consultations
        const consQ = query(collection(db, 'consultations'), where('phone', '==', phone));
        const consSnap = await getDocs(consQ);
        const consData = consSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fetch Ortho Records
        const orthoQ = query(collection(db, 'ortho_patients'), where('phone', '==', phone));
        const orthoSnap = await getDocs(orthoQ);
        const orthoData = orthoSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Sort data by date/time
        setAppointments(apptData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setConsultations(consData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setOrthoRecords(orthoData); // Ortho usually has inner visits array
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patient]);

  const handleLogout = () => {
    localStorage.removeItem('patientSession');
    navigate('/patient-portal');
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-slate-950 font-outfit text-white pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-slate-950 border-b border-glass-border flex items-center justify-between px-6 lg:px-10 z-[100]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-slate-900 border border-glass-border rounded-xl text-text-muted hover:text-white transition-all shadow-lg hidden sm:block"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]" />
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight uppercase leading-none">Radhika Super Speciality</span>
              <span className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Patient Portal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold">{patient.name}</p>
            <p className="text-[10px] text-text-muted">{patient.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-red-500 rounded-xl transition-all font-bold text-xs sm:text-sm shadow-lg"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 px-6 max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Welcome, {patient.name}</h1>
          <p className="text-text-muted">Here is your complete dental history with us.</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Appointments */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Calendar size={20} />
                </div>
                <h2 className="text-xl font-bold">Appointments</h2>
              </div>
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-4">No appointments found.</p>
                ) : (
                  appointments.map(appt => {
                    const apptDate = new Date(appt.date);
                    const isPast = apptDate < new Date(new Date().setHours(0,0,0,0));
                    // If it's still 'upcoming' but the date has passed, display it as 'completed'
                    const displayStatus = (appt.status === 'upcoming' && isPast) 
                      ? 'completed' 
                      : (appt.status || 'upcoming');

                    return (
                      <div 
                        key={appt.id} 
                        onClick={() => setExpandedApptId(expandedApptId === appt.id ? null : appt.id)}
                        className={`p-4 bg-slate-900/50 border border-glass-border rounded-2xl cursor-pointer transition-all hover:bg-slate-800 ${expandedApptId === appt.id ? 'ring-1 ring-primary/50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-primary">{appt.date} <span className="text-text-muted font-normal text-xs ml-2">{appt.time || ''}</span></p>
                            <p className="text-sm mt-1">{appt.service || 'General Consultation'} • {appt.clinic}</p>
                          </div>
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                            displayStatus === 'completed' ? 'bg-primary/10 border-primary/20 text-primary' :
                            displayStatus === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          }`}>
                            {displayStatus}
                          </span>
                        </div>

                        {expandedApptId === appt.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-glass-border space-y-3 text-sm text-slate-300"
                          >
                            {appt.clinicalFindings && Object.keys(appt.clinicalFindings).length > 0 && (
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Clinical Findings</p>
                                <p>{typeof appt.clinicalFindings === 'string' ? appt.clinicalFindings : JSON.stringify(appt.clinicalFindings)}</p>
                              </div>
                            )}
                            
                            {appt.advisedTreatment && Object.keys(appt.advisedTreatment).length > 0 && (
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Advised Treatment</p>
                                <p>{Array.isArray(appt.advisedTreatment) ? appt.advisedTreatment.join(', ') : typeof appt.advisedTreatment === 'string' ? appt.advisedTreatment : JSON.stringify(appt.advisedTreatment)}</p>
                              </div>
                            )}

                            {(appt.treatmentProvided || appt.treatment) && (
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Treatment Provided</p>
                                <p>{appt.treatmentProvided || appt.treatment}</p>
                              </div>
                            )}

                            {appt.medication && appt.medication !== 'NA' && (
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Prescribed Medication</p>
                                <p>{appt.medication}</p>
                              </div>
                            )}

                            {appt.notes && appt.notes !== 'NA' && (
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Doctor's Notes</p>
                                <p>{appt.notes}</p>
                              </div>
                            )}
                            
                            {/* If nothing is filled out by doctor yet */}
                            {(!appt.notes || appt.notes === 'NA') && !appt.treatmentProvided && !appt.treatment && (!appt.advisedTreatment || Object.keys(appt.advisedTreatment).length === 0) && (!appt.clinicalFindings || Object.keys(appt.clinicalFindings).length === 0) && (
                               <p className="text-xs text-text-muted italic">No additional medical details recorded for this visit yet.</p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Consultations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <ClipboardList size={20} />
                </div>
                <h2 className="text-xl font-bold">Walk-in Consultations</h2>
              </div>
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                {consultations.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-4">No walk-in history found.</p>
                ) : (
                  consultations.map(cons => (
                    <div key={cons.id} className="p-4 bg-slate-900/50 border border-glass-border rounded-2xl">
                      <p className="font-bold text-primary">{cons.date}</p>
                      {cons.reason && <p className="text-sm mt-1 font-medium">{cons.reason}</p>}
                      {cons.treatment && <p className="text-xs text-text-muted mt-2 border-t border-glass-border pt-2">{cons.treatment}</p>}
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Ortho Records */}
            {orthoRecords.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Stethoscope size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Orthodontic History</h2>
                </div>
                <div className="glass-panel p-6 rounded-3xl">
                  {orthoRecords.map(record => (
                    <div key={record.id} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-glass-border pb-4">
                        <div>
                          <p className="font-bold text-primary">Treatment Started: {record.dateStarted || 'N/A'}</p>
                          <p className="text-sm mt-1">Appliance: {record.applianceType || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-2">
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Visits</h3>
                        {record.visits && record.visits.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {record.visits.map((visit, idx) => (
                              <div key={idx} className="p-3 bg-slate-900/50 border border-glass-border rounded-xl text-sm flex flex-col justify-between">
                                <div>
                                  <p className="font-bold text-primary">{visit.date}</p>
                                  {visit.notes && <p className="text-text-muted mt-1 italic">"{visit.notes}"</p>}
                                </div>
                                {(visit.paidAmount || visit.paymentMode) && (
                                  <div className="mt-3 pt-3 border-t border-glass-border flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</span>
                                    <span className="font-bold text-primary">
                                      ₹{visit.paidAmount || '0'} <span className="text-xs font-normal text-text-muted uppercase">({visit.paymentMode || 'cash'})</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-muted">No visits recorded yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
