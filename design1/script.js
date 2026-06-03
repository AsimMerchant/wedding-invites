/* ═══════════════════════════════════════════════════════════
   ASIM & FEMINA — WEDDING INVITATION
   Script: Animations, Countdown, Particles, Parallax
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. LOADING SCREEN
     ───────────────────────────────────────────── */
  const loadingScreen = document.getElementById('loading-screen');

  function hideLoader() {
    loadingScreen.classList.add('hidden');
    document.body.style.overflow = '';
    initAfterLoad();
  }

  // Prevent scroll during load
  document.body.style.overflow = 'hidden';

  window.addEventListener('load', function () {
    // Minimum display time for the loader so user sees it
    setTimeout(hideLoader, 1800);
  });

  /* ─────────────────────────────────────────────
     2. SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
     ───────────────────────────────────────────── */
  function initScrollAnimations() {
    const animElements = document.querySelectorAll(
      '.anim-fade-in-up, .anim-fade-in-left, .anim-fade-in-right, .anim-scale-in, .anim-watercolor'
    );

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseFloat(el.dataset.delay) || 0;
            setTimeout(function () {
              el.classList.add('visible');
            }, delay * 1000);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ─────────────────────────────────────────────
     3. FLOATING PARTICLES (Gold / Rose sparkles)
     ───────────────────────────────────────────── */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 55;

    const colors = [
      'rgba(199,133,122,0.5)',
      'rgba(212,165,116,0.5)',
      'rgba(230,168,156,0.4)',
      'rgba(199,133,122,0.3)',
      'rgba(232,201,168,0.4)',
      'rgba(240,216,168,0.35)',
    ];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.3 - 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;

        const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

        // Reset particle if off screen
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Draw sparkle
        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();

        // Diamond / sparkle shape
        if (p.size > 1.5) {
          const s = p.size;
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s * 0.6, p.y);
          ctx.lineTo(p.x, p.y + s);
          ctx.lineTo(p.x - s * 0.6, p.y);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }

        ctx.fill();

        // Glow
        if (p.size > 1.2) {
          ctx.globalAlpha = currentOpacity * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ─────────────────────────────────────────────
     4. PARALLAX BACKGROUNDS
     ───────────────────────────────────────────── */
  function initParallax() {
    const hero = document.querySelector('.section--hero');
    const constellations = document.querySelectorAll('.constellation-bg');

    function onScroll() {
      const scrollY = window.pageYOffset;

      // Hero parallax
      if (hero) {
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
          heroContent.style.transform = 'translateY(' + scrollY * 0.25 + 'px)';
          heroContent.style.opacity = Math.max(0, 1 - scrollY / 700);
        }
      }

      // Constellation parallax
      constellations.forEach(function (c) {
        const rect = c.parentElement.getBoundingClientRect();
        const offset = rect.top * 0.05;
        c.style.transform = 'translateY(' + offset + 'px)';
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────────────────────────────────────────
     5. TIMELINE LINE REVEAL
     ───────────────────────────────────────────── */
  function initTimelineReveal() {
    const timelineLine = document.getElementById('timeline-line');
    if (!timelineLine) return;

    const section = document.querySelector('.section--events');

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;

      // How much of the section is visible
      const scrolledInto = windowHeight - sectionTop;
      const progress = Math.max(0, Math.min(1, scrolledInto / sectionHeight));

      timelineLine.style.transform = 'translateX(-50%) scaleY(' + progress + ')';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─────────────────────────────────────────────
     6. COUNTDOWN TIMER — Dec 4, 2026 00:00:00 IST
     ───────────────────────────────────────────── */
  function initCountdown() {
    // Dec 4, 2026 midnight IST = Dec 3, 2026 18:30:00 UTC
    const target = new Date('2026-12-04T00:00:00+05:30').getTime();

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function pad(n, len) {
      var s = String(n);
      while (s.length < len) s = '0' + s;
      return s;
    }

    function update() {
      const now = Date.now();
      let diff = target - now;

      if (diff <= 0) {
        daysEl.textContent = '000';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * 1000 * 60 * 60 * 24;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * 1000 * 60 * 60;
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * 1000 * 60;
      const seconds = Math.floor(diff / 1000);

      daysEl.textContent = pad(days, 3);
      hoursEl.textContent = pad(hours, 2);
      minutesEl.textContent = pad(minutes, 2);
      secondsEl.textContent = pad(seconds, 2);
    }

    update();
    setInterval(update, 1000);
  }

  /* ─────────────────────────────────────────────
     7. MUSIC TOGGLE (placeholder)
     ───────────────────────────────────────────── */
  function initMusicToggle() {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;

    let playing = true;

    btn.addEventListener('click', function () {
      playing = !playing;
      btn.classList.toggle('paused', !playing);
      // When actual audio is added:
      // if (playing) audio.play(); else audio.pause();
    });
  }

  /* ─────────────────────────────────────────────
     8. SMOOTH SCROLL HIDING for scroll indicator
     ───────────────────────────────────────────── */
  function initScrollIndicatorHide() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    function check() {
      if (window.pageYOffset > 200) {
        indicator.style.opacity = '0';
        indicator.style.pointerEvents = 'none';
      } else {
        indicator.style.opacity = '1';
        indicator.style.pointerEvents = '';
      }
    }

    window.addEventListener('scroll', check, { passive: true });
  }

  /* ─────────────────────────────────────────────
     9. GSAP GALLERY HORIZONTAL SCROLL
     ───────────────────────────────────────────── */
  function initGalleryScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    gsap.registerPlugin(ScrollTrigger);

    const galleryScroll = document.querySelector('.gallery-horizontal-scroll');
    const gallerySection = document.querySelector('.section--gallery');
    const pinnedContainer = document.querySelector('.gallery-pinned-container');

    if (!galleryScroll || !gallerySection || !pinnedContainer) return;

    function getScrollAmount() {
      let scrollWidth = galleryScroll.scrollWidth;
      return -(scrollWidth - window.innerWidth + window.innerWidth * 0.1); 
    }

    const tween = gsap.to(galleryScroll, {
      x: getScrollAmount,
      ease: "none"
    });

    ScrollTrigger.create({
      trigger: gallerySection,
      start: "top top",
      end: () => `+=${getScrollAmount() * -1}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true
    });
  }

  /* ─────────────────────────────────────────────
     INIT AFTER LOAD
     ───────────────────────────────────────────── */
  function initAfterLoad() {
    initScrollAnimations();
    initParticles();
    initParallax();
    initTimelineReveal();
    initCountdown();
    initMusicToggle();
    initScrollIndicatorHide();
    initGalleryScroll();
  }
})();
