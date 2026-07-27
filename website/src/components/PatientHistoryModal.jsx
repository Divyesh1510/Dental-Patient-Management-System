import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Phone, MessageSquare, History, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import FirestoreService from '../services/firestore';
import { format } from 'date-fns';

const PatientHistoryModal = ({ phone, name, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isOpen && phone) {
      setLoading(true);
      const unsub = FirestoreService.getPatientHistory(phone, (data) => {
        setHistory(data);
        setLoading(false);
      });
      return unsub;
    }
  }, [isOpen, phone]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-[32px]"
      >
        {/* Header */}
        <div className="p-6 border-b border-glass-border flex items-center justify-between bg-blue-50/80 dark:bg-slate-950/40">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                {name?.[0] || 'P'}
              </div>
              <div>
                <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-white">{name}</h2>
                <p className="text-sm text-slate-500 dark:text-text-muted">{phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href={`tel:${phone}`} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-action-btn font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                <Phone size={16} /> Call
              </a>
              <a 
                href={`sms:${phone}`} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-action-btn font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
              >
                <MessageSquare size={16} /> SMS
              </a>
              <a 
                href={`https://wa.me/${phone.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-whatsapp text-white text-action-btn font-bold hover:bg-whatsapp-dark transition-all"
              >
                <MessageSquare size={16} /> WA
              </a>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-text-muted"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <History size={18} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Appointment History</h3>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text-muted">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-20 text-center glass-panel rounded-2xl border-dashed">
              <Calendar size={48} className="mx-auto text-text-muted/20 mb-4" />
              <p className="text-text-muted italic">No past appointments found for this patient.</p>
            </div>
          ) : (
            history.map((a, i) => {
              const isExpanded = expandedId === a.id;
              return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:border-primary/50 ${a.status === 'completed' ? 'bg-success/5 border-success/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-glass-border text-slate-800 dark:text-white'}`}
                onClick={() => setExpandedId(isExpanded ? null : a.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{a.date}</span>
                      {a.status === 'completed' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-success/20 text-success px-2 py-0.5 rounded">
                          <CheckCircle size={10} /> Completed
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {a.timeSlot || a.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {a.clinic}</span>
                    </div>
                    {(a.note || a.treatment || a.notes) && !isExpanded && (
                      <p className="text-xs italic text-text-muted mt-2 border-l-2 border-primary/20 pl-2 truncate">
                        "{a.note || a.treatment || a.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-glass-border space-y-3 text-sm">
                        {a.age && <div className="grid grid-cols-1 md:grid-cols-3 gap-1"><span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Age:</span> <span className="md:col-span-2">{a.age}</span></div>}
                        {a.clinicalFindings && <div className="grid grid-cols-1 md:grid-cols-3 gap-1"><span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Clinical Findings:</span> <span className="md:col-span-2 whitespace-pre-wrap">{a.clinicalFindings}</span></div>}
                        {a.advisedTreatment && a.advisedTreatment.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                            <span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Advised Treatment:</span>
                            <div className="md:col-span-2 flex flex-wrap gap-2">
                              {a.advisedTreatment.map((t, idx) => (
                                <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white px-2 py-1 rounded text-xs">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {a.treatmentProvided && <div className="grid grid-cols-1 md:grid-cols-3 gap-1"><span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Treatment Provided:</span> <span className="md:col-span-2 whitespace-pre-wrap">{a.treatmentProvided}</span></div>}
                        {a.medication && <div className="grid grid-cols-1 md:grid-cols-3 gap-1"><span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Medication:</span> <span className="md:col-span-2 whitespace-pre-wrap">{a.medication}</span></div>}
                        {a.medicalHistory && <div className="grid grid-cols-1 md:grid-cols-3 gap-1"><span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Medical History:</span> <span className="md:col-span-2 whitespace-pre-wrap">{a.medicalHistory}</span></div>}
                        {a.allergies && <div className="grid grid-cols-1 md:grid-cols-3 gap-1"><span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Allergies:</span> <span className="md:col-span-2 whitespace-pre-wrap">{a.allergies}</span></div>}
                        {(a.note || a.treatment || a.notes) && <div className="grid grid-cols-1 md:grid-cols-3 gap-1"><span className="text-slate-500 dark:text-text-muted text-xs uppercase tracking-widest font-bold">Notes:</span> <span className="md:col-span-2 whitespace-pre-wrap">{a.note || a.treatment || a.notes}</span></div>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )})
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-glass-border bg-blue-50/80 dark:bg-slate-950/40 text-center">
          <p className="text-[10px] text-slate-500 dark:text-text-muted uppercase tracking-[0.2em]">Patient Records - Radhika Super Speciality Dental Hospital</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientHistoryModal;
