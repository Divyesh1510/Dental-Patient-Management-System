import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, CheckCircle2, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Appointments = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    clinic: 'West Marredpally',
    date: new Date(),
    timeSlot: 'Morning (10 AM - 1 PM)',
    treatment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        ...formData,
        date: format(formData.date, 'd MMM yyyy'),
        status: 'upcoming',
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (err) {
      alert("Error booking appointment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clinics = ['West Marredpally', 'Mettuguda'];
  const slots = ['Morning (10 AM - 1 PM)', 'Afternoon (2 PM - 5 PM)', 'Evening (6 PM - 9 PM)'];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-10 rounded-3xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Appointment Requested!</h2>
          <p className="text-text-muted mb-8">
            Thank you, {formData.name.split(' ')[0]}. We've received your request for {formData.clinic}. Our team will call you shortly to confirm the exact time.
          </p>
          <button onClick={() => window.location.href = '/'} className="btn-primary w-full">
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Book Your Visit</h1>
          <p className="text-text-muted">Take the first step towards a healthier, brighter smile.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info Side */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                Our Locations
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-primary">West Marredpally</p>
                  <p className="text-text-muted">Near Ganesh Temple, Secunderabad</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Mettuguda</p>
                  <p className="text-text-muted">Railway Colony, Secunderabad</p>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Phone size={18} className="text-primary" />
                Quick Contact
              </h3>
              <p className="text-sm text-text-muted mb-2">Doctor / Clinic:</p>
              <p className="font-bold">9885511349</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-2">
            <motion.form 
              onSubmit={handleSubmit}
              className="glass-panel p-8 rounded-3xl space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-slate-800/50 border border-glass-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </label>
                  <input 
                    required
                    type="tel" 
                    placeholder="9876543210"
                    className="w-full bg-slate-800/50 border border-glass-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                  <MapPin size={14} /> Select Clinic
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {clinics.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, clinic: c})}
                      className={`py-3 rounded-xl border transition-all text-sm font-medium ${formData.clinic === c ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-800/50 border-glass-border text-text-muted hover:border-primary/50'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                    <Calendar size={14} /> Preferred Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => setFormData({...formData, date: date})}
                      minDate={new Date()}
                      className="w-full bg-slate-800/50 border border-glass-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                    <Clock size={14} /> Preferred Slot
                  </label>
                  <select 
                    className="w-full bg-slate-800/50 border border-glass-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors appearance-none"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                  >
                    {slots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Reason for Visit / Treatment (Optional)</label>
                <textarea 
                  rows="3"
                  className="w-full bg-slate-800/50 border border-glass-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none"
                  placeholder="e.g. Toothache, Dental Implants, Cleaning..."
                  value={formData.treatment}
                  onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Confirm Appointment Request'}
                <ChevronRight size={20} />
              </button>
              
              <p className="text-[10px] text-text-muted text-center uppercase tracking-widest">
                Our clinic will confirm your appointment via phone call
              </p>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
