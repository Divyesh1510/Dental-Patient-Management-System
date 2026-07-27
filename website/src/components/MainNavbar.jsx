import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import '../styles/home.css';

const MainNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isHome = location.pathname === '/';
  const getHref = (hash) => isHome ? hash : `/${hash}`;

  return (
    <div className={`home-page-container ${theme}`} style={{ background: 'transparent', minHeight: 0 }}>
      <header style={{ position: 'fixed', width: '100%' }}>
        <nav>
          <div className="logo-container">
            <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <img src="/logo.svg" alt="Radhika Dental Logo" className="nav-logo-img" />
              <div className="logo-text">
                <span className="logo-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Radhika Super Speciality</span>
                <span className="logo-subtitle" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Dental Hospital</span>
              </div>
            </Link>
          </div>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            <a href={getHref('#about')} onClick={closeMobileMenu}>About</a>
            <a href={getHref('#services')} onClick={closeMobileMenu}>Services</a>
            <a href={getHref('#testimonials')} onClick={closeMobileMenu}>Reviews</a>
            <a href={getHref('#faq')} onClick={closeMobileMenu}>FAQ</a>
            <a href={getHref('#locations')} onClick={closeMobileMenu}>Locations</a>
            <Link to="/blog" onClick={closeMobileMenu}>Health Hub</Link>
            <Link to="/enquiry" className="cta-btn enquiry-btn" onClick={closeMobileMenu}>Online Enquiry</Link>
            <a href="tel:9885511349" className="cta-btn" onClick={closeMobileMenu}>Book Appointment</a>
            <a href="https://wa.me/919885511349" className="cta-btn whatsapp-btn" target="_blank" rel="noreferrer" onClick={closeMobileMenu}>WhatsApp</a>
            
            <button onClick={() => { toggleTheme(); closeMobileMenu(); }} className="theme-toggle" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={() => { toggleTheme(); closeMobileMenu(); }} className="theme-toggle-mobile">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </nav>
      </header>
      <div style={{ height: '80px' }} aria-hidden="true"></div>
    </div>
  );
};

export default MainNavbar;
