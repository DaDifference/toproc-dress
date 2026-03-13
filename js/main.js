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

    // Transparent → solid transition for home page
    if (currentScrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

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

  // --- Visual Film-strip Scroll (WTAPS-style) ---
  const visualScrollArea = document.getElementById('visual-scroll-area');
  if (visualScrollArea) {
    const visualBg = document.getElementById('visual-bg');
    const stripLeft = document.getElementById('visual-strip-left');
    const stripCenter = document.getElementById('visual-strip-center');
    const stripRight = document.getElementById('visual-strip-right');
    const darkOverlay = document.getElementById('visual-dark-overlay');

    if (visualBg && stripLeft && stripCenter && stripRight) {
      let visualTicking = false;

      // Calculate the base Y offset to vertically center each strip
      function getBaseY(strip) {
        const stripH = strip.scrollHeight;
        const parentH = visualBg.offsetHeight;
        return (parentH - stripH) / 2;
      }

      function updateVisualFilmstrip() {
        visualTicking = false;
        const scrollY = window.scrollY;
        const rect = visualScrollArea.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;
        const viewH = window.innerHeight;
        // Total scrollable distance within the scroll area (scroll-area height minus one viewport)
        const scrollRange = visualScrollArea.offsetHeight - viewH;

        // progress: 0 when sticky starts (top of section at top of viewport)
        //           1 when sticky ends (scrolled through entire scroll area)
        const raw = (scrollY - sectionTop) / scrollRange;
        const progress = Math.max(0, Math.min(1, raw));

        // Photos: scale from 1.8 → 1.0 (zoomed in at start, fits viewport at end)
        // At 1.8x the center column fills the screen, sides overflow
        // At 1.0x everything fits within the viewport as a 3-column grid
        const scale = 1.8 - 0.8 * progress;
        visualBg.style.transform = 'scale(' + scale + ')';

        // Photos fade in gradually
        const photoProgress = Math.max(0, (progress - 0.08) / 0.92);
        visualBg.style.opacity = Math.min(1, photoProgress * 1.4);

        // Dark overlay: starts fully opaque, gradually reveals photos with dark filter
        // progress 0-0.12: fully black
        // progress 0.12-0.55: fade from black to dark filter
        // progress 0.55+: dark filter (opacity ~0.35)
        if (darkOverlay) {
          let overlayOpacity;
          if (progress < 0.12) {
            overlayOpacity = 1;
          } else {
            const fadeProgress = Math.min(1, (progress - 0.12) / 0.43);
            overlayOpacity = Math.max(0.35, 1 - fadeProgress * 0.65);
          }
          darkOverlay.style.opacity = overlayOpacity;
        }

        // Parallax: differential vertical offset for film-strip movement
        const maxShift = viewH * 0.18;
        const shift = progress * maxShift;
        const baseLeft = getBaseY(stripLeft);
        const baseCenter = getBaseY(stripCenter);
        const baseRight = getBaseY(stripRight);

        stripCenter.style.transform = 'translateY(' + (baseCenter + shift) + 'px)';
        stripLeft.style.transform = 'translateY(' + (baseLeft - shift) + 'px)';
        stripRight.style.transform = 'translateY(' + (baseRight - shift) + 'px)';
      }

      window.addEventListener('scroll', () => {
        if (!visualTicking) {
          requestAnimationFrame(updateVisualFilmstrip);
          visualTicking = true;
        }
      }, { passive: true });

      // Initial call
      updateVisualFilmstrip();
    }
  }

  // --- Swiper Carousel (Feature section) ---
  if (typeof Swiper !== 'undefined' && document.querySelector('.feature-swiper')) {
    new Swiper('.feature-swiper', {
      slidesPerView: 1.3,
      spaceBetween: 16,
      breakpoints: {
        750: { slidesPerView: 2.3, spaceBetween: 16 },
        1024: { slidesPerView: 3.3, spaceBetween: 20 },
        1281: { slidesPerView: 3.5, spaceBetween: 24 },
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
