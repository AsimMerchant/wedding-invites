document.addEventListener('DOMContentLoaded', () => {
    
    // --- Loader & Initial Animations ---
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 800);
        }
        
        // Trigger hero staggered animation
        const heroContent = document.querySelector('.stagger-anim');
        if (heroContent) {
            heroContent.classList.add('loaded');
        }
    }, 1200);

    // --- Audio Control ---
    const audioBtn = document.getElementById('audio-control');
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

    // --- Scroll Reveals ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Countdown Timer ---
    const targetDate = new Date('2026-12-04T00:00:00+05:30').getTime();
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('mins');
    const secsEl = document.getElementById('secs');

    function updateCountdown() {
        if (!daysEl) return;
        
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minsEl.innerText = "00";
            secsEl.innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Animate changes
        animateValue(daysEl, days);
        animateValue(hoursEl, hours);
        animateValue(minsEl, minutes);
        animateValue(secsEl, seconds);
    }

    function animateValue(el, value) {
        const strVal = value < 10 ? '0' + value : value.toString();
        if (el.innerText !== strVal) {
            el.innerText = strVal;
            el.style.transform = 'scale(1.1)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 150);
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- Swipeable Polaroid Deck ---
    const deck = document.getElementById('polaroid-deck');
    if (deck) {
        let cards = Array.from(deck.querySelectorAll('.polaroid-card'));
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let startY = 0;
        let currentY = 0;

        function setupCards() {
            cards.forEach((card, index) => {
                card.style.zIndex = cards.length - index;
                if (!card.dataset.startRot) {
                    const randomRot = (Math.random() * 10) - 5;
                    card.dataset.startRot = randomRot;
                }
                card.style.transform = `translate3d(0, ${index * 15}px, ${-index * 40}px) rotateZ(${card.dataset.startRot}deg)`;
            });
        }

        if (cards.length > 0) {
            setupCards();
        }

        function handleDragStart(e) {
            if (cards.length === 0) return;
            const topCard = cards[0];
            if (!topCard.contains(e.target)) return;
            
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            topCard.style.transition = 'none';
        }

        function handleDragMove(e) {
            if (!isDragging || cards.length === 0) return;
            
            if (e.cancelable) {
                e.preventDefault(); 
            }
            
            currentX = (e.type.includes('mouse') ? e.clientX : e.touches[0].clientX) - startX;
            currentY = (e.type.includes('mouse') ? e.clientY : e.touches[0].clientY) - startY;
            
            const topCard = cards[0];
            const rotation = parseFloat(topCard.dataset.startRot) + (currentX / 15);
            topCard.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotateZ(${rotation}deg) rotateY(${currentX / 15}deg) rotateX(${-currentY / 15}deg)`;
        }

        function handleDragEnd(e) {
            if (!isDragging || cards.length === 0) return;
            isDragging = false;
            
            const topCard = cards[0];
            const threshold = window.innerWidth * 0.25; 
            
            if (Math.abs(currentX) > Math.max(threshold, 80)) { 
                const direction = currentX > 0 ? 1 : -1;
                topCard.classList.add('swiped');
                topCard.style.transform = `translate3d(${direction * window.innerWidth * 1.5}px, ${currentY + (currentY > 0 ? 100 : -100)}px, 0) rotateZ(${direction * 45}deg) rotateY(${direction * 90}deg)`;
                
                setTimeout(() => {
                    topCard.remove();
                    cards.shift();
                    setupCards();
                    if (cards.length === 0) {
                        deck.innerHTML = '<div style="padding-top: 150px; color: var(--c-terra); font-family: var(--f-script); font-size: 2rem;">No more photos!</div>';
                    }
                }, 300);
            } else { 
                topCard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                topCard.style.transform = `translate3d(0, 0, 0) rotateZ(${topCard.dataset.startRot}deg)`;
            }
            
            currentX = 0;
            currentY = 0;
        }

        deck.addEventListener('mousedown', handleDragStart);
        deck.addEventListener('touchstart', handleDragStart, {passive: false});

        window.addEventListener('mousemove', handleDragMove, {passive: false});
        window.addEventListener('touchmove', handleDragMove, {passive: false});

        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    }

});
