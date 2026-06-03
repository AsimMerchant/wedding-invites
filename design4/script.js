document.addEventListener('DOMContentLoaded', () => {
    
    // --- Loader ---
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 1000);
        }
    }, 1500); // Give time for the pulse animation to show

    // --- Audio Control ---
    const audioToggle = document.getElementById('audio-control');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;
    
    if (audioToggle && bgMusic) {
        audioToggle.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                audioToggle.classList.remove('playing');
                audioToggle.querySelector('.music-text').innerText = 'Play Music';
            } else {
                bgMusic.play();
                audioToggle.classList.add('playing');
                audioToggle.querySelector('.music-text').innerText = 'Pause Music';
            }
            isPlaying = !isPlaying;
        });
    }

    // --- Intersection Observer for Reveals ---
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-slide-up');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only reveal once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Falling Leaves ---
    const leavesContainer = document.getElementById('leaves-container');
    const leafColors = ['#d4af37', '#cad2c5', '#52796f'];
    
    function createLeaf() {
        if (!leavesContainer) return;
        
        const leaf = document.createElement('div');
        leaf.classList.add('leaf');
        
        // Random properties
        const startX = Math.random() * window.innerWidth;
        const endX = (Math.random() - 0.5) * 200 + 'px';
        const rot = Math.random() * 360 + 360 + 'deg';
        const duration = Math.random() * 10 + 10; // 10 to 20 seconds
        const size = Math.random() * 15 + 10 + 'px';
        const color = leafColors[Math.floor(Math.random() * leafColors.length)];
        
        leaf.style.left = startX + 'px';
        leaf.style.width = size;
        leaf.style.height = size;
        leaf.style.backgroundColor = color;
        leaf.style.animationDuration = duration + 's';
        leaf.style.setProperty('--end-x', endX);
        leaf.style.setProperty('--rot', rot);
        
        leavesContainer.appendChild(leaf);
        
        // Remove leaf after animation completes
        setTimeout(() => {
            leaf.remove();
        }, duration * 1000);
    }

    // Create a leaf every 800ms
    setInterval(createLeaf, 800);
    
    // Initial leaves
    for(let i=0; i<5; i++) {
        setTimeout(createLeaf, i * 200);
    }

    // --- Accordion Gallery ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        item.addEventListener('click', () => {
            accordionItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // --- Parallax Effect ---
    const parallaxBg = document.getElementById('gallery-bg');
    if (parallaxBg) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const rect = parallaxBg.parentElement.getBoundingClientRect();
                
                // Only animate if in view
                if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                    const yPos = -(scrolled * 0.15);
                    parallaxBg.style.transform = `translateY(${yPos}px)`;
                }
            });
        });
    }
});
