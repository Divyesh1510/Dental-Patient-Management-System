import { useTheme } from '../context/ThemeContext';
import { UserCircle, Shield, Bell, Moon, Sun, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-outfit">Hospital Profile</h1>
          <p className="text-text-muted mt-1">Manage hospital settings and administrative controls</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Hospital Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[40px] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center p-3 shadow-xl relative z-10">
               <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-bold text-xl leading-tight relative z-10">Radhika Super Speciality Dental Hospital</h3>
            <div className="mt-4 flex items-center justify-center gap-2 relative z-10">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success font-bold uppercase tracking-widest">Active Server</span>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-[32px] space-y-5">
             <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Hospital Details</h4>
             <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Location</p>
                  <p className="text-sm font-medium">Secunderabad, Telangana, India</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Admin Email</p>
                  <p className="text-sm font-medium truncate max-w-[200px]">{user?.email || 'admin@radhikadental.com'}</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Contact</p>
                  <p className="text-sm font-medium">+91 78936 25999</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-8 rounded-[40px] space-y-8">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl flex items-center gap-3">
                  <Shield size={24} className="text-primary" />
                  System Preferences
                </h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <button 
                  onClick={toggleTheme}
                  className="flex items-center justify-between p-5 bg-slate-900/50 rounded-3xl border border-glass-border/50 hover:bg-slate-800/50 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-primary">
                       {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                       <p className="text-sm font-bold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                       <p className="text-[10px] text-text-muted uppercase tracking-wider">Switch theme</p>
                    </div>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative shadow-inner transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

                <div className="flex items-center justify-between p-5 bg-slate-900/50 rounded-3xl border border-glass-border/50 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-text-muted">
                       <Bell size={24} />
                    </div>
                    <div>
                       <p className="text-sm font-bold">Live Alerts</p>
                       <p className="text-[10px] text-text-muted uppercase tracking-wider">System only</p>
                    </div>
                  </div>
                  <div className="w-14 h-7 bg-slate-800 rounded-full relative">
                    <div className="absolute left-1 top-1 w-5 h-5 bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-glass-border/50">
              <h3 className="font-bold text-lg mb-6">Support & Developer Access</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 <a href="tel:7893625999" className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center group hover:bg-primary/5 hover:border-primary transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Phone size={22} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Tech Support</span>
                 </a>
                 <a href="https://radhikasuperspecialitydentalhospital.in" target="_blank" className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center group hover:bg-primary/5 hover:border-primary transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ExternalLink size={22} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Main Site</span>
                 </a>
                 <div className="hidden sm:flex glass-panel p-6 rounded-3xl flex-col items-center text-center opacity-40">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                      <Shield size={22} className="text-text-muted" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Logs</span>
                 </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={logout}
                className="w-full py-5 rounded-3xl bg-danger/10 text-danger font-bold text-sm hover:bg-danger hover:text-white transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3 border border-danger/20"
              >
                Logout Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
