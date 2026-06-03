/* ==========================================
   WEDDING INVITATION - LAVENDER & CHAMPAGNE
   JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ── Loading Screen ──
  initLoadingScreen();

  // ── Floating Particles ──
  initParticles();

  // ── Scroll Animations (Intersection Observer) ──
  initScrollAnimations();

  // ── Countdown Timer ──
  initCountdown();

  // ── Parallax Effects ──
  initParallax();

  // ── Music Toggle ──
  initMusicToggle();

  // ── Text Reveal ──
  initTextReveal();

  // ── Image Trail Gallery ──
  initImageTrailGallery();
});

/* ═══════════════════════════
   LOADING SCREEN
   ═══════════════════════════ */
function initLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Remove from DOM after transition
      setTimeout(() => {
        loader.remove();
      }, 900);
    }, 1800);
  });

  // Fallback: hide after 4 seconds regardless
  setTimeout(() => {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 900);
    }
  }, 4000);
}

/* ═══════════════════════════
   FLOATING PARTICLES
   ═══════════════════════════ */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = [
    'rgba(212, 175, 55, 0.3)',
    'rgba(212, 197, 226, 0.3)',
    'rgba(230, 200, 102, 0.25)',
    'rgba(194, 168, 214, 0.25)',
    'rgba(212, 175, 55, 0.15)',
    'rgba(232, 223, 240, 0.2)',
  ];

  const particleCount = window.innerWidth < 600 ? 15 : 30;

  for (let i = 0; i < particleCount; i++) {
    createParticle(container, colors);
  }

  // Continuously create new particles
  setInterval(() => {
    if (container.children.length < particleCount + 5) {
      createParticle(container, colors);
    }
  }, 3000);
}

function createParticle(container, colors) {
  const particle = document.createElement('div');
  particle.classList.add('particle');

  const size = Math.random() * 8 + 3;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const duration = Math.random() * 15 + 12;
  const delay = Math.random() * 10;

  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${left}%`;
  particle.style.background = `radial-gradient(circle, ${color}, transparent)`;
  particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;

  container.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => {
    if (particle.parentNode) {
      particle.remove();
    }
  }, (duration + delay) * 1000);
}

/* ═══════════════════════════
   SCROLL ANIMATIONS
   ═══════════════════════════ */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve - allow re-animation if needed
      }
    });
  }, observerOptions);

  // Observe all elements with reveal classes
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children'
  );

  revealElements.forEach((el) => {
    observer.observe(el);
  });
}

/* ═══════════════════════════
   COUNTDOWN TIMER
   ═══════════════════════════ */
function initCountdown() {
  // Target: December 4, 2026, 00:00:00 IST (UTC+5:30)
  // IST offset = +5:30 = +330 minutes
  const targetDate = new Date('2026-12-04T00:00:00+05:30');

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  let prevValues = { days: -1, hours: -1, mins: -1, secs: -1 };

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minsEl.textContent = '0';
      secsEl.textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    // Animate changed numbers
    if (days !== prevValues.days) {
      animateNumber(daysEl, days);
      prevValues.days = days;
    }
    if (hours !== prevValues.hours) {
      animateNumber(hoursEl, hours);
      prevValues.hours = hours;
    }
    if (mins !== prevValues.mins) {
      animateNumber(minsEl, mins);
      prevValues.mins = mins;
    }
    if (secs !== prevValues.secs) {
      animateNumber(secsEl, secs);
      prevValues.secs = secs;
    }
  }

  function animateNumber(el, value) {
    el.textContent = value;
    el.classList.remove('flip');
    // Trigger reflow
    void el.offsetWidth;
    el.classList.add('flip');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ═══════════════════════════
   PARALLAX
   ═══════════════════════════ */
function initParallax() {
  const hero = document.querySelector('.hero');
  const countdown = document.querySelector('.countdown-section');

  if (!hero && !countdown) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;

        if (hero) {
          const heroPattern = hero.querySelector('.hero-pattern');
          if (heroPattern) {
            heroPattern.style.transform = `translateY(${scrollY * 0.3}px)`;
          }
          const heroContent = hero.querySelector('.hero-content');
          if (heroContent) {
            heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
            heroContent.style.opacity = Math.max(0, 1 - scrollY / 800);
          }
        }

        if (countdown) {
          const countdownRect = countdown.getBoundingClientRect();
          const countdownPattern = countdown.querySelector('.countdown-pattern');
          if (countdownPattern && countdownRect.top < window.innerHeight) {
            const progress = (window.innerHeight - countdownRect.top) / (window.innerHeight + countdownRect.height);
            countdownPattern.style.transform = `translateY(${progress * -60}px)`;
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ═══════════════════════════
   MUSIC TOGGLE
   ═══════════════════════════ */
function initMusicToggle() {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;

  let isPlaying = false;

  btn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    btn.classList.toggle('playing', isPlaying);
    btn.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
    // Audio would be handled here with actual audio file
    // const audio = document.getElementById('bg-music');
    // if (audio) { isPlaying ? audio.play() : audio.pause(); }
  });
}

/* ═══════════════════════════
   TEXT REVEAL ANIMATION
   ═══════════════════════════ */
function initTextReveal() {
  const textElements = document.querySelectorAll('.text-reveal');
  if (!textElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent;
          el.textContent = '';
          el.style.opacity = '1';

          let i = 0;
          const interval = setInterval(() => {
            if (i < text.length) {
              el.textContent += text[i];
              i++;
            } else {
              clearInterval(interval);
            }
          }, 30);

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  textElements.forEach((el) => observer.observe(el));
}

/* ═══════════════════════════
   IMAGE TRAIL GALLERY
   ═══════════════════════════ */
function initImageTrailGallery() {
  const container = document.getElementById('imageTrailContainer');
  if (!container) return;

  const images = Array.from(container.querySelectorAll('.trail-image'));
  if (images.length === 0 || typeof gsap === 'undefined') return;

  let globalIndex = 0;
  let last = { x: 0, y: 0 };
  let isFirstMove = true;

  const activate = (image, x, y) => {
    image.style.left = `${x}px`;
    image.style.top = `${y}px`;
    image.style.zIndex = globalIndex;
    
    // Animate in
    gsap.killTweensOf(image);
    gsap.fromTo(image, 
      { opacity: 0, scale: 0.2, rotation: (Math.random() - 0.5) * 30 },
      { opacity: 1, scale: 1, rotation: (Math.random() - 0.5) * 20, duration: 0.6, ease: "back.out(1.7)" }
    );
    
    // Animate out after a delay
    gsap.to(image, {
      opacity: 0,
      scale: 0.8,
      duration: 1.2,
      ease: "power2.out",
      delay: 1.5
    });
  }

  const handleMove = (e) => {
    const rect = container.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      container.classList.add('active');
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (isFirstMove) {
      isFirstMove = false;
      last = { x, y };
      return;
    }

    const distance = Math.hypot(x - last.x, y - last.y);
    if (distance > 70) {
      const img = images[globalIndex % images.length];
      activate(img, x, y);
      last = { x, y };
      globalIndex++;
    }
  };

  container.addEventListener('mousemove', handleMove);
  container.addEventListener('touchmove', handleMove, { passive: true });
  container.addEventListener('touchstart', handleMove, { passive: true });
  container.addEventListener('touchend', () => container.classList.remove('active'));
}
