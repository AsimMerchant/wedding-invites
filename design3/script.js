/* ====================================================
   ASIM & FEMINA — MIDNIGHT BLACK & GOLD WEDDING
   JavaScript: Animations, Particles, Countdown, etc.
   ==================================================== */

(function () {
  'use strict';

  /* ---------- LOADING SCREEN ---------- */
  const loadingScreen = document.getElementById('loading-screen');

  function hideLoader() {
    loadingScreen.classList.add('hidden');
    document.body.style.overflow = '';
    initParticles();
  }

  document.body.style.overflow = 'hidden';

  window.addEventListener('load', function () {
    setTimeout(hideLoader, 1800);
  });

  /* ---------- GOLD SPARKLE / DUST PARTICLES ---------- */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.15,
      opacity: Math.random() * 0.5 + 0.1,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      hue: 40 + Math.random() * 15 // gold hue range
    };
  }

  function initParticles() {
    resizeCanvas();
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
    animateParticles();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(function (p) {
      p.x += p.speedX;
      p.y += p.speedY;

      // Twinkle
      p.opacity += p.opacityDir * 0.003;
      if (p.opacity > 0.6) p.opacityDir = -1;
      if (p.opacity < 0.05) p.opacityDir = 1;

      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 60%, ' + p.opacity + ')';
      ctx.fill();
    });

    animFrame = requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', function () {
    resizeCanvas();
  });

  /* ---------- SCROLL-TRIGGERED ANIMATIONS ---------- */
  const animElements = document.querySelectorAll('[data-animate]');
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animElements.forEach(function (el) {
    observer.observe(el);
  });

  /* ---------- TIMELINE LINE REVEAL ---------- */
  const timelineLine = document.getElementById('timeline-line');
  const timelineSection = document.getElementById('events');

  function updateTimelineLine() {
    if (!timelineLine || !timelineSection) return;

    const rect = timelineSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;

    let progress = 0;
    if (sectionTop < windowHeight) {
      progress = Math.min(1, (windowHeight - sectionTop) / (sectionHeight + windowHeight * 0.3));
    }

    const pseudoBefore = timelineLine.querySelector('::before');
    timelineLine.style.setProperty('--line-progress', (progress * 100) + '%');
  }

  // We need a CSS custom property for the line reveal
  // Update the CSS to use it
  const styleInject = document.createElement('style');
  styleInject.textContent = '.timeline__line::before { height: var(--line-progress, 0%) !important; }';
  document.head.appendChild(styleInject);

  /* ---------- PARALLAX BACKGROUNDS ---------- */
  function updateParallax() {
    const scrollY = window.pageYOffset;

    // Hero light rays parallax
    const lightRays = document.querySelector('.hero__light-rays');
    if (lightRays) {
      lightRays.style.transform = 'translate(-50%, calc(-50% + ' + (scrollY * 0.15) + 'px))';
    }

    // Subtle parallax on sections with radial gradients
    const sections = document.querySelectorAll('.section');
    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      const offset = rect.top * 0.05;
      section.style.backgroundPositionY = offset + 'px';
    });
  }

  /* ---------- SCROLL INDICATOR HIDE ---------- */
  const scrollIndicator = document.getElementById('scroll-indicator');
  function updateScrollIndicator() {
    if (!scrollIndicator) return;
    if (window.pageYOffset > 100) {
      scrollIndicator.style.opacity = '0';
      scrollIndicator.style.pointerEvents = 'none';
    } else {
      scrollIndicator.style.opacity = '1';
      scrollIndicator.style.pointerEvents = 'auto';
    }
  }

  /* ---------- GYROSCOPE / MOUSE TILT GALLERY ---------- */
  function initGyroGallery() {
    const items = document.querySelectorAll('.gallery__item');
    if (!items.length) return;

    // Set initial positions based on data attributes
    items.forEach(item => {
      const top = item.getAttribute('data-top');
      const left = item.getAttribute('data-left');
      const rot = item.getAttribute('data-rot');
      
      item.style.top = `${top}%`;
      item.style.left = `${left}%`;
      item.style.setProperty('--base-rot', `${rot}deg`);
    });

    const scatterContainer = document.getElementById('gallery-scatter');

    function updateTilt(x, y) {
      items.forEach((item, index) => {
        const factor = (index % 2 === 0) ? 1 : -1;
        const tiltX = x * factor * 0.5;
        const tiltY = y * factor * 0.5;
        const tiltRot = (x * y) * 0.005;

        item.style.setProperty('--tilt-x', `${tiltX}px`);
        item.style.setProperty('--tilt-y', `${tiltY}px`);
        item.style.setProperty('--tilt-rot', `${tiltRot}deg`);
      });
    }

    // Desktop Mouse Fallback
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * 100;
      updateTilt(x, y);
    });

    // Mobile Gyroscope
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          const x = Math.max(-45, Math.min(45, e.gamma));
          const y = Math.max(-45, Math.min(45, e.beta - 45)); // assume holding phone at 45deg
          updateTilt(x, y);
        }
      }, true);
    }
  }

  initGyroGallery();

  /* ---------- SCROLL EVENT LISTENER ---------- */
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateTimelineLine();
        updateParallax();
        updateScrollIndicator();
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ---------- COUNTDOWN TIMER ---------- */
  // Target: December 4, 2026, 00:00:00 IST (UTC+05:30)
  const targetDate = new Date('2026-12-04T00:00:00+05:30').getTime();

  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  function padNum(n, len) {
    return String(n).padStart(len || 2, '0');
  }

  function updateCountdown() {
    const now = Date.now();
    let diff = targetDate - now;

    if (diff <= 0) {
      cdDays.textContent = '000';
      cdHours.textContent = '00';
      cdMinutes.textContent = '00';
      cdSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);

    cdDays.textContent = padNum(days, 3);
    cdHours.textContent = padNum(hours);
    cdMinutes.textContent = padNum(minutes);
    cdSeconds.textContent = padNum(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- MUSIC TOGGLE ---------- */
  const musicBtn = document.getElementById('music-toggle');
  let musicPlaying = false;

  musicBtn.addEventListener('click', function () {
    musicPlaying = !musicPlaying;
    musicBtn.classList.toggle('playing', musicPlaying);
    // Placeholder: actual audio playback would go here
    // const audio = new Audio('music.mp3');
    // if (musicPlaying) audio.play(); else audio.pause();
  });

  /* ---------- GALLERY HOVER GLOW & GYROSCOPE TILT ---------- */
  const galleryItems = document.querySelectorAll('.gallery__item');
  const galleryScatter = document.getElementById('gallery-scatter');

  // Base setup
  galleryItems.forEach(function (item) {
    const rot = item.getAttribute('data-rot') || 0;
    const top = item.getAttribute('data-top') || 50;
    const left = item.getAttribute('data-left') || 50;
    
    item.style.setProperty('--base-rot', rot + 'deg');
    item.style.top = top + '%';
    item.style.left = left + '%';

    // Hover glow
    item.addEventListener('mousemove', function (e) {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      item.style.background = 'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(212,168,54,0.08) 0%, transparent 60%)';
    });
    item.addEventListener('mouseleave', function () {
      item.style.background = '';
    });
  });

  // Tilt update logic
  function updateGalleryTilt(tiltX, tiltY) {
    galleryItems.forEach((item, index) => {
      const factor = (index % 3 + 1) * 0.4; // 0.4, 0.8, 1.2
      const moveX = tiltX * 30 * factor;
      const moveY = tiltY * 30 * factor;
      const rot = tiltX * 8 * factor;
      
      item.style.setProperty('--tilt-x', moveX + 'px');
      item.style.setProperty('--tilt-y', moveY + 'px');
      item.style.setProperty('--tilt-rot', rot + 'deg');
    });
  }

  // Device orientation
  let hasOrientation = false;
  window.addEventListener('deviceorientation', function (e) {
    if (e.beta === null || e.gamma === null) return;
    hasOrientation = true;
    
    let tiltX = e.gamma / 45;
    let tiltY = (e.beta - 45) / 45;
    
    tiltX = Math.max(-1, Math.min(1, tiltX));
    tiltY = Math.max(-1, Math.min(1, tiltY));
    
    updateGalleryTilt(tiltX, tiltY);
  });

  // Mouse fallback
  if (galleryScatter) {
    galleryScatter.addEventListener('mousemove', function (e) {
      if (hasOrientation) return;
      const rect = galleryScatter.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const tiltX = (x / rect.width) * 2 - 1;
      const tiltY = (y / rect.height) * 2 - 1;
      
      updateGalleryTilt(tiltX, tiltY);
    });
    galleryScatter.addEventListener('mouseleave', function () {
      if (hasOrientation) return;
      updateGalleryTilt(0, 0);
    });
  }

  /* ---------- SMOOTH REVEAL ON DOM READY ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    // Initial scroll position checks
    updateTimelineLine();
    updateParallax();
    updateScrollIndicator();
  });

})();
