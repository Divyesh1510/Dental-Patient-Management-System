import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Clock, CalendarIcon, FileText, Activity, AlertCircle, Heart, Pill } from 'lucide-react';

const VisitDetailsModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const detailRow = (label, value, Icon) => {
    const displayValue = (!value || (Array.isArray(value) && value.length === 0))
      ? <span className="text-text-muted italic">Not specified</span>
      : (Array.isArray(value) ? value.join(', ') : value);

    return (
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-glass-border space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
          {Icon && <Icon size={14} />}
          {label}
        </div>
        <div className="text-sm text-slate-800 dark:text-text-main font-medium whitespace-pre-wrap">
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-panel !p-0 rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border shrink-0 flex items-center justify-between bg-blue-50/80 dark:bg-slate-950/40">
            <div>
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-white">Visit Details</h2>
              <p className="text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest mt-1">
                {data.date || data.timeSlot || 'Date not specified'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-text-muted"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4 min-h-0">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-glass-border flex items-center gap-3">
                <div className="p-2 bg-primary/20 text-primary rounded-lg">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest">Patient</div>
                  <div className="font-bold text-slate-800 dark:text-white text-sm">{data.patientName || data.patient}</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-glass-border flex items-center gap-3">
                <div className="p-2 bg-primary/20 text-primary rounded-lg">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest">Contact</div>
                  <div className="font-bold text-slate-800 dark:text-white text-sm">{data.phone}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-glass-border text-center">
                <div className="text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest mb-1">Age</div>
                <div className="font-bold text-slate-800 dark:text-white">{data.age || '--'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-glass-border text-center">
                <div className="text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest mb-1">Time</div>
                <div className="font-bold text-slate-800 dark:text-white">{data.time || data.timeSlot || '--'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-glass-border text-center col-span-2">
                <div className="text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest mb-1">Clinic</div>
                <div className="font-bold text-slate-800 dark:text-white">{data.clinic || '--'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {detailRow('Clinical Findings',
                typeof data.clinicalFindings === 'object' && data.clinicalFindings !== null
                  ? Object.entries(data.clinicalFindings)
                    .map(([type, details]) => {
                      let label = type;
                      if (details.category) {
                        label += ` (${details.category})`;
                      }
                      if (details.teeth && details.teeth.length > 0) {
                        label += ` [${details.teeth.join(', ')}]`;
                      }
                      if (details.grade) {
                        label += ` - ${details.grade}`;
                      }
                      return label;
                    })
                    .join('; ')
                  : data.clinicalFindings,
                Activity
              )}
              {detailRow('Chief Complaint / Notes', data.complaint || data.notes, FileText)}
              {detailRow('Advised Treatment',
                typeof data.advisedTreatment === 'object' && data.advisedTreatment !== null
                  ? Object.entries(data.advisedTreatment)
                    .map(([type, details]) => {
                      let label = type;
                      if (details.category) label += ` (${details.category})`;
                      if (details.teeth && details.teeth.length > 0) label += ` [${details.teeth.join(', ')}]`;
                      return label;
                    })
                    .join('; ')
                  : data.advisedTreatment,
                FileText
              )}
              {detailRow('Treatment Provided', data.treatmentProvided || data.treatment, FileText)}
              {detailRow('Medication', 
                Array.isArray(data.medication)
                  ? data.medication.map(m => `${m.medicineName} (${m.days || '-'} days, ${m.tablets || '-'} tabs) - ${m.purpose || 'No purpose'}`).join('\n')
                  : data.medication, 
                Pill
              )}
              {detailRow('Medical History', data.medicalHistory, Heart)}
              {detailRow('Allergies', data.allergies, AlertCircle)}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VisitDetailsModal;
