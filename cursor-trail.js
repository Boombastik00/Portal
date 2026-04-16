/* cursor-trail.js — фиолетовый рассеивающийся след курсора */
(function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '99999',
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = [
        { h: 280, s: 100, l: 70 },
        { h: 260, s:  90, l: 65 },
        { h: 300, s:  80, l: 60 },
        { h: 270, s: 100, l: 75 },
        { h: 290, s:  85, l: 55 },
    ];

    const particles = [];
    const mouse = { x: -999, y: -999 };
    let lastX = -999, lastY = -999;

    window.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    function spawn(x, y) {
        const dist = Math.hypot(x - lastX, y - lastY);
        if (dist < 4) return;
        lastX = x; lastY = y;
        const count = Math.min(3, 1 + Math.floor(dist / 12));
        for (let i = 0; i < count; i++) {
            const c     = COLORS[Math.floor(Math.random() * COLORS.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.6;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.3,
                r:  Math.random() * 5 + 3,
                h: c.h, s: c.s, l: c.l,
                alpha:  Math.random() * 0.5 + 0.5,
                decay:  Math.random() * 0.018 + 0.012,
                shrink: Math.random() * 0.04  + 0.02,
            });
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        spawn(mouse.x, mouse.y);
        ctx.globalCompositeOperation = 'lighter';

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy    += 0.04;
            p.alpha -= p.decay;
            p.r     -= p.shrink;
            if (p.alpha <= 0 || p.r <= 0) { particles.splice(i, 1); continue; }

            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
            glow.addColorStop(0, `hsla(${p.h},${p.s}%,${p.l}%,${p.alpha * 0.4})`);
            glow.addColorStop(1, `hsla(${p.h},${p.s}%,${p.l}%,0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.h},${p.s}%,${p.l + 15}%,${p.alpha})`;
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    animate();
})();