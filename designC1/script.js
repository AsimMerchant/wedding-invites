document.addEventListener('DOMContentLoaded', () => {
    
    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Hover effects for cursor
    const interactiveElements = document.querySelectorAll('a, button, .h-card, .audio-toggle, .story-avatar, .story-tap-left, .story-tap-right, .story-close');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%, -50%) scale(3)');
        el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');
    });

    // Audio Logic
    const audioBtn = document.getElementById('audio-btn');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;
    
    if (audioBtn && bgMusic) {
        audioBtn.addEventListener('click', () => {
            const stateText = audioBtn.querySelector('.audio-state');
            if (isPlaying) {
                bgMusic.pause();
                stateText.innerText = 'Off';
            } else {
                bgMusic.play();
                stateText.innerText = 'On';
            }
            isPlaying = !isPlaying;
        });
    }

    // Loader logic
    const loader = document.getElementById('loader');
    const progress = document.querySelector('.loader-progress');
    
    let w = 0;
    const interval = setInterval(() => {
        w += Math.random() * 15;
        if(w >= 100) {
            w = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('fade-out');
                document.body.classList.remove('loading');
                document.body.classList.add('is-loaded');
                setTimeout(() => loader.remove(), 1500);
            }, 800);
        }
        progress.style.width = w + '%';
    }, 100);

    // Scroll Reveals
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-scale, .footer');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    // Horizontal scroll logic removed to use native CSS horizontal scroll instead for smoother laptop experience.

    // Magazine Story Experience Logic
    const storyAvatars = document.querySelectorAll('.story-avatar');
    const storyOverlay = document.getElementById('story-overlay');
    const storyClose = document.getElementById('story-close');
    const storyImgDisplay = document.getElementById('story-img-display');
    const storyTapLeft = document.getElementById('story-tap-left');
    const storyTapRight = document.getElementById('story-tap-right');
    const storyProgressContainer = document.getElementById('story-progress-container');
    const storyTitleDisplay = document.getElementById('story-title-display');

    const storiesData = [
        {
            title: "Engagement",
            images: ["linear-gradient(45deg, #8b3a2b, #444)", "linear-gradient(45deg, #6a2a1f, #333)"]
        },
        {
            title: "Pre-Wed",
            images: ["linear-gradient(45deg, #dcdccb, #aaa)", "linear-gradient(45deg, #c0c0b0, #888)", "linear-gradient(45deg, #a0a090, #666)"]
        },
        {
            title: "Us",
            images: ["linear-gradient(45deg, #a8a89b, #555)", "linear-gradient(45deg, #8a8a7c, #333)"]
        }
    ];

    let currentStoryIdx = 0;
    let currentImgIdx = 0;
    let storyTimer;
    const STORY_DURATION = 4000;

    function openStory(idx) {
        currentStoryIdx = idx;
        currentImgIdx = 0;
        storyOverlay.classList.remove('hidden');
        renderStory();
        
        // Mark as viewed
        storyAvatars[idx].querySelector('.story-ring').classList.add('viewed');
    }

    function closeStory() {
        storyOverlay.classList.add('hidden');
        clearTimeout(storyTimer);
    }

    function renderStory() {
        clearTimeout(storyTimer);
        const story = storiesData[currentStoryIdx];
        storyTitleDisplay.innerText = story.title;
        storyImgDisplay.style.backgroundImage = story.images[currentImgIdx];

        // Create progress bars
        storyProgressContainer.innerHTML = '';
        story.images.forEach((_, i) => {
            const bar = document.createElement('div');
            bar.className = 'story-progress-bar';
            const fill = document.createElement('div');
            fill.className = 'story-progress-fill';
            
            if (i < currentImgIdx) {
                fill.style.width = '100%';
                fill.style.transition = 'none';
            } else {
                fill.style.width = '0%';
                fill.style.transition = 'none';
            }
            
            bar.appendChild(fill);
            storyProgressContainer.appendChild(bar);
        });

        // Start progress for current image
        setTimeout(() => {
            const currentFill = storyProgressContainer.children[currentImgIdx].querySelector('.story-progress-fill');
            currentFill.style.transition = `width ${STORY_DURATION}ms linear`;
            currentFill.style.width = '100%';
            
            storyTimer = setTimeout(() => {
                nextImage();
            }, STORY_DURATION);
        }, 50);
    }

    function nextImage() {
        if (currentImgIdx < storiesData[currentStoryIdx].images.length - 1) {
            currentImgIdx++;
            renderStory();
        } else {
            if (currentStoryIdx < storiesData.length - 1) {
                currentStoryIdx++;
                currentImgIdx = 0;
                
                // Mark next story as viewed
                storyAvatars[currentStoryIdx].querySelector('.story-ring').classList.add('viewed');
                renderStory();
            } else {
                closeStory();
            }
        }
    }

    function prevImage() {
        if (currentImgIdx > 0) {
            currentImgIdx--;
            renderStory();
        } else {
            if (currentStoryIdx > 0) {
                currentStoryIdx--;
                currentImgIdx = storiesData[currentStoryIdx].images.length - 1;
                renderStory();
            } else {
                renderStory(); // Restart current image if at very beginning
            }
        }
    }

    storyAvatars.forEach(avatar => {
        avatar.addEventListener('click', () => {
            const idx = parseInt(avatar.getAttribute('data-story'));
            openStory(idx);
        });
    });

    storyClose.addEventListener('click', closeStory);
    storyTapRight.addEventListener('click', nextImage);
    storyTapLeft.addEventListener('click', prevImage);

});
