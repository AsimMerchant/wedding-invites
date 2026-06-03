document.addEventListener('DOMContentLoaded', () => {
    
    // --- Cinematic Loader ---
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 1000);
        }
    }, 1500); // 1.5s loader duration

    // --- Audio Control ---
    const audioBtn = document.getElementById('audio-btn');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;
    
    if (audioBtn && bgMusic) {
        audioBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                audioBtn.classList.remove('playing');
                audioBtn.querySelector('.audio-text').innerText = 'Play Audio';
            } else {
                bgMusic.play();
                audioBtn.classList.add('playing');
                audioBtn.querySelector('.audio-text').innerText = 'Pause Audio';
            }
            isPlaying = !isPlaying;
        });
    }

    // --- Spotlight Cursor Effect ---
    const spotlight = document.querySelector('.spotlight');
    
    document.addEventListener('mousemove', (e) => {
        if (!spotlight) return;
        const x = e.clientX;
        const y = e.clientY;
        spotlight.style.setProperty('--x', `${x}px`);
        spotlight.style.setProperty('--y', `${y}px`);
    });

    // Dim spotlight over certain sections (optional enhancement)
    const timelineBlocks = document.querySelectorAll('.timeline-block');
    timelineBlocks.forEach(block => {
        block.addEventListener('mouseenter', () => {
            spotlight.style.background = 'radial-gradient(circle 400px at var(--x, 50%) var(--y, 50%), transparent 0%, rgba(5,5,5,0.7) 100%)';
        });
        block.addEventListener('mouseleave', () => {
            spotlight.style.background = 'radial-gradient(circle 300px at var(--x, 50%) var(--y, 50%), transparent 0%, rgba(5,5,5,0.85) 100%)';
        });
    });

    // --- Parallax Effect ---
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            parallaxElements.forEach(el => {
                const speed = el.getAttribute('data-speed') || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    });

    // --- Scroll Reveals ---
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-slide-left, .reveal-slide-right, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Cinematic Morphing Grid (View Transitions) ---
    const galleryImages = document.querySelectorAll('.g-img');
    const photoOverlay = document.getElementById('photo-overlay');
    const expandedPhoto = document.getElementById('expanded-photo');
    const closePhotoBtn = document.getElementById('close-photo-btn');
    const photoOverlayBackdrop = document.querySelector('.photo-overlay-backdrop');
    
    let activePhotoElement = null;

    function openPhoto(photoElement) {
        if (!document.startViewTransition) {
            // Fallback
            expandedPhoto.style.backgroundImage = photoElement.style.backgroundImage;
            photoOverlay.classList.add('active');
            activePhotoElement = photoElement;
            return;
        }

        photoOverlay.style.transition = 'none';
        photoElement.style.viewTransitionName = 'morphing-photo';
        
        const transition = document.startViewTransition(() => {
            photoElement.style.viewTransitionName = '';
            expandedPhoto.style.backgroundImage = photoElement.style.backgroundImage;
            photoOverlay.classList.add('active');
            activePhotoElement = photoElement;
        });

        transition.finished.then(() => {
            photoOverlay.style.transition = '';
        });
    }

    function closePhoto() {
        if (!activePhotoElement) return;

        if (!document.startViewTransition) {
            // Fallback
            photoOverlay.classList.remove('active');
            activePhotoElement = null;
            return;
        }

        photoOverlay.style.transition = 'none';
        const transition = document.startViewTransition(() => {
            photoOverlay.classList.remove('active');
            if (activePhotoElement) {
                activePhotoElement.style.viewTransitionName = 'morphing-photo';
            }
        });

        transition.finished.then(() => {
            if (activePhotoElement) {
                activePhotoElement.style.viewTransitionName = '';
                activePhotoElement = null;
            }
            photoOverlay.style.transition = '';
        });
    }

    galleryImages.forEach(img => {
        img.addEventListener('click', () => openPhoto(img));
    });

    closePhotoBtn?.addEventListener('click', closePhoto);
    photoOverlayBackdrop?.addEventListener('click', closePhoto);

});
