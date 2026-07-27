import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, MessageSquare, X } from 'lucide-react';
import '../styles/home.css';
import toothIcon from '../assets/tooth-icon.png';
import MainNavbar from '../components/MainNavbar';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  useEffect(() => {
    // FAQ Accordion Logic
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(button => {
      const handleClick = () => {
        const faqItem = button.parentElement;
        const isOpen = faqItem.classList.contains('open');

        document.querySelectorAll('.faq-item').forEach(item => {
          item.classList.remove('open');
          const ans = item.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = null;
        });

        if (!isOpen) {
          faqItem.classList.add('open');
          const answer = faqItem.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
        }
      };
      button.addEventListener('click', handleClick);
      return () => button.removeEventListener('click', handleClick);
    });

    // Reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.card, .location-card, .section-header, .reveal');
    revealElements.forEach((el, index) => {
      el.classList.add('reveal');
      if (el.classList.contains('card') || el.classList.contains('location-card')) {
        el.style.transitionDelay = `${(index % 3) * 0.15}s`;
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page-container with-orbs">
      {/* Header */}
      <MainNavbar />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-overlay"></div>
        <div className="hero-glow-orb-1"></div>
        <div className="hero-glow-orb-2"></div>
        <div className="hero-particle particle-1"></div>
        <div className="hero-particle particle-2"></div>
        <div className="hero-particle particle-3"></div>
        <div className="hero-content">
          <span className="hero-subtitle">Radhika Super Speciality<br />Dental Hospital</span>
          <h1>Expert Dental Care You Can Trust</h1>
          <p>Transforming smiles in Secunderabad with patience, precision, and world-class care.</p>
          <div className="hero-btns">
            <a href="#services" className="primary-btn">Explore Services</a>
            <a href="#locations" className="secondary-btn">Our Locations</a>
            <Link to="/patient-portal" className="secondary-btn">Patient Portal</Link>
            <Link to="/login" className="secondary-btn">Admin Portal</Link>
            {/* <button onClick={() => setIsChatOpen(true)} className="cta-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> Chat with AI
            </button> */}
          </div>
        </div>
      </section>

      {/* About Doctor Section */}
      <section id="about" class="section alt-bg">
        <div class="container">
          <div class="about-grid">
            <div class="about-content">
              <h2>Meet Our Chief Dentist</h2>
              <h3 class="doctor-name">Dr. Atla Subramanyam Reddy</h3>
              <p class="doctor-qualifications">BDS (Dentist)</p>
              <p>With over two decades of clinical experience, Dr. Subramanyam Reddy is committed to providing
                compassionate, painless, and high-quality dental care. His expertise spans across general dentistry,
                orthodontics, and specialized geriatric care including artificial dentures.</p>
              <ul class="doctor-highlights">
                <li>✓ 20+ Years of Experience</li>
                <li>✓ Patient-Centric Approach</li>
                <li>✓ Specialized in Dental Care</li>
              </ul>
            </div>
            <div class="about-image">
              <img src="/dr-atla-subramanyam-reddy.jpg" alt="Dr. Atla Subramanyam Reddy" title="Dr. Atla Subramanyam Reddy" class="doctor-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Our Specializations</h2>
            <p>Comprehensive dental care tailored for every stage of life.</p>
          </div>
          <div className="service-grid">
            <div className="card service-card">
              <div className="card-icon">
                <img src={toothIcon} alt="Specialization" className="custom-tooth-img" />
              </div>
              <h3>Cosmetic Dentistry</h3>
              <p>Routine check-ups, cleanings, and advanced restorative treatments for long-lasting oral health.</p>
            </div>
            <div className="card service-card">
              <div className="card-icon">
                <img src={toothIcon} alt="Specialization" className="custom-tooth-img" />
              </div>
              <h3>Teeth Cleaning</h3>
              <p>Professional scaling and polishing to remove plaque and tartar, ensuring a bright and healthy smile.</p>
            </div>
            <div className="card service-card">
              <div className="card-icon">
                <img src={toothIcon} alt="Specialization" className="custom-tooth-img" />
              </div>
              <h3>Root Canal Treatment</h3>
              <p>Painless and effective endodontic therapy to save infected teeth and relieve severe toothaches.</p>
            </div>
            <div className="card service-card">
              <div className="card-icon">
                <img src={toothIcon} alt="Specialization" className="custom-tooth-img" />
              </div>
              <h3>Braces & Orthodontics</h3>
              <p>Expertly handled with patience for the best possible results. Achieve the perfect smile you've always wanted.</p>
            </div>
            <div className="card service-card">
              <div className="card-icon">
                <img src={toothIcon} alt="Specialization" className="custom-tooth-img" />
              </div>
              <h3>Artificial Dentures</h3>
              <p>Specialized care including comfortable home visits tailored for elderly and Parkinson's patients.</p>
            </div>
            <div className="card service-card">
              <div className="card-icon">
                <img src={toothIcon} alt="Specialization" className="custom-tooth-img" />
              </div>
              <h3>Dental Implants</h3>
              <p>Durable, natural-looking permanent tooth replacements that restore both function and aesthetics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section alt-bg">
        <div className="container">
          <div className="section-header">
            <h2>Patient Success Stories</h2>
            <p>See what our patients say about their experience with Dr. Atla Subramanyam Reddy (BDS).</p>
          </div>
          <div className="testimonial-grid">
            <div className="card testimonial-card">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                ))}
              </div>
              <p className="quote">"Dr. Atla Subramanyam Reddy is incredibly patient and kind. I was terrified of dental work, but the process was smooth and painless."</p>
              <p className="author">- Anjali R.</p>
            </div>
            <div className="card testimonial-card">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                ))}
              </div>
              <p className="quote">"We got artificial dentures for my grandfather. The home visit option was a lifesaver for his Parkinson's. Highly recommend!"</p>
              <p className="author">- Vikram Reddy</p>
            </div>
            <div className="card testimonial-card">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                ))}
              </div>
              <p className="quote">"My braces treatment was handled expertly. The entire team is professional, and the clinic environment is so comforting."</p>
              <p className="author">- Priya M.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about our dental services.</p>
          </div>
          <div className="faq-container">
            {[
              { q: "Do you provide painless root canal treatments?", a: "Yes, we use advanced anesthetics and modern endodontic techniques to ensure that your root canal treatment is as comfortable and pain-free as possible." },
              { q: "How do home visits for artificial dentures work?", a: "We offer specialized home visits for elderly patients or those with mobility issues, like Parkinson's. Our team will visit your home for impressions and fittings to ensure maximum comfort." },
              { q: "What are your clinic timings?", a: "Both our West Marredpally and Mettuguda clinics are open from Monday to Saturday, 10:00 AM to 8:00 PM. We recommend booking an appointment in advance to avoid waiting." }
            ].map((item, i) => (
              <div key={i} className="faq-item">
                <button className="faq-question">{item.q} <span className="faq-icon">+</span></button>
                <div className="faq-answer"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className="section alt-bg">
        <div className="container">
          <div className="section-header">
            <h2>Visit Us</h2>
            <p>Two convenient locations in Secunderabad to serve you better.</p>
          </div>
          <div className="loc-container">
            <div className="location-card">
              <div className="loc-details">
                <h3>West Marredpally Clinic</h3>
                <p><strong>Address:</strong> 78- G, W Marredpally Rd, Above Bharat Bazaar, Secunderabad, Telangana 500026</p>
                <p><strong>Phone:</strong> 9885511349</p>
                <p><strong>Hours:</strong> Mon - Sat: 10:00 AM - 8:00 PM</p>
              </div>
              <div className="loc-map">
                <iframe
                  title="West Marredpally Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15224.238692751502!2d78.49079549830504!3d17.443152431626294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a6b6c07ab0b%3A0x6b6375001c90038b!2sWest%20Marredpally%2C%20Secunderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  allowFullScreen="" loading="lazy"
                ></iframe>
              </div>
            </div>
            <div className="location-card">
              <div className="loc-details">
                <h3>Mettuguda Clinic</h3>
                <p><strong>Address:</strong> Mettuguda Main Road, Secunderabad, Telangana</p>
                <p><strong>Phone:</strong> 9885511349</p>
                <p><strong>Hours:</strong> Mon - Sat: 10:00 AM - 8:00 PM</p>
              </div>
              <div className="loc-map">
                <iframe
                  title="Mettuguda Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30452.128821035043!2d78.50202165!3d17.4332824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a42f65f02c9%3A0xf695c021c27e852d!2sMettuguda%2C%20Secunderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  allowFullScreen="" loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.svg" alt="Radhika Dental Logo" className="footer-logo-img" />
              <h3>Radhika Super Speciality</h3>
            </div>
            <p>Chief Dentist: <strong>Dr. Atla Subramanyam Reddy, BDS</strong></p>
          </div>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#testimonials">Reviews</a>
            <a href="#locations">Locations</a>
            <Link to="/enquiry" className="text-primary font-bold hover:underline">Online Enquiry</Link>
            <Link to="/dashboard" className="text-primary font-bold hover:underline">Admin Login</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Radhika Super Speciality Dental Hospital. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Floating Actions */}
      <div className="floating-actions">
        <a href="tel:9885511349" className="call-float" aria-label="Call Us">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z" /></svg>
        </a>
        <a href="https://wa.me/919885511349" className="whatsapp-float" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.3c-33.1 0-65.5-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.1l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 56.1 0 108.8 21.9 148.4 61.5 39.6 39.6 61.4 92.3 61.4 148.4 0 101.8-82.8 184.5-184.6 184.5zM324.9 261c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-2.6-4.5 2.6-4.2 8-15 2.8-5.6 1.4-10.4-.9-15-2.3-4.6-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>
        </a>
      </div>

      {/* AI Chatbot Modal (Commented out for now) */}
      {/* {isChatOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md h-[80vh] flex flex-col relative overflow-hidden shadow-2xl animate-fade-up">
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors border border-gray-200"
              aria-label="Close Chat"
            >
              <X size={20} />
            </button>
            <iframe 
              src="https://app.fastbots.ai/embed/cmpm7a9ac09yfqn1pztpqtw4a" 
              className="w-full h-full border-none"
              title="AI Chatbot"
            />
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Landing;
