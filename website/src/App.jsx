import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import AppointmentsList from './pages/AppointmentsList';
import Calendar from './pages/Calendar';
import Ortho from './pages/Ortho';
import Patients from './pages/Patients';
import PatientManagement from './pages/PatientManagement';
import Profile from './pages/Profile';
import Consultations from './pages/Consultations';
import Landing from './pages/Landing';
import Enquiry from './pages/Enquiry';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import BlogHub from './pages/BlogHub';
import BlogPost from './pages/BlogPost';
import BlogManagement from './pages/BlogManagement';
import Prescription from './pages/Prescription';

// Layout wrapper to show/hide Navbar and add padding
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-300 relative overflow-hidden print:overflow-visible print:bg-white print:min-h-0">
      {/* Subtly floating and rotating clinical crosses in background */}
      <div className="admin-bg-cross cross-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="admin-bg-cross cross-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="min-h-screen transition-all duration-300 pt-24 lg:pt-28 relative z-10 print:p-0 print:m-0 print:min-h-0">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* <CustomCursor /> removed as requested */}
          <Routes>
            {/* Public Routes - No Layout/Navbar */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/patient-portal" element={<PatientLogin />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/blog" element={<BlogHub />} />
            <Route path="/blog/:id" element={<BlogPost />} />

            {/* Protected Dashboard Routes - Wrapped in AppLayout and ProtectedRoute */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardHome /></AppLayout></ProtectedRoute>} />
            <Route path="/appointments-list" element={<ProtectedRoute><AppLayout><AppointmentsList /></AppLayout></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><AppLayout><Calendar /></AppLayout></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><AppLayout><Patients /></AppLayout></ProtectedRoute>} />
            <Route path="/patient-management" element={<ProtectedRoute><AppLayout><PatientManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/consultations" element={<ProtectedRoute><AppLayout><Consultations /></AppLayout></ProtectedRoute>} />
            <Route path="/ortho" element={<ProtectedRoute><AppLayout><Ortho /></AppLayout></ProtectedRoute>} />
            <Route path="/blog-management" element={<ProtectedRoute><AppLayout><BlogManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/prescription" element={<ProtectedRoute><AppLayout><Prescription /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
