import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, LogIn, AlertCircle } from 'lucide-react';
import { signInPatient } from '../services/patientService';

const PatientLogin = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const session = localStorage.getItem('patientSession');

  // Redirect if already logged in as patient
  useEffect(() => {
    if (session) {
      navigate('/patient-dashboard');
    }
  }, [navigate, session]);

  // Prevent UI flash before redirect
  if (session) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate phone input
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      // In our design, phone is both username and password
      const patientData = await signInPatient(digitsOnly, digitsOnly);
      
      // Save session
      localStorage.setItem('patientSession', JSON.stringify(patientData));
      
      // Redirect to portal
      navigate('/patient-dashboard');
    } catch (err) {
      setError("Patient not found. Please ensure you have registered with the clinic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-600/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10 pb-24"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-outfit tracking-tight mb-2 text-white">
            Patient Portal
          </h1>
          <p className="text-slate-400 text-sm">
            Access your dental records, appointments, and treatment history.
          </p>
        </div>

        {/* Login Box */}
        <div className="glass-panel w-full p-8 rounded-[32px] shadow-2xl flex flex-col gap-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                Registered Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  className="w-full bg-slate-900/50 border border-glass-border rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-emerald-500 transition-all text-base text-white"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 font-bold flex items-center justify-center gap-3 rounded-2xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Access My Portal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Navigation Back */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back to main website
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientLogin;
