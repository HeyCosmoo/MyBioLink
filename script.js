// toggle icon navbar
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    };
}

// scroll sections
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    // Section activation for navigation
    if (sections.length && navLinks.length) {
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 100;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');

            if (top >= offset && top < offset + height) {
                // active navbar links
                navLinks.forEach(links => {
                    links.classList.remove('active');
                    let targetLink = document.querySelector('header nav a[href*=' + id + ']');
                    if (targetLink) targetLink.classList.add('active');
                });
            }
        });
    }

    // sticky header
    let header = document.querySelector('header');
    if (header) {
        header.classList.toggle('sticky', window.scrollY > 100);
    }

    // remove toggle icon and navbar when click navbar links (scroll)
    if (menuIcon && navbar) {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    }

    // animation footer on scroll
    let footer = document.querySelector('.footer');
    if (footer) {
        let scrollPosition = window.scrollY + window.innerHeight;
        let documentHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= documentHeight - 100) {
            footer.style.opacity = '1';
            footer.style.transform = 'translateY(0)';
        } else {
            footer.style.opacity = '0';
            footer.style.transform = 'translateY(20px)';
        }
    }
};

// Smooth scrolling for navigation links
document.querySelectorAll('header nav a, .footer-iconTop a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize footer animation
let footer = document.querySelector('.footer');
if (footer) {
    footer.style.transition = 'all 0.5s ease';
}

// Background music functionality
const bgMusic = document.getElementById('background-music');
const playBtn = document.getElementById('play-button');
const muteBtn = document.getElementById('mute-button');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const autoplayNotification = document.getElementById('autoplay-notification');

let isPlaying = false;
let isMuted = false;

// Format time function (convert seconds to mm:ss)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update progress bar
function updateProgress() {
    if (bgMusic) {
        const { duration, currentTime } = bgMusic;
        if (duration) {
            // Update progress bar width
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            
            // Update time display
            currentTimeEl.textContent = formatTime(currentTime);
            durationEl.textContent = formatTime(duration);
        } else {
            currentTimeEl.textContent = '0:00';
            durationEl.textContent = '0:00';
        }
    }
}

// Set progress bar on click
function setProgress(e) {
    if (bgMusic && bgMusic.duration) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = bgMusic.duration;
        bgMusic.currentTime = (clickX / width) * duration;
    }
}

// Play/Pause functionality
function togglePlay() {
    if (bgMusic) {
        if (isPlaying) {
            bgMusic.pause();
            playBtn.querySelector('i').classList.remove('fa-pause');
            playBtn.querySelector('i').classList.add('fa-play');
        } else {
            bgMusic.play().catch(e => {
                console.log("Audio play failed: ", e);
            });
            playBtn.querySelector('i').classList.remove('fa-play');
            playBtn.querySelector('i').classList.add('fa-pause');
        }
        isPlaying = !isPlaying;
    }
}

// Mute/Unmute functionality
function toggleMute() {
    if (bgMusic) {
        if (isMuted) {
            // Unmute
            bgMusic.muted = false;
            muteBtn.querySelector('i').classList.remove('fa-volume-mute');
            muteBtn.querySelector('i').classList.add('fa-volume-up');
        } else {
            // Mute
            bgMusic.muted = true;
            muteBtn.querySelector('i').classList.remove('fa-volume-up');
            muteBtn.querySelector('i').classList.add('fa-volume-mute');
        }
        isMuted = !isMuted;
    }
}

// Set initial volume
if (bgMusic) {
    bgMusic.volume = 0.5;
}

// Add event listeners for music player
if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
}

if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
}

if (bgMusic) {
    bgMusic.addEventListener('timeupdate', updateProgress);
    bgMusic.addEventListener('ended', () => {
        if (playBtn) {
            playBtn.querySelector('i').classList.remove('fa-pause');
            playBtn.querySelector('i').classList.add('fa-play');
        }
        isPlaying = false;
    });
    bgMusic.addEventListener('loadedmetadata', updateProgress);
}

if (progressContainer) {
    progressContainer.addEventListener('click', setProgress);
}

// Add hover effects to links
const linkItems = document.querySelectorAll('.link-item');
if (linkItems.length) {
    linkItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        });
    });
}

// Auto-play music when page loads
window.addEventListener('load', function() {
    if (bgMusic) {
        // Try to play automatically
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Autoplay started successfully
                    isPlaying = true;
                    if (playBtn) {
                        playBtn.querySelector('i').classList.remove('fa-play');
                        playBtn.querySelector('i').classList.add('fa-pause');
                    }
                    
                    // Show notification for a few seconds
                    if (autoplayNotification) {
                        autoplayNotification.style.display = 'block';
                        setTimeout(() => {
                            autoplayNotification.style.display = 'none';
                        }, 3000);
                    }
                })
                .catch(error => {
                    // Autoplay was prevented
                    console.log("Autoplay prevented: ", error);
                    isPlaying = false;
                    if (playBtn) {
                        playBtn.querySelector('i').classList.remove('fa-pause');
                        playBtn.querySelector('i').classList.add('fa-play');
                    }
                    
                    // Show instruction to click to play
                    if (autoplayNotification) {
                        autoplayNotification.textContent = "Click anywhere to play music";
                        autoplayNotification.style.display = 'block';
                    }
                });
        }
    }
});

// Start music on user interaction if autoplay was blocked
function initBackgroundMusic() {
    if (bgMusic && !isPlaying) {
        bgMusic.play().catch(e => {
            console.log("Audio play failed: ", e);
        });
        if (playBtn) {
            playBtn.querySelector('i').classList.remove('fa-play');
            playBtn.querySelector('i').classList.add('fa-pause');
        }
        isPlaying = true;
        
        // Hide notification
        if (autoplayNotification) {
            autoplayNotification.style.display = 'none';
        }
    }
    // Remove this event listener after first interaction
    document.removeEventListener('click', initBackgroundMusic);
}

// Add click event listener to entire document to start music
document.addEventListener('click', initBackgroundMusic, { once: true });