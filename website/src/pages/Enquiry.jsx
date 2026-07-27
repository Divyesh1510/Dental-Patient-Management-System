import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, MapPin, AlertCircle, Send, CheckCircle2, ChevronLeft, Calendar } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ==========================================
// SMS CONFIGURATION
// ==========================================
const CLINIC_SMS_NUMBER = "+919885511349";
// ==========================================

const Enquiry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    branch: '',
    problem: '',
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Forgiving phone validation: strip non-digits and check if at least 10 digits exist
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setStatus({ loading: false, success: false, error: 'Please enter a valid phone number (at least 10 digits).' });
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      // 1. Save to Firebase Firestore
      await addDoc(collection(db, 'enquiries'), {
        name: formData.name,
        phone: formData.phone,
        branch: formData.branch,
        problem: formData.problem,
        createdAt: serverTimestamp(),
        status: 'new' // To track inside the admin dashboard
      });

      // 2. Format prefilled SMS body text
      const smsBody = `Hi Dr. Atla,\n\nI want to submit an enquiry:\n- Name: ${formData.name}\n- Phone: ${formData.phone}\n- Nearest Branch: ${formData.branch}\n- Problem: ${formData.problem}`;

      // Detect OS to use correct query separator (? for Android/Desktop, & for iOS)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const separator = isIOS ? '&' : '?';
      
      // Construct native SMS URL
      const smsUrl = `sms:${CLINIC_SMS_NUMBER}${separator}body=${encodeURIComponent(smsBody)}`;

      // Redirect browser to native SMS messaging app
      window.location.href = smsUrl;

      /*
      // --- COMMENTED OUT DIRECT SMS API ---
      // 2. Call the Cloudflare Worker SMS API
      const workerUrl = import.meta.env.VITE_SMS_API_URL || "YOUR_CLOUDFLARE_WORKER_URL_HERE";
      
      if (workerUrl !== "YOUR_CLOUDFLARE_WORKER_URL_HERE") {
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            branch: formData.branch,
            problem: formData.problem
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send SMS via backend');
        }
      } else {
        console.warn("SMS Worker URL not configured yet. Saving to Firestore only.");
      }
      // ------------------------------------
      */

      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', phone: '', branch: '', problem: '' });
      
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setStatus({
        loading: false,
        success: false,
        error: 'Failed to submit enquiry. Please try again or call 9885511349 directly.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-outfit text-white relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />



      {/* Main Header / Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors group bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Radhika Dental Logo" className="w-9 h-9" />
          <div className="hidden sm:block text-left">
            <h3 className="text-xs font-bold tracking-tight uppercase leading-none">Radhika Super Speciality</h3>
            <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">Dental Hospital</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Top aesthetic detail line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-sky-400 to-emerald-400" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <Calendar size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Online Enquiry</h2>
            <p className="text-slate-400 text-sm mt-1">Submit the details below to open your messaging app and text us for free.</p>
          </div>

          <AnimatePresence mode="wait">
            {status.success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enquiry Registered!</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
                  Your details have been saved, and your device's messaging app has been launched. Please press 'Send' in your SMS app to deliver the prefilled details directly to Dr. Atla.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Return to Homepage
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm"
                  >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{status.error}</span>
                  </motion.div>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Patient Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Anjali Reddy"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:border-primary text-white text-base transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:border-primary text-white text-base transition-colors"
                    />
                  </div>
                </div>

                {/* Branch Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Nearest Clinic Branch</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      name="branch"
                      required
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:border-primary text-white text-base transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-950">Select nearest branch</option>
                      <option value="West Marredpally" className="bg-slate-950">West Marredpally (Secunderabad)</option>
                      <option value="Mettuguda" className="bg-slate-950">Mettuguda (Secunderabad)</option>
                    </select>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Describe the Dental Problem</label>
                  <textarea
                    name="problem"
                    required
                    rows={4}
                    placeholder="Briefly describe what dental issue you are facing (e.g. Toothache, Braces consultation, Teeth cleaning, Dentures)..."
                    value={formData.problem}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:border-primary text-white text-base transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {status.loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Open SMS App & Submit</span>
                      <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-slate-500 text-xs z-10 border-t border-slate-900/60">
        <p>&copy; 2026 Radhika Super Speciality Dental Hospital. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Enquiry;
