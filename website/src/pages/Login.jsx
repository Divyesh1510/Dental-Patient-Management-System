import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, loginWithGoogle, loginWithPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    if (loginWithPassword(password)) {
      navigate('/dashboard');
    } else {
      alert("Invalid admin password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        // Replaced <br> tags with pb-24 to create the same vertical space at the bottom
        className="login-container flex flex-col items-center z-10 pb-24"
      >
        {/* Clinic Name Above Box */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-outfit tracking-tight mb-1 leading-tight">
            Radhika Super Speciality
          </h1>
          <p className="text-primary font-bold tracking-loose text-[10px] uppercase">
            Dental Hospital
          </p>
        </div>

        {/* Default Theme Glass Box */}
        <div className="glass-panel w-full p-8 rounded-[32px] shadow-2xl flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">Admin Login</h2>
            <div className="w-10 h-1 bg-primary mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-full flex items-center justify-center gap-3 transition-all font-semibold text-sm shadow-sm"
            style={{
              backgroundColor: '#ffffff',
              color: '#1f1f1f',
              border: '1px solid #dadce0',
              cursor: 'pointer'
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span style={{ color: '#1f1f1f' }}>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          <div className="flex items-center gap-3 my-[-10px]">
            <div className="flex-1 h-px bg-glass-border" />
            <span className="text-[10px] text-text-muted font-bold uppercase">OR</span>
            <div className="flex-1 h-px bg-glass-border" />
          </div>

          {/* Password Login */}
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin password"
                className="w-full bg-slate-900/50 border border-glass-border rounded-2xl pl-12 pr-12 py-4 outline-none focus:border-primary transition-all text-sm text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-3 rounded-2xl"
            >
              <LogIn size={18} />
              Admin Login
            </button>
          </form>
        </div>

        <p className="mt-10 text-[9px] text-text-muted font-bold tracking-loose uppercase">Reddy-dev</p>
      </motion.div>
    </div>
  );
};

export default Login;