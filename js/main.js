/* =============================================
   TOPROC DRESS - Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // --- Loading Screen ---
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 1800);
    });
    // Fallback: hide after 3s even if load event was missed
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 3000);
  }

  // --- Sticky Header ---
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // --- Mobile Navigation ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll Reveal (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Parallax Effect ---
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length > 0 && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const offsetY = (rect.top + scrollY - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offsetY}px)`;
      });
    }, { passive: true });
  }

  // --- Custom Cursor (Desktop only) ---
  const cursorDot = document.querySelector('.cursor-dot');
  if (cursorDot && window.innerWidth >= 1025) {
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    function animateCursor() {
      dotX += (cursorX - dotX) * 0.15;
      dotY += (cursorY - dotY) * 0.15;
      cursorDot.style.left = dotX - 4 + 'px';
      cursorDot.style.top = dotY - 4 + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .product-card, .btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Active nav link highlight ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Brand Statement Scroll Animation ---
  const brandText = document.querySelector('.brand-statement-text');
  if (brandText) {
    const words = brandText.querySelectorAll('span');
    if (words.length > 0) {
      const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            words.forEach((word, i) => {
              setTimeout(() => {
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
              }, i * 60);
            });
            textObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      textObserver.observe(brandText);
    }
  }

  // --- Contact Form ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const subject = encodeURIComponent(formData.get('subject') || 'Inquiry');
      const body = encodeURIComponent(
        `Name: ${formData.get('name')}\n\n${formData.get('message')}`
      );
      window.location.href = `mailto:toprocdress.bro@gmail.com?subject=${subject}&body=${body}`;
    });
  }
});
