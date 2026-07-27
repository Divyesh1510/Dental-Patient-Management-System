import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Shield, Award, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <Award size={14} />
            <span>Top Rated Dental Clinic in Secunderabad</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Smile with <span className="gradient-text">Confidence</span> & Care
          </h1>
          <p className="text-text-muted text-lg md:text-xl mb-10 max-w-lg">
            Experience world-class dental treatments at Radhika Super Speciality Dental Hospital. From routine checkups to advanced implants.
          </p>
          <div className="flex flex-col sm:row items-center gap-4">
            <Link to="/appointments" className="btn-primary flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto justify-center">
              <Calendar size={20} />
              Book Your Visit
            </Link>
            <a href="#services" className="text-text-muted hover:text-white transition-colors font-medium">
              Explore Services
            </a>
          <Link to="/login" className="btn-primary flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto justify-center">
            <UserCircle size={20} /> Patient Login
          </Link>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">15k+</span>
              <span className="text-xs text-text-muted uppercase tracking-widest">Happy Patients</span>
            </div>
            <div className="w-px h-10 bg-glass-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold">12+</span>
              <span className="text-xs text-text-muted uppercase tracking-widest">Specialists</span>
            </div>
            <div className="w-px h-10 bg-glass-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold">2</span>
              <span className="text-xs text-text-muted uppercase tracking-widest">Locations</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-[40px] overflow-hidden glass-panel p-2">
            <div className="aspect-[4/5] rounded-[32px] overflow-hidden bg-slate-800">
              <img
                src="/src/assets/hero.png"
                alt="Radhika Dental Clinic"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Floating Card */}
          <div className="absolute -bottom-10 -left-10 z-20 glass-panel p-6 rounded-2xl hidden md:block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center text-success">
                <Shield size={24} />
              </div>
              <div>
                <p className="font-bold">24/7 Support</p>
                <p className="text-xs text-text-muted">Emergency Dental Care</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
