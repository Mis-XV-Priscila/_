let ytPlayer;
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: '63pTpAAF0HM',
        playerVars: {
            'autoplay': 0,
            'loop': 1,
            'controls': 0,
            'playsinline': 1,
            'playlist': '63pTpAAF0HM'
        },
        events: {
            'onReady': function(event) {
                window.ytPlayerReady = true;
            },
            'onError': function(event) {
                console.error("Error cargando el audio de YouTube:", event.data);
            }
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const envelope = document.getElementById('envelope');
    const mainContent = document.getElementById('main-content');
    
    let audioStarted = false;

    const startInvitation = () => {
        if(audioStarted) return;
        audioStarted = true;
        
        envelope.classList.add('open');
        
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
            try {
                ytPlayer.setVolume(70);
                ytPlayer.playVideo();
                ytPlayer.unMute(); 
            } catch(e) {
                console.log("Error intentando reproducir YouTube:", e);
            }
        }

        setTimeout(() => {
            envelopeWrapper.style.opacity = '0';
            setTimeout(() => {
                envelopeWrapper.style.display = 'none';
                mainContent.style.display = 'block';
                void mainContent.offsetWidth;
                mainContent.classList.add('visible');
                setupIntersectionObserver();
            }, 1000); 
        }, 1300);
    };

    envelope.addEventListener('click', startInvitation);
    envelope.addEventListener('touchstart', startInvitation, { passive: true });

    function setupIntersectionObserver() {
        const elementsToFadeIn = document.querySelectorAll('.fade-in-element');
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };
        const appearOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        elementsToFadeIn.forEach(el => appearOnScroll.observe(el));
    }

    const eventDateStr = "2026-07-11T20:00:00"; 
    const eventDate = new Date(eventDateStr).getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {
            const timerContainer = document.getElementById("timer");
            if(timerContainer) {
                timerContainer.innerHTML = "<h3 style=\'font-family: \"Playfair Display\", serif; font-size: 2rem; color: var(--primary-dark);'>¡El gran día ha llegado!</h3>";
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("mins").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("secs").innerText = seconds.toString().padStart(2, '0');
    };

    setInterval(updateCountdown, 1000);
    updateCountdown(); 

    const canvas = document.getElementById('sparkles');
    const ctx = canvas.getContext('2d');
    let particles = [];

    let mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('mousemove', function(event) { mouse.x = event.x; mouse.y = event.y; });
    window.addEventListener('mouseout', function() { mouse.x = undefined; mouse.y = undefined; });
    window.addEventListener('touchmove', function(event) { mouse.x = event.touches[0].clientX; mouse.y = event.touches[0].clientY; });

    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.opacity = Math.random() * 0.6 + 0.2;
            const isGold = Math.random() > 0.5;
            this.color = isGold ? `rgba(255, 215, 0, ${this.opacity})` : `rgba(255, 255, 255, ${this.opacity})`;
            this.baseX = this.x;
            this.baseY = this.y;
        }
        update() {
            this.x += this.speedX;
            this.y -= Math.abs(this.speedY) + 0.2;
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * 5;
                    const directionY = forceDirectionY * force * 5;
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
        }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); }
    }

    function initParticles() { particles = []; const particleCount = window.innerWidth < 768 ? 40 : 100; for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); } }
    function connectParticles() { for (let a = 0; a < particles.length; a++) { for (let b = a; b < particles.length; b++) { let dx = particles[a].x - particles[b].x; let dy = particles[a].y - particles[b].y; let distance = dx * dx + dy * dy; if (distance < 12000) { let opacityValue = 1 - (distance / 12000); ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.4})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke(); } } } }
    function animateParticles() { ctx.clearRect(0, 0, canvas.width, canvas.height); for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); } connectParticles(); requestAnimationFrame(animateParticles); }

    initParticles(); animateParticles();
    window.addEventListener('resize', () => { initParticles(); });
});
