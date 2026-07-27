import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, CheckCircle2 } from 'lucide-react';

const ClinicalFindingsModal = ({ isOpen, onClose, type, currentData, onSave }) => {
  const [data, setData] = useState(currentData || {});

  useEffect(() => {
    if (isOpen) {
      setData(currentData || {});
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(type, data);
    onClose();
  };

  const handleCategorySelect = (cat) => {
    setData({
      ...data,
      category: cat,
      // Clear or preserve teeth selection depending on matching category
      teeth: data.category === cat ? data.teeth || [] : []
    });
  };

  const toggleTooth = (quad, num) => {
    const id = `${quad}-${num}`;
    const prevTeeth = data.teeth || [];
    const newTeeth = prevTeeth.includes(id)
      ? prevTeeth.filter(t => t !== id)
      : [...prevTeeth, id];
    setData({ ...data, teeth: newTeeth });
  };

  const renderMCQ = (options) => (
    <div className="space-y-3">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-glass-border rounded-xl cursor-pointer hover:bg-primary/10 transition-all group">
          <input
            type="radio"
            name={type}
            className="accent-primary w-5 h-5"
            checked={data.grade === opt}
            onChange={() => setData({ ...data, grade: opt })}
          />
          <span className="text-slate-800 dark:text-white font-medium group-hover:text-primary transition-colors">{opt}</span>
        </label>
      ))}
    </div>
  );

  const isChild = data.category === 'Child';
  const nums = isChild ? ['E', 'D', 'C', 'B', 'A'] : [8, 7, 6, 5, 4, 3, 2, 1];
  const numsNormal = isChild ? ['A', 'B', 'C', 'D', 'E'] : [1, 2, 3, 4, 5, 6, 7, 8];

  const ToothButton = ({ quad, num }) => {
    const id = `${quad}-${num}`;
    const selectedTeeth = data.teeth || [];
    const isActive = selectedTeeth.includes(id);

    return (
      <button
        type="button"
        onClick={() => toggleTooth(quad, num)}
        className={`rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all border ${isActive
          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 font-black'
          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-glass-border text-slate-700 dark:text-text-primary hover:bg-primary/10 hover:border-primary/50'
          }`}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '1/1',
          margin: '2px'
        }}
      >
        {num}
      </button>
    );
  };

  const renderMouthPreview = () => {
    if (!data.teeth || data.teeth.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-glass-border">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 text-center">Graphical Mouth Quadrant Preview</p>
        
        <div className="grid grid-cols-2 gap-4 relative max-w-md mx-auto">
          {/* Horizontal & Vertical Divider Lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-200 dark:bg-slate-800/80" />
          <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-slate-200 dark:bg-slate-800/80" />
          
          {/* Q1: Upper Right */}
          <div className="p-2 flex flex-col items-end gap-1 min-h-[50px]">
            <span className="text-[8px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-widest font-outfit">Upper Right Q1</span>
            <div className="flex flex-wrap justify-end gap-1">
              {nums.map(n => {
                const active = data.teeth.includes(`Q1-${n}`);
                return (
                  <span 
                    key={`q1-preview-${n}`} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                      active 
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-110 font-black' 
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 border-transparent'
                    }`}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Q2: Upper Left */}
          <div className="p-2 flex flex-col items-start gap-1 min-h-[50px]">
            <span className="text-[8px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-widest font-outfit">Upper Left Q2</span>
            <div className="flex flex-wrap gap-1">
              {numsNormal.map(n => {
                const active = data.teeth.includes(`Q2-${n}`);
                return (
                  <span 
                    key={`q2-preview-${n}`} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                      active 
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-110 font-black' 
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 border-transparent'
                    }`}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Q4: Lower Right */}
          <div className="p-2 flex flex-col items-end justify-end gap-1 min-h-[50px]">
            <div className="flex flex-wrap justify-end gap-1">
              {nums.map(n => {
                const active = data.teeth.includes(`Q4-${n}`);
                return (
                  <span 
                    key={`q4-preview-${n}`} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                      active 
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-110 font-black' 
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 border-transparent'
                    }`}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
            <span className="text-[8px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-widest font-outfit mt-1">Lower Right Q4</span>
          </div>

          {/* Q3: Lower Left */}
          <div className="p-2 flex flex-col items-start justify-end gap-1 min-h-[50px]">
            <div className="flex flex-wrap gap-1">
              {numsNormal.map(n => {
                const active = data.teeth.includes(`Q3-${n}`);
                return (
                  <span 
                    key={`q3-preview-${n}`} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                      active 
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-110 font-black' 
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 border-transparent'
                    }`}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
            <span className="text-[8px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-widest font-outfit mt-1">Lower Left Q3</span>
          </div>
        </div>
      </div>
    );
  };

  const hasCategory = data.category && type !== 'Stains' && type !== 'Calculus';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`glass-panel !p-0 rounded-[32px] w-full overflow-hidden flex flex-col transition-all duration-300 ${
            hasCategory ? 'max-w-5xl' : 'max-w-sm'
          }`}
        >
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-blue-50/80 dark:bg-slate-950/40">
            <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-white uppercase tracking-wider">{type}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-text-muted transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
            {type !== 'Stains' && type !== 'Calculus' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('Adult')}
                  className={`py-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${data.category === 'Adult' ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-glass-border text-slate-600 dark:text-text-muted hover:border-primary/50 hover:bg-primary/5'}`}
                >
                  {data.category === 'Adult' && <CheckCircle2 size={16} />}
                  <span className="text-xs font-bold uppercase tracking-widest">Adult</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('Child')}
                  className={`py-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${data.category === 'Child' ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-glass-border text-slate-600 dark:text-text-muted hover:border-primary/50 hover:bg-primary/5'}`}
                >
                  {data.category === 'Child' && <CheckCircle2 size={16} />}
                  <span className="text-xs font-bold uppercase tracking-widest">Child</span>
                </button>
              </div>
            )}

            <div className="border-t border-glass-border pt-6">
              {type === 'Stains' ? (
                renderMCQ(['Grade I', 'Grade II', 'Grade III'])
              ) : type === 'Calculus' ? (
                renderMCQ(['Grade I', 'Grade II', 'Grade III', 'Grade IV'])
              ) : data.category ? (
                <div className="space-y-6">
                  {/* Embedded Interactive Dental Quadrant Chart */}
                  <div className="text-center">
                    <h3 className="text-sm font-bold font-outfit text-slate-800 dark:text-white uppercase tracking-wider">Interactive Dental Chart ({data.category})</h3>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-widest mt-0.5">Select affected teeth directly inside the quadrants</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative overflow-hidden bg-transparent">
                    {/* Q1: Upper Right */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-glass-border bg-white dark:bg-slate-950/20 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-text-primary uppercase tracking-widest font-outfit">Upper Right Q1</span>
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                          gap: '4px',
                          width: '100%',
                          justifyItems: 'center'
                        }}
                      >
                        {nums.map(n => <ToothButton key={`q1-${n}`} quad="Q1" num={n} />)}
                      </div>
                    </div>

                    {/* Q2: Upper Left */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-glass-border bg-white dark:bg-slate-950/20 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-text-primary uppercase tracking-widest font-outfit">Upper Left Q2</span>
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                          gap: '4px',
                          width: '100%',
                          justifyItems: 'center'
                        }}
                      >
                        {numsNormal.map(n => <ToothButton key={`q2-${n}`} quad="Q2" num={n} />)}
                      </div>
                    </div>

                    {/* Q4: Lower Right */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-glass-border bg-white dark:bg-slate-950/20 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-text-primary uppercase tracking-widest font-outfit">Lower Right Q4</span>
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                          gap: '4px',
                          width: '100%',
                          justifyItems: 'center'
                        }}
                      >
                        {nums.map(n => <ToothButton key={`q4-${n}`} quad="Q4" num={n} />)}
                      </div>
                    </div>

                    {/* Q3: Lower Left */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-glass-border bg-white dark:bg-slate-950/20 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-text-primary uppercase tracking-widest font-outfit">Lower Left Q3</span>
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                          gap: '4px',
                          width: '100%',
                          justifyItems: 'center'
                        }}
                      >
                        {numsNormal.map(n => <ToothButton key={`q3-${n}`} quad="Q3" num={n} />)}
                      </div>
                    </div>
                  </div>

                  {/* Graphical Mouth Preview */}
                  {renderMouthPreview()}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-800 dark:text-white font-bold text-sm">Findings for {type}</p>
                      <p className="text-slate-500 dark:text-text-muted text-xs">Select Adult or Child and save.</p>
                    </div>
                  </div>
                  {/* Graphical Mouth Preview for saved findings */}
                  {renderMouthPreview()}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-glass-border bg-blue-50/80 dark:bg-slate-950/40 flex gap-3">
            <button
              onClick={() => {
                onSave(type, {});
                onClose();
              }}
              className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-glass-border font-bold text-[10px] uppercase tracking-widest text-slate-600 dark:text-text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClinicalFindingsModal;
