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
    const parallaxElements = document.querySelectorAll('.parallax-pair [data-speed]');
    const galleryParallax = document.getElementById('gallery-parallax');
    
    if (galleryParallax && parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            const rect = galleryParallax.getBoundingClientRect();
            // Check if gallery is visible in the viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrollProgress = window.innerHeight - rect.top;
                
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.getAttribute('data-speed'));
                    const yOffset = scrollProgress * speed;
                    el.style.transform = `translateY(${yOffset}px)`;
                });
            }
        });
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
