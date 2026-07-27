// Intersection Observer for smooth reveal animations
document.addEventListener('DOMContentLoaded', () => {
  // Add reveal class to more elements for a smoother experience
  const elementsToReveal = document.querySelectorAll('.card, .location-card, .section-header');
  elementsToReveal.forEach(el => el.classList.add('reveal'));

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach((el, index) => {
    // Add a slight stagger delay based on DOM order for grid items
    if(el.classList.contains('card') || el.classList.contains('location-card')) {
      el.style.transitionDelay = `${(index % 3) * 0.15}s`;
    }
    observer.observe(el);
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // FAQ Accordion Logic
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.parentElement;
      const isOpen = faqItem.classList.contains('open');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Open the clicked FAQ if it wasn't already open
      if (!isOpen) {
        faqItem.classList.add('open');
        const answer = faqItem.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Mouse Shadow Effect
  const mouseShadow = document.createElement('div');
  mouseShadow.classList.add('mouse-shadow');
  document.body.appendChild(mouseShadow);

  document.addEventListener('mousemove', (e) => {
    mouseShadow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // Enhance hover effect on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .card, .location-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      mouseShadow.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      mouseShadow.classList.remove('hovering');
    });
  });

  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const body = document.body;
  const currentTheme = localStorage.getItem('theme');

  function updateThemeUI(isDark) {
    if (isDark) {
      body.classList.add('dark-theme');
      if (themeToggle) themeToggle.textContent = '☀️';
      if (themeToggleMobile) themeToggleMobile.textContent = '☀️ Dark Mode';
    } else {
      body.classList.remove('dark-theme');
      if (themeToggle) themeToggle.textContent = '🌙';
      if (themeToggleMobile) themeToggleMobile.textContent = '🌙 Dark Mode';
    }
  }

  if (currentTheme === 'dark') {
    updateThemeUI(true);
  }

  function toggleTheme() {
    const isDark = !body.classList.contains('dark-theme');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

  // Hamburger Menu Logic
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
});
