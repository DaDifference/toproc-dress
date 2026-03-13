/* =============================================
   TOPROC DRESS — Main JavaScript (WTAPS-Style)
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // --- Intro Animation (once per session) ---
  const introOverlay = document.getElementById('intro-overlay');
  if (introOverlay) {
    if (sessionStorage.getItem('toproc-intro-seen')) {
      introOverlay.classList.add('hidden');
    } else {
      sessionStorage.setItem('toproc-intro-seen', '1');
      setTimeout(() => {
        introOverlay.classList.add('hidden');
        // Trigger hero animation after intro fades
        const hero = document.getElementById('hero');
        if (hero) {
          hero.classList.add('animated');
          const heroBg = document.getElementById('hero-bg');
          if (heroBg) heroBg.classList.add('clip-animate');
        }
      }, 2000);
    }
  }

  // If no intro overlay (sub-pages) or intro already seen, animate hero immediately
  if (!introOverlay || sessionStorage.getItem('toproc-intro-seen')) {
    const hero = document.getElementById('hero');
    if (hero) {
      setTimeout(() => {
        hero.classList.add('animated');
        const heroBg = document.getElementById('hero-bg');
        if (heroBg) heroBg.classList.add('clip-animate');
      }, 300);
    }
  }

  // --- Header Hide/Show on Scroll ---
  const header = document.getElementById('site-header');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 200) {
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        header.classList.add('header-hidden');
      } else {
        // Scrolling up
        header.classList.remove('header-hidden');
      }
    } else {
      header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // --- Mobile Navigation ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

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
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Parallax Effect (Desktop only) ---
  if (window.innerWidth > 1024) {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length) {
      window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            el.style.transform = `translateY(${scrollY * speed}px)`;
          });
        });
      }, { passive: true });
    }
  }

  // --- Swiper Carousel (Feature section) ---
  if (typeof Swiper !== 'undefined' && document.querySelector('.feature-swiper')) {
    new Swiper('.feature-swiper', {
      slidesPerView: 1.2,
      spaceBetween: 8,
      breakpoints: {
        750: { slidesPerView: 2.5, spaceBetween: 8 },
        1024: { slidesPerView: 3.5, spaceBetween: 8 },
        1281: { slidesPerView: 4.5, spaceBetween: 8 },
      }
    });
  }

  // --- Brand Statement Word Animation ---
  const brandStatement = document.getElementById('brand-statement');
  if (brandStatement) {
    const text = brandStatement.innerHTML;
    // Wrap each word in a span
    const words = text.split(/(\s+|<[^>]+>)/);
    let html = '';
    let delay = 0;
    words.forEach(word => {
      if (word.match(/^</) || word.match(/^\s+$/)) {
        html += word;
      } else if (word.trim()) {
        html += `<span class="word" style="transition-delay:${delay}s">${word}</span>`;
        delay += 0.06;
      }
    });
    brandStatement.innerHTML = html;

    const brandObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          brandStatement.classList.add('animated');
          brandObserver.unobserve(brandStatement);
        }
      });
    }, { threshold: 0.2 });
    brandObserver.observe(brandStatement);
  }

  // --- Active Nav Highlighting ---
  const currentPath = window.location.pathname;
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Contact Form Mailto ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('#name').value;
      const email = contactForm.querySelector('#email').value;
      const subject = contactForm.querySelector('#subject').value;
      const message = contactForm.querySelector('#message').value;

      const mailtoLink = `mailto:toprocdress.bro@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailtoLink;
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
