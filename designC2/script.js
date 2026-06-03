document.addEventListener('DOMContentLoaded', () => {
    
    // Loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
    }, 1500);

    // Initialize Vanilla Tilt for 3D glass cards
    VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.02
    });

    // Audio Logic
    const audioBtn = document.getElementById('audio-btn');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;
    
    if (audioBtn && bgMusic) {
        audioBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                audioBtn.classList.remove('playing');
            } else {
                bgMusic.play();
                audioBtn.classList.add('playing');
            }
            isPlaying = !isPlaying;
        });
    }

    // Scroll Reveals
    const revealElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // keep observing for re-trigger if wanted, or unobserve
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    // Parallax Gallery Logic
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        if (window.innerWidth > 768) {
            const columns = document.querySelectorAll('.parallax-column');
            if (columns.length === 3) {
                // Initial offsets
                gsap.set(columns[0], { y: 40 });
                gsap.set(columns[1], { y: -40 });
                gsap.set(columns[2], { y: 20 });

                // Smooth scroll animation with scrubbing
                gsap.to(columns[0], {
                    y: -60,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".gallery-glass",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }
                });
                gsap.to(columns[1], {
                    y: 60,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".gallery-glass",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }
                });
                gsap.to(columns[2], {
                    y: -40,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".gallery-glass",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }
                });
            }
        }
    }

    // Dynamic blob cursor follow effect (optional enhancement)
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Slight movement of blobs based on mouse position
        if(blob1) blob1.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        if(blob2) blob2.style.transform = `translate(-${x * 30}px, -${y * 30}px)`;
    });

});
