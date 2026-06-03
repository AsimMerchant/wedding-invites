/* ============================================
   WEDDING INVITATION — JAVASCRIPT
   Asim & Femina · December 2026
   ============================================ */

(function () {
    'use strict';

    // ---- Configuration ----
    const WEDDING_DATE = new Date('2026-12-04T00:00:00+05:30');
    const PETAL_COLORS = [
        '#e8b4b8', '#f2d0d3', '#d99ea3', '#c9a84c',
        '#dfc06e', '#f5e6e7', '#fce4ec', '#e1c7c9'
    ];
    const PETAL_INTERVAL = 800; // ms between petals
    const MAX_PETALS = 25;

    // ============================================
    // 1. SCROLL-TRIGGERED ANIMATIONS
    // ============================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');

        if (!animatedElements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const delay = parseInt(el.dataset.delay || '0', 10);

                        setTimeout(() => {
                            el.classList.add('animated');
                        }, delay);

                        // Unobserve after animation triggers (one-time)
                        observer.unobserve(el);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -60px 0px'
            }
        );

        animatedElements.forEach((el) => observer.observe(el));
    }

    // ============================================
    // 2. COUNTDOWN TIMER
    // ============================================
    function initCountdown() {
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        function updateCountdown() {
            const now = new Date();
            const diff = WEDDING_DATE - now;

            if (diff <= 0) {
                daysEl.textContent = '0';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Animate number changes
            animateNumber(daysEl, days.toString());
            animateNumber(hoursEl, hours.toString().padStart(2, '0'));
            animateNumber(minutesEl, minutes.toString().padStart(2, '0'));
            animateNumber(secondsEl, seconds.toString().padStart(2, '0'));
        }

        function animateNumber(el, newValue) {
            if (el.textContent !== newValue) {
                el.style.transform = 'scale(1.05)';
                el.textContent = newValue;
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 150);
            }
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ============================================
    // 3. FLOATING PETALS
    // ============================================
    function initFloatingPetals() {
        const container = document.getElementById('petals-container');
        if (!container) return;

        let petalCount = 0;

        function createPetal() {
            if (petalCount >= MAX_PETALS) return;

            const petal = document.createElement('div');
            petal.classList.add('petal');

            // Random properties
            const startX = Math.random() * window.innerWidth;
            const size = 8 + Math.random() * 14;
            const duration = 8 + Math.random() * 10;
            const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
            const swayAmount = -40 + Math.random() * 80;

            petal.style.left = startX + 'px';
            petal.style.top = '-20px';
            petal.style.width = size + 'px';
            petal.style.height = size + 'px';
            petal.style.backgroundColor = color;
            petal.style.animationDuration = duration + 's';
            petal.style.setProperty('--sway', swayAmount + 'px');

            // Enhanced petal shape variation
            const shapes = [
                '50% 0 50% 0',          // diamond-ish
                '60% 0 40% 0',          // asymmetric
                '50% 10% 50% 10%',      // rounded leaf
                '40% 0 60% 0',          // reverse asymmetric
            ];
            petal.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];

            container.appendChild(petal);
            petalCount++;

            // Remove after animation completes
            petal.addEventListener('animationend', () => {
                petal.remove();
                petalCount--;
            });
        }

        // Create petals at intervals
        setInterval(createPetal, PETAL_INTERVAL);

        // Create a few immediately for initial effect
        for (let i = 0; i < 5; i++) {
            setTimeout(createPetal, i * 200);
        }
    }

    // ============================================
    // 4. PARALLAX EFFECTS
    // ============================================
    function initParallax() {
        const hero = document.getElementById('hero');
        const heroPattern = hero ? hero.querySelector('.hero-pattern') : null;
        const countdownSection = document.getElementById('countdown');
        const countdownPattern = countdownSection ? countdownSection.querySelector('.hero-pattern') : null;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.pageYOffset;

                    // Hero parallax
                    if (heroPattern) {
                        heroPattern.style.transform = `translateY(${scrollY * 0.3}px)`;
                    }

                    // Countdown parallax
                    if (countdownPattern && countdownSection) {
                        const rect = countdownSection.getBoundingClientRect();
                        if (rect.top < window.innerHeight && rect.bottom > 0) {
                            const offset = (window.innerHeight - rect.top) * 0.15;
                            countdownPattern.style.transform = `translateY(${offset}px)`;
                        }
                    }

                    // Scroll indicator fade
                    const scrollIndicator = document.querySelector('.scroll-indicator');
                    if (scrollIndicator) {
                        const opacity = Math.max(0, 1 - scrollY / 300);
                        scrollIndicator.style.opacity = opacity * 0.6;
                    }

                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // 5. TIMELINE ANIMATION
    // ============================================
    function initTimelineAnimation() {
        const timelineLine = document.querySelector('.timeline-line');
        if (!timelineLine) return;

        const timeline = document.querySelector('.timeline');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        timelineLine.style.transition = 'height 2s ease-out';
                        timelineLine.style.height = '100%';
                    }
                });
            },
            {
                threshold: 0.1
            }
        );

        // Start with hidden timeline line
        timelineLine.style.height = '0';
        observer.observe(timeline);
    }

    // ============================================
    // 6. SMOOTH SECTION NAVIGATION
    // ============================================
    function initSmoothScroll() {
        // Scroll indicator click
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.cursor = 'pointer';
            scrollIndicator.addEventListener('click', () => {
                const coupleSection = document.getElementById('couple');
                if (coupleSection) {
                    coupleSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // ============================================
    // 7. GOLD SHIMMER ON COUPLE NAMES
    // ============================================
    function initShimmerEffect() {
        const ampersand = document.querySelector('.name-ampersand');
        if (ampersand) {
            ampersand.classList.add('shimmer-text');
        }
    }

    // ============================================
    // 8. HERO ENTRANCE ANIMATION
    // ============================================
    function initHeroAnimation() {
        // The hero section is always visible on load, so we trigger animations immediately
        const heroElements = document.querySelectorAll('#hero .animate-on-scroll');
        heroElements.forEach((el) => {
            const delay = parseInt(el.dataset.delay || '0', 10);
            setTimeout(() => {
                el.classList.add('animated');
            }, delay + 300); // 300ms initial delay for page load
        });
    }

    // ============================================
    // 9. MUSIC TOGGLE (Placeholder)
    // ============================================
    function initMusicToggle() {
        const btn = document.getElementById('music-toggle');
        if (!btn) return;

        let isPlaying = false;
        const iconOn = btn.querySelector('.music-icon-on');
        const iconOff = btn.querySelector('.music-icon-off');

        btn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (iconOn && iconOff) {
                iconOn.style.display = isPlaying ? 'block' : 'none';
                iconOff.style.display = isPlaying ? 'none' : 'block';
            }
            // TODO: Add actual audio playback when music file is provided
            // const audio = document.getElementById('wedding-audio');
            // if (audio) { isPlaying ? audio.play() : audio.pause(); }
        });

        // Initially show "off" state
        if (iconOn && iconOff) {
            iconOn.style.display = 'none';
            iconOff.style.display = 'block';
        }
    }

    // ============================================
    // 10. EVENT CARD HOVER GLOW
    // ============================================
    function initEventCardEffects() {
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = 'rgba(201, 168, 76, 0.3)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = 'rgba(201, 168, 76, 0.1)';
            });
        });
    }

    // ============================================
    // 11. GALLERY SWIPER CAROUSEL
    // ============================================
    function initGalleryEffects() {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.swiper-gallery', {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                coverflowEffect: {
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                loop: true
            });
        }
    }

    // ============================================
    // 12. PAGE VISIBILITY OPTIMIZATION
    // ============================================
    function initVisibilityOptimization() {
        document.addEventListener('visibilitychange', () => {
            const petalsContainer = document.getElementById('petals-container');
            if (document.hidden) {
                // Pause petal animations when tab is not visible
                if (petalsContainer) petalsContainer.style.animationPlayState = 'paused';
            } else {
                if (petalsContainer) petalsContainer.style.animationPlayState = 'running';
            }
        });
    }

    // ============================================
    // INITIALIZE EVERYTHING
    // ============================================
    function dismissLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => {
                overlay.remove();
            }, 1000);
        }
    }

    function init() {
        // Dismiss loading overlay (wait for fonts)
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setTimeout(dismissLoading, 400);
            });
        } else {
            setTimeout(dismissLoading, 800);
        }

        // Delay hero animations until after loading screen fades
        setTimeout(() => {
            initHeroAnimation();
        }, 1200);

        // Core functionality
        initScrollAnimations();
        initCountdown();
        initParallax();
        initTimelineAnimation();
        initSmoothScroll();

        // Visual enhancements
        initShimmerEffect();
        initFloatingPetals();
        initEventCardEffects();
        initGalleryEffects();

        // Controls
        initMusicToggle();

        // Performance
        initVisibilityOptimization();

        console.log('💍 Asim & Femina — Wedding Invitation loaded successfully!');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
