import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle, Trash2, MapPin, Phone, MessageSquare } from 'lucide-react';
import FirestoreService from '../services/firestore';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import PatientHistoryModal from '../components/PatientHistoryModal';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [historyPatient, setHistoryPatient] = useState(null);
  const dateStr = format(selectedDate, 'd MMM yyyy');

  useEffect(() => {
    const unsubAppts = FirestoreService.getAppointments(dateStr, (data) => {
      setAppointments(data.map(a => ({ ...a, type: 'Appointment' })));
    });
    const unsubConsults = FirestoreService.getConsultations(dateStr, (data) => {
      setConsultations(data.map(c => ({ ...c, type: 'Walk-in', patient: c.patientName })));
    });
    return () => { unsubAppts(); unsubConsults(); };
  }, [dateStr]);

  const allVisits = [...appointments, ...consultations].sort((a, b) => {
    const timeA = a.time || a.timeSlot || '99:99';
    const timeB = b.time || b.timeSlot || '99:99';
    return timeA.localeCompare(timeB);
  });

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'upcoming' : 'completed';
    await FirestoreService.updateAppointment(id, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
        {/* Left Side: Calendar */}
        <div className="lg:w-96">
          <h1 className="text-xl sm:text-3xl font-bold font-outfit mb-1 sm:mb-2">Clinic Calendar</h1>
          <p className="text-text-muted text-xs sm:text-sm mb-4 sm:mb-8 tracking-wide uppercase">Radhika Super Speciality Dental Hospital</p>

          <div className="glass-panel p-3 sm:p-4 rounded-3xl w-full calendar-wrapper">
            <style>{`
                .calendar-wrapper .react-datepicker {
                  background: transparent !important;
                  border: none !important;
                  color: var(--text-main) !important;
                  font-family: 'Inter', sans-serif !important;
                  width: 100% !important;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                }
                .calendar-wrapper .react-datepicker__month-container {
                  width: 100% !important;
                  float: none !important;
                }
                .calendar-wrapper .react-datepicker__header {
                  background: transparent !important;
                  border-bottom: 1px solid var(--glass-border) !important;
                  padding-top: 10px !important;
                }
                .calendar-wrapper .react-datepicker__day-name, 
                .calendar-wrapper .react-datepicker__day, 
                .calendar-wrapper .react-datepicker__current-month {
                  color: var(--text-main) !important;
                  width: 2.5rem !important;
                  line-height: 2.5rem !important;
                  margin: 0.1rem !important;
                }
                .calendar-wrapper .react-datepicker__current-month {
                  width: 100% !important;
                  margin-bottom: 15px !important;
                  font-size: 1.1rem !important;
                  font-family: 'Outfit', sans-serif !important;
                  text-transform: uppercase !important;
                  letter-spacing: 1px !important;
                }
                .calendar-wrapper .react-datepicker__day-name {
                  color: var(--text-muted) !important;
                  font-weight: 700 !important;
                  font-size: 0.75rem !important;
                }
                .calendar-wrapper .react-datepicker__day--selected {
                  background: #0ea5e9 !important;
                  color: white !important;
                  border-radius: 12px !important;
                  font-weight: 700 !important;
                }
                .calendar-wrapper .react-datepicker__day:hover {
                  background: rgba(14, 165, 233, 0.1) !important;
                  border-radius: 12px !important;
                }
                .calendar-wrapper .react-datepicker__day--outside-month {
                  color: var(--text-muted) !important;
                  opacity: 0.3 !important;
                }
                .calendar-wrapper .react-datepicker__navigation {
                  top: 15px !important;
                }
              `}</style>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              inline
            />
          </div>
        </div>

        {/* Right Side: Appointment List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-outfit">
              Schedule for {format(selectedDate, 'do MMMM')}
            </h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
              {allVisits.length} Total Visits
            </span>
          </div>

          <div className="space-y-4">
            {allVisits.map((a, i) => {
              const pName = a.patient || a.name || a.patientName || 'Unknown';
              const isConsult = a.type === 'Walk-in';
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-panel p-5 rounded-2xl flex flex-col md:row items-center justify-between gap-6 ${a.status === 'completed' ? 'opacity-60 border-l-success' : isConsult ? 'border-l-warning' : 'border-l-primary'} border-l-4`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      className="flex items-center gap-4 cursor-pointer group"
                      onClick={() => setHistoryPatient({ name: pName, phone: a.phone })}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold group-hover:scale-110 transition-all ${isConsult ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'}`}>
                        {pName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold group-hover:text-primary transition-colors">{pName}</h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${isConsult ? 'bg-warning/20 text-warning border border-warning/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                            {a.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                          <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {a.time || a.timeSlot || 'Walk-in'}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {a.clinic}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(a.note || a.treatment || a.complaint) && (
                    <div className="flex-1 w-full md:w-auto px-4 md:border-l border-glass-border">
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">{isConsult ? 'Complaint / Treatment' : 'Treatment / Note'}</p>
                      <p className="text-xs italic text-text-muted line-clamp-2">
                        &ldquo;{a.note || a.treatment || a.complaint}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <a 
                      href={`tel:${a.phone}`} 
                      className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Phone size={20} />
                    </a>
                    <a 
                      href={`https://wa.me/${a.phone.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-3 bg-whatsapp rounded-xl text-white hover:bg-whatsapp-dark transition-all shadow-lg shadow-whatsapp/20"
                    >
                      <MessageSquare size={20} />
                    </a>
                    {!isConsult && (
                      <button
                        onClick={() => toggleStatus(a.id, a.status)}
                        className={`p-3 rounded-xl transition-all ${a.status === 'completed' ? 'bg-success text-white' : 'bg-slate-900 text-text-muted hover:text-success shadow-lg'}`}
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {allVisits.length === 0 && (
              <div className="py-20 text-center glass-panel rounded-3xl border-dashed">
                <CalendarIcon className="mx-auto text-text-muted mb-4 opacity-20" size={64} />
                <p className="text-text-muted italic">No appointments scheduled for this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PatientHistoryModal 
        isOpen={!!historyPatient}
        onClose={() => setHistoryPatient(null)}
        name={historyPatient?.name}
        phone={historyPatient?.phone}
      />
    </div>
  );
};

export default CalendarPage;
