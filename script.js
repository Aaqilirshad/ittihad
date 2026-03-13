/* ============================================================
   AL-ITTIHAD — Countdown Timer + Particle Animations
   ============================================================ */

/* ---- Countdown Timer ---- */
(function initCountdown() {
    // Target: March 15, 2026, 17:00:00 local time
    const TARGET = new Date('2026-03-14T17:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const countdownWrapper = document.getElementById('countdown');
    const eventStartedEl = document.getElementById('eventStarted');

    function pad(n) {
        return String(Math.max(0, Math.floor(n))).padStart(2, '0');
    }

    function setWithFlip(el, newVal) {
        if (el.textContent !== newVal) {
            el.textContent = newVal;
            el.classList.remove('flip');
            // Force reflow
            void el.offsetWidth;
            el.classList.add('flip');
        }
    }

    function tick() {
        const now = Date.now();
        const diff = TARGET - now;

        if (diff <= 0) {
            // Event has started
            countdownWrapper.style.display = 'none';
            eventStartedEl.style.display = 'block';
            return;
        }

        const totalSeconds = diff / 1000;
        const d = Math.floor(totalSeconds / 86400);
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);

        setWithFlip(daysEl, pad(d));
        setWithFlip(hoursEl, pad(h));
        setWithFlip(minutesEl, pad(m));
        setWithFlip(secondsEl, pad(s));
    }

    tick();
    setInterval(tick, 1000);
})();

/* ---- Particle System ---- */
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    window.addEventListener('resize', () => {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    });

    // Gold-toned particle colors
    const COLORS = [
        'rgba(201,168,76,ALPHA)',
        'rgba(240,208,128,ALPHA)',
        'rgba(250,235,180,ALPHA)',
        'rgba(160,120,48,ALPHA)',
        'rgba(255,220,100,ALPHA)',
    ];

    const NUM_PARTICLES = 55;
    const particles = [];

    function randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }

    function createParticle() {
        return {
            x: randomBetween(0, W),
            y: randomBetween(0, H),
            size: randomBetween(1, 3.5),
            speedX: randomBetween(-0.3, 0.3),
            speedY: randomBetween(-0.6, -0.15),
            alpha: randomBetween(0.1, 0.55),
            alphaSpeed: randomBetween(0.002, 0.006),
            alphaDir: 1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            // Crescent / star shapes: 0 = circle, 1 = star dot
            shape: Math.random() > 0.7 ? 'star' : 'circle',
        };
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = createParticle();
        // Spread them across the full page height initially
        p.y = randomBetween(0, H);
        particles.push(p);
    }

    function drawStar(ctx, x, y, r) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);

        for (const p of particles) {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;

            // Fade in-out
            p.alpha += p.alphaSpeed * p.alphaDir;
            if (p.alpha >= 0.55) p.alphaDir = -1;
            if (p.alpha <= 0.05) p.alphaDir = 1;

            // Wrap around
            if (p.y < -10) p.y = H + 10;
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;

            const color = p.color.replace('ALPHA', p.alpha.toFixed(3));
            ctx.fillStyle = color;

            if (p.shape === 'star') {
                drawStar(ctx, p.x, p.y, p.size * 1.2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
})();

/* ---- Intersection Observer for scroll animations ---- */
(function initScrollReveal() {
    const els = document.querySelectorAll('.animate-fade-up');

    if (!('IntersectionObserver' in window)) {
        // Fallback: show all immediately
        els.forEach(el => { el.style.opacity = '1'; });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation already set via CSS; ensure opacity is applied
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    els.forEach(el => {
        // Pause animation initially, play when visible
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
})();
