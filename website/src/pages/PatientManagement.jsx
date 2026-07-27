import React, { useState, useEffect } from 'react';
import { getPatients, updatePatient, deletePatient } from '../services/patientService';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load patients.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.phone) return;
    setIsSaving(true);
    try {
      await updatePatient(editingPatient.phone, editForm.name, editForm.phone);
      setEditingPatient(null);
      fetchPatients();
    } catch (err) {
      console.error(err);
      alert('Error updating patient.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (phone) => {
    if (window.confirm('Are you sure you want to delete this portal account? This will prevent the patient from logging in, but past appointments will remain.')) {
      try {
        await deletePatient(phone);
        fetchPatients();
      } catch (err) {
        console.error(err);
        alert('Error deleting patient.');
      }
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.name?.toLowerCase().includes(search.toLowerCase()) || false) || 
    (p.phone?.includes(search) || false)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:row items-center justify-between gap-6 mb-10">
        <div>
          <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Radhika Super Speciality</p>
          <h1 className="text-3xl font-bold font-outfit">Portal Mgmt</h1>
          <p className="text-text-muted text-sm mt-1 tracking-wide uppercase">Manage Portal Accounts</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            className="bg-slate-900 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-text-muted">Loading patients...</p>
      ) : (
        <div className="bg-slate-900 border border-glass-border rounded-[32px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-glass-border text-xs uppercase tracking-wider text-text-muted">
                <th className="p-6 font-bold">Patient Name</th>
                <th className="p-6 font-bold">Phone Number</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.phone} className="border-b border-glass-border hover:bg-slate-800/50 transition-colors">
                  <td className="p-6 font-medium">{p.name}</td>
                  <td className="p-6 text-text-muted">{p.phone}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => {
                        setEditingPatient(p);
                        setEditForm({ name: p.name, phone: p.phone });
                      }}
                      className="p-2 bg-slate-800 border border-glass-border rounded-lg text-text-muted hover:text-primary hover:bg-primary/20 transition-all mr-2"
                      title="Edit Patient"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.phone)}
                      className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-danger hover:bg-red-500/20 transition-all"
                      title="Delete Portal Account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-text-muted">No portal patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-[32px] max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Edit Patient Details</h2>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Patient Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingPatient(null)} 
                  className="flex-1 py-3 rounded-xl border border-glass-border font-medium hover:bg-slate-800 transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-3"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
