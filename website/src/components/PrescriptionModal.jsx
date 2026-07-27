import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Pill, Sun, Moon, Sunrise } from 'lucide-react';

const emptyMedication = {
  id: Date.now().toString(),
  medicineName: '',
  usage: { morning: false, afternoon: false, night: false },
  days: '',
  tablets: '',
  purpose: ''
};

const PrescriptionModal = ({ isOpen, onClose, currentMedications, onSave }) => {
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(currentMedications) && currentMedications.length > 0) {
        setMeds(currentMedications);
      } else {
        setMeds([{ ...emptyMedication, id: Date.now().toString() }]);
      }
    }
  }, [isOpen, currentMedications]);

  if (!isOpen) return null;

  const handleAddMed = () => {
    setMeds([...meds, { ...emptyMedication, id: Date.now().toString() }]);
  };

  const handleRemoveMed = (id) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const handleChange = (id, field, value) => {
    setMeds(meds.map(m => {
      if (m.id === id) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return { ...m, [parent]: { ...m[parent], [child]: value } };
        }
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  const handleSave = () => {
    // Filter out completely empty rows
    const validMeds = meds.filter(m => m.medicineName.trim() !== '');
    onSave(validMeds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel !p-0 rounded-[32px] max-w-4xl w-full relative max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-glass-border flex items-center justify-between shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Pill size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-outfit leading-tight">Digital Prescription</h2>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Add Medication Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-text-muted"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <AnimatePresence>
            {meds.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="bg-slate-900/50 border border-glass-border rounded-2xl p-4 sm:p-5 relative group flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-glass-border pb-3">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest mr-2">Med #{index + 1}</span>
                  {meds.length > 1 && (
                    <button 
                      onClick={() => handleRemoveMed(med.id)}
                      className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-all"
                      title="Remove Medication"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Medicine Name & Purpose */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Medicine Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Amoxicillin 500mg"
                        className="w-full bg-slate-950 border border-glass-border rounded-lg px-3 py-2 outline-none focus:border-primary text-sm font-semibold"
                        value={med.medicineName}
                        onChange={(e) => handleChange(med.id, 'medicineName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Purpose / Notes</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Pain relief, Antibiotic"
                        className="w-full bg-slate-950 border border-glass-border rounded-lg px-3 py-2 outline-none focus:border-primary text-xs"
                        value={med.purpose}
                        onChange={(e) => handleChange(med.id, 'purpose', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Usage Checkboxes */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Dosage Timing</label>
                    <div className="flex flex-col gap-2 bg-slate-950 p-2 rounded-xl border border-glass-border">
                      <label className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={med.usage.morning}
                          onChange={(e) => handleChange(med.id, 'usage.morning', e.target.checked)}
                          className="w-4 h-4 rounded border-glass-border text-primary focus:ring-primary bg-slate-800"
                        />
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Sunrise size={14} className="text-orange-400" /> Morning
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={med.usage.afternoon}
                          onChange={(e) => handleChange(med.id, 'usage.afternoon', e.target.checked)}
                          className="w-4 h-4 rounded border-glass-border text-primary focus:ring-primary bg-slate-800"
                        />
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Sun size={14} className="text-yellow-400" /> Afternoon
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={med.usage.night}
                          onChange={(e) => handleChange(med.id, 'usage.night', e.target.checked)}
                          className="w-4 h-4 rounded border-glass-border text-primary focus:ring-primary bg-slate-800"
                        />
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Moon size={14} className="text-blue-400" /> Night
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Days & Tablets */}
                  <div className="md:col-span-3 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">How many days?</label>
                      <input 
                        type="number" 
                        placeholder="Days"
                        className="w-full bg-slate-950 border border-glass-border rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
                        value={med.days}
                        onChange={(e) => handleChange(med.id, 'days', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-muted font-bold uppercase tracking-widest ml-1">Total Tablets</label>
                      <input 
                        type="number" 
                        placeholder="Qty"
                        className="w-full bg-slate-950 border border-glass-border rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
                        value={med.tablets}
                        onChange={(e) => handleChange(med.id, 'tablets', e.target.value)}
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={handleAddMed}
            className="w-full py-4 rounded-2xl border border-dashed border-glass-border hover:border-primary hover:bg-primary/5 text-text-muted hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Add Another Medication
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-glass-border shrink-0 bg-slate-900/40 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-glass-border font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            Save Prescription
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrescriptionModal;
