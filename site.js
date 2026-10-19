// WhatsApp number that receives call requests (country code, no + or spaces)
const WHATSAPP_NUMBER = '94768088170';

document.documentElement.classList.remove('no-js');
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------- Floating hextech dust + spark bursts ----------
const dust = (function () {
    const canvas = document.getElementById('dust');
    const api = { burst() {} };
    if (!canvas || reduceMotion) return api;
    const ctx = canvas.getContext('2d');
    const colors = ['106,240,255', '255,138,212', '243,203,122', '198,181,255'];
    let w, h, ambient = [], sparks = [];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth; h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(70, (w * h) / 22000));
        ambient = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: 0.6 + Math.random() * 1.8,
            vy: 0.08 + Math.random() * 0.3,
            vx: (Math.random() - 0.5) * 0.15,
            c: colors[(Math.random() * colors.length) | 0],
            p: Math.random() * Math.PI * 2,
        }));
    }
    resize();
    window.addEventListener('resize', resize);

    api.trail = (x, y) => {
        sparks.push({ x, y, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2 - 0.4, r: 0.8 + Math.random() * 1.6, life: 0.7, c: colors[(Math.random() * colors.length) | 0] });
    };
    api.burst = (x, y, n = 46) => {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 1.5 + Math.random() * 5.5;
            sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1 + Math.random() * 2.4, life: 1, c: colors[(Math.random() * colors.length) | 0] });
        }
    };

    (function frame() {
        ctx.clearRect(0, 0, w, h);
        ctx.shadowBlur = 8;
        for (const q of ambient) {
            q.y -= q.vy; q.x += q.vx; q.p += 0.02;
            if (q.y < -10) { q.y = h + 10; q.x = Math.random() * w; }
            const a = 0.25 + Math.sin(q.p) * 0.2;
            ctx.beginPath();
            ctx.fillStyle = `rgba(${q.c},${a})`;
            ctx.shadowColor = `rgba(${q.c},.9)`;
            ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 14;
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy = s.vy * 0.96 + 0.05; s.life -= 0.016;
            if (s.life <= 0) { sparks.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.fillStyle = `rgba(${s.c},${s.life})`;
            ctx.shadowColor = `rgba(${s.c},1)`;
            ctx.arc(s.x, s.y, s.r * (0.5 + s.life * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(frame);
    })();
    return api;
})();

// ---------- Hextech orb: drag to spin, click for sparks, follows the cursor ----------
const orbApi = (function orb() {
    const svg = document.getElementById('orb');
    if (!svg) return { look() {} };
    const wrap = svg.closest('.orb-wrap');
    const hint = wrap.querySelector('.orb-hint');
    const R = 190;
    const el = (tag, attrs, parent) => {
        const n = document.createElementNS(SVG_NS, tag);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(n);
        return n;
    };

    svg.innerHTML = `
        <defs>
            <radialGradient id="orbBody" cx="38%" cy="30%" r="75%">
                <stop offset="0" stop-color="#3B2F63"/>
                <stop offset=".45" stop-color="#1A1430"/>
                <stop offset="1" stop-color="#07060B"/>
            </radialGradient>
            <radialGradient id="orbRim" cx="50%" cy="50%" r="50%">
                <stop offset=".86" stop-color="#000" stop-opacity="0"/>
                <stop offset=".97" stop-color="#A9F5FF" stop-opacity=".35"/>
                <stop offset="1" stop-color="#FFB3E3" stop-opacity=".7"/>
            </radialGradient>
            <radialGradient id="wPink"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FFF6FB"/><stop offset=".82" stop-color="#FFC2E6"/><stop offset="1" stop-color="#D94D96"/></radialGradient>
            <radialGradient id="wCyan"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F3FEFF"/><stop offset=".82" stop-color="#A8F3FF"/><stop offset="1" stop-color="#2AA8C9"/></radialGradient>
            <radialGradient id="wGold"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FFFCF2"/><stop offset=".82" stop-color="#FFE3A8"/><stop offset="1" stop-color="#D0913C"/></radialGradient>
            <radialGradient id="wViolet"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F7F4FF"/><stop offset=".82" stop-color="#D6CBFF"/><stop offset="1" stop-color="#7A5CE6"/></radialGradient>
            <pattern id="net" width="9" height="9" patternUnits="userSpaceOnUse">
                <circle cx="4.5" cy="4.5" r="2.4" fill="none" stroke="#8C9BEA" stroke-width="1.1"/>
            </pattern>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <clipPath id="sphereClip"><circle r="${R}"/></clipPath>
        </defs>`;

    // Spiky lattice behind the sphere
    const spikes = [];
    for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        const len = i % 2 === 0 ? R * (1.12 + Math.random() * 0.33) : R * 0.96;
        spikes.push(`${(Math.cos(a) * len).toFixed(1)},${(Math.sin(a) * len).toFixed(1)}`);
    }
    const lattice = el('polygon', { points: spikes.join(' '), fill: 'url(#net)', opacity: '.5' }, svg);

    el('circle', { r: R, fill: 'url(#orbBody)' }, svg);
    const windows = el('g', { 'clip-path': 'url(#sphereClip)', filter: 'url(#glow)' }, svg);
    el('circle', { r: R, fill: 'url(#orbRim)' }, svg);
    el('ellipse', { cx: -70, cy: -110, rx: 70, ry: 26, fill: '#fff', opacity: '.07', transform: 'rotate(-30 -70 -110)' }, svg);

    // Windows spread evenly over the sphere (Fibonacci lattice), varied in size and tint
    const COUNT = 110;
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    const tints = ['url(#wPink)', 'url(#wCyan)', 'url(#wGold)', 'url(#wViolet)', 'url(#wPink)', 'url(#wGold)'];
    for (let i = 0; i < COUNT; i++) {
        const y = 1 - (i / (COUNT - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const t = golden * i + (Math.random() - 0.5) * 0.5;
        pts.push({
            x: Math.cos(t) * r, y, z: Math.sin(t) * r,
            size: 0.04 + Math.pow(Math.random(), 1.8) * 0.13,
            stretch: 0.7 + Math.random() * 0.7,
            outer: el('ellipse', { fill: tints[i % tints.length], stroke: '#0B0812', 'stroke-width': 2.5 }, windows),
            inner: el('ellipse', { fill: '#FFFFFF' }, windows),
        });
    }

    const BASE_TILT = -0.35;
    const BASE_VEL = reduceMotion ? 0 : 0.18;
    const s = { angle: 0.6, tilt: BASE_TILT, vel: BASE_VEL, flare: 0, spin: 0, hover: null, dragging: false, yaw: 0, pitch: 0, lookX: 0, lookY: 0 };

    function draw() {
        const ca = Math.cos(s.angle + s.yaw), sa = Math.sin(s.angle + s.yaw);
        const cosT = Math.cos(s.tilt + s.pitch), sinT = Math.sin(s.tilt + s.pitch);
        for (const p of pts) {
            const x1 = p.x * ca + p.z * sa;
            const z1 = -p.x * sa + p.z * ca;
            const y2 = p.y * cosT - z1 * sinT;
            const z2 = p.y * sinT + z1 * cosT;
            if (z2 < 0.08) {
                p.outer.setAttribute('opacity', 0);
                p.inner.setAttribute('opacity', 0);
                continue;
            }
            const sx = x1 * R, sy = y2 * R;
            let boost = s.flare;
            if (s.hover) {
                const d = Math.hypot(sx - s.hover.x, sy - s.hover.y);
                boost = Math.max(boost, 1 - d / 95);
            }
            boost = clamp(boost, 0, 1);
            const base = p.size * R * (1 + boost * 0.3);
            const rot = (Math.atan2(sy, sx) * 180) / Math.PI;
            const tr = `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${rot.toFixed(1)})`;
            const op = Math.min(1, (z2 - 0.08) * 3);
            p.outer.setAttribute('transform', tr);
            p.outer.setAttribute('rx', (base * z2).toFixed(1));
            p.outer.setAttribute('ry', (base * p.stretch).toFixed(1));
            p.outer.setAttribute('opacity', op.toFixed(2));
            p.inner.setAttribute('transform', tr);
            p.inner.setAttribute('rx', (base * z2 * 0.3).toFixed(1));
            p.inner.setAttribute('ry', (base * p.stretch * 0.3).toFixed(1));
            p.inner.setAttribute('opacity', (op * (0.35 + boost * 0.6)).toFixed(2));
        }
        lattice.setAttribute('transform', `rotate(${(s.spin * 57.3).toFixed(2)})`);
    }

    const toSvg = (e) => {
        const r = svg.getBoundingClientRect();
        return { x: ((e.clientX - r.left) / r.width) * 600 - 300, y: ((e.clientY - r.top) / r.height) * 600 - 300 };
    };
    const insideSphere = (pt) => Math.hypot(pt.x, pt.y) < R * 1.25;

    let interacted = false;
    const markInteracted = () => {
        if (interacted) return;
        interacted = true;
        hint.classList.add('gone');
    };

    function spark(clientX, clientY) {
        dust.burst(clientX, clientY);
        s.flare = 1;
        s.vel += 2.5;
        wrap.classList.remove('pulse');
        void wrap.offsetWidth;
        wrap.classList.add('pulse');
    }

    let last = { x: 0, y: 0, t: 0 }, moved = 0;
    svg.addEventListener('pointerdown', (e) => {
        if (!insideSphere(toSvg(e))) return;
        s.dragging = true; moved = 0;
        last = { x: e.clientX, y: e.clientY, t: performance.now() };
        svg.setPointerCapture(e.pointerId);
        svg.classList.add('dragging');
        markInteracted();
    });
    svg.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') {
            const pt = toSvg(e);
            s.hover = insideSphere(pt) ? pt : null;
        }
        if (!s.dragging) return;
        const now = performance.now();
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        const dt = Math.max(0.008, (now - last.t) / 1000);
        s.angle += dx * 0.012;
        s.tilt = clamp(s.tilt - dy * 0.008, -1.2, 0.6);
        s.vel = (dx * 0.012) / dt;
        moved += Math.abs(dx) + Math.abs(dy);
        last = { x: e.clientX, y: e.clientY, t: now };
    });
    const endDrag = (e, cancelled) => {
        if (!s.dragging) return;
        s.dragging = false;
        svg.classList.remove('dragging');
        if (!cancelled && moved < 6) spark(e.clientX, e.clientY);
    };
    svg.addEventListener('pointerup', (e) => endDrag(e, false));
    svg.addEventListener('pointercancel', (e) => endDrag(e, true));
    svg.addEventListener('pointerleave', () => { s.hover = null; });

    svg.addEventListener('keydown', (e) => {
        const keys = { ArrowLeft: -3, ArrowRight: 3 };
        if (e.key in keys) { s.vel += keys[e.key]; markInteracted(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { s.tilt = clamp(s.tilt + 0.15, -1.2, 0.6); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { s.tilt = clamp(s.tilt - 0.15, -1.2, 0.6); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') {
            const r = svg.getBoundingClientRect();
            spark(r.left + r.width / 2, r.top + r.height / 2);
            markInteracted();
            e.preventDefault();
        }
    });

    draw();
    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(svg);
    let prev = performance.now();
    (function loop(now) {
        const dt = Math.min(0.05, (now - prev) / 1000);
        prev = now;
        if (visible) {
            if (!s.dragging) {
                s.vel += (BASE_VEL - s.vel) * Math.min(1, dt * 1.2);
                s.angle += s.vel * dt;
                s.tilt += (BASE_TILT - s.tilt) * Math.min(1, dt * 0.6);
            }
            s.yaw += (s.lookX * 0.6 - s.yaw) * Math.min(1, dt * 3);
            s.pitch += (s.lookY * 0.35 - s.pitch) * Math.min(1, dt * 3);
            s.spin += dt * (0.05 + Math.abs(s.vel) * 0.04);
            s.flare = Math.max(s.flare - dt * 1.4, clamp((Math.abs(s.vel) - 2) / 8, 0, 1));
            draw();
        }
        requestAnimationFrame(loop);
    })(prev);

    return {
        look(x, y) { s.lookX = x; s.lookY = y; },
        spark,
    };
})();

// ---------- Hero: magnetic chrome letters, parallax, cursor trail, rotating word ----------
(function hero() {
    const heroEl = document.querySelector('.hero');
    const mark = document.getElementById('wordmark');
    if (!heroEl || !mark) return;

    // Split the wordmark into letters (screen readers still read "Nico Labs")
    const text = mark.textContent;
    mark.setAttribute('aria-label', text);
    mark.innerHTML = [...text].map((ch) => (ch === ' '
        ? '<span class="gap" aria-hidden="true"> </span>'
        : `<span class="ch" aria-hidden="true">${ch}</span>`)).join('');
    const letters = [...mark.querySelectorAll('.ch')];
    letters.forEach((l, i) => l.style.setProperty('--i', i));

    // Letters lean toward the pointer and the chrome sheen follows it
    let raf = null, pointer = null;
    function updateLetters() {
        raf = null;
        letters.forEach((l) => {
            if (!pointer) { l.style.transform = ''; return; }
            const r = l.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const dx = pointer.x - cx, dy = pointer.y - cy;
            const d = Math.hypot(dx, dy);
            const f = Math.max(0, 1 - d / 260);
            l.style.transform = `translate(${(dx * f * 0.12).toFixed(1)}px, ${(dy * f * 0.18 - f * 14).toFixed(1)}px) rotate(${(dx * f * 0.03).toFixed(1)}deg)`;
            l.style.setProperty('--lit', f.toFixed(2));
        });
    }

    let lastTrail = 0;
    heroEl.addEventListener('pointermove', (e) => {
        const r = heroEl.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        heroEl.style.setProperty('--px', nx.toFixed(3));
        heroEl.style.setProperty('--py', ny.toFixed(3));
        mark.style.setProperty('--sx', `${(nx + 0.5) * 100}%`);
        orbApi.look(nx, ny);
        if (e.pointerType !== 'mouse' || reduceMotion) return;
        pointer = { x: e.clientX, y: e.clientY };
        if (!raf) raf = requestAnimationFrame(updateLetters);
        const now = performance.now();
        if (now - lastTrail > 16) { dust.trail(e.clientX, e.clientY); lastTrail = now; }
    });
    heroEl.addEventListener('pointerleave', () => {
        pointer = null;
        orbApi.look(0, 0);
        if (!raf) raf = requestAnimationFrame(updateLetters);
    });

    // Click or tap a letter: it flips and throws sparks
    letters.forEach((l) => {
        l.addEventListener('click', (e) => {
            l.classList.remove('flip'); void l.offsetWidth; l.classList.add('flip');
            dust.burst(e.clientX, e.clientY, 24);
        });
    });

    // Rotating last word with a hextech "decode" scramble
    const swap = document.getElementById('swapWord');
    const words = ['business', 'bookings', 'café', 'villas', 'store', 'events'];
    const glyphs = 'ABCDEFGHJKLMNOPQRSTUVWXYZ#$%&*<>/\\';
    let wi = 0;
    function scrambleTo(word) {
        if (reduceMotion) { swap.textContent = word; return; }
        const from = swap.textContent;
        const len = Math.max(from.length, word.length);
        let frame = 0;
        const total = 22;
        (function step() {
            let out = '';
            for (let i = 0; i < len; i++) {
                const reveal = (frame / total) * len;
                if (i < reveal - 2) out += word[i] || '';
                else if (i < reveal + 1) out += glyphs[(Math.random() * glyphs.length) | 0].toLowerCase();
                else out += from[i] || '';
            }
            swap.textContent = out;
            if (frame++ < total) requestAnimationFrame(step);
            else swap.textContent = word;
        })();
    }
    setInterval(() => {
        if (document.hidden) return;
        wi = (wi + 1) % words.length;
        scrambleTo(words[wi]);
    }, 2600);
})();

// ---------- Statement: words light up as you scroll ----------
(function statement() {
    const p = document.getElementById('statement');
    if (!p) return;
    const words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const spans = p.querySelectorAll('.w');
    if (reduceMotion) { spans.forEach((sp) => sp.classList.add('lit')); return; }
    function update() {
        const rect = p.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = clamp((vh * 0.95 - rect.top) / (rect.height * 0.8 + vh * 0.25), 0, 1);
        const litCount = Math.round(progress * spans.length);
        spans.forEach((sp, i) => sp.classList.toggle('lit', i < litCount));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
})();

// ---------- Scroll progress, nav state, active section ----------
(function navState() {
    const nav = document.querySelector('.nav');
    const bar = document.getElementById('progressBar');
    function onScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        nav.classList.toggle('scrolled', window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const links = [...document.querySelectorAll('.nav-links a')];
    const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            links.forEach((a) => {
                const on = a.getAttribute('href') === `#${en.target.id}`;
                a.classList.toggle('active', on);
                if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((sec) => io.observe(sec));
})();

// ---------- Mobile menu ----------
(function mobileMenu() {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    const setOpen = (open) => {
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.hidden = !open;
        document.body.classList.toggle('menu-open', open);
        if (open) menu.querySelector('a').focus();
    };
    btn.addEventListener('click', () => setOpen(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
})();

// ---------- Reveal on scroll + count-up numbers ----------
function countUp(el) {
    const target = Number(el.dataset.count);
    if (reduceMotion || !target) return;
    const start = performance.now();
    const dur = 1400;
    (function tick(now) {
        const t = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${Math.round(target * eased)}+`;
        if (t < 1) requestAnimationFrame(tick);
    })(start);
}
document.querySelectorAll('.metrics b').forEach((b) => {
    const n = parseInt(b.textContent, 10);
    if (n) b.dataset.count = n;
});
const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        if (entry.target.matches('[data-count]')) countUp(entry.target);
        io.unobserve(entry.target);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .hero-stats [data-count]').forEach((el) => io.observe(el));

// ---------- Booking demo ----------
(function demo() {
    const tabsEl = document.getElementById('dayTabs');
    if (!tabsEl) return;
    const table = document.getElementById('slotTable');
    const summary = document.getElementById('demoSummary');
    const bookBtn = document.getElementById('bookBtn');
    const chat = document.getElementById('chat');
    const chatBody = document.getElementById('chatBody');
    const chatAgain = document.getElementById('chatAgain');
    const beamDot = document.getElementById('beamDot');
    const owner = document.querySelector('.owner');
    const ownerLive = document.getElementById('ownerLive');
    const kpiBookings = document.getElementById('kpiBookings');
    const kpiRevenue = document.getElementById('kpiRevenue');
    const kpiBusy = document.getElementById('kpiBusy');
    const chart = document.getElementById('weekChart');
    const feed = document.getElementById('feed');

    const PRICE = 4000;
    const COURTS = ['Court 1', 'Court 2'];
    const TIMES = ['5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'];
    const NAMES = ['Kasun', 'Nimesh', 'Ayesha', 'Dilan', 'Sachini', 'Ravindu', 'Tharushi', 'Isuru', 'Malsha', 'Chamod'];
    const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
    const days = [
        { label: 'Today', week: todayIdx, booked: new Set(['0-0', '1-0', '1-1', '3-1', '4-0']) },
        { label: 'Tomorrow', week: (todayIdx + 1) % 7, booked: new Set(['1-1', '2-0', '4-1']) },
        { label: 'Saturday', week: 5, booked: new Set(['0-0', '0-1', '1-0', '2-1', '3-0', '3-1', '5-0']) },
    ];
    const weekCounts = [4, 6, 3, 7, 6, 9, 5];
    days.forEach((d) => { weekCounts[d.week] = Math.max(weekCounts[d.week], d.booked.size); });
    let totalBookings = weekCounts.reduce((a, b) => a + b, 0);
    const state = { day: 0, sel: null, busy: false };

    const fmt = (n) => `Rs. ${n.toLocaleString('en-US')}`;

    function renderTabs() {
        tabsEl.innerHTML = days.map((d, i) => `<button type="button" aria-pressed="${i === state.day}" data-day="${i}">${d.label}</button>`).join('');
    }
    function renderSlots() {
        const d = days[state.day];
        let html = '<span></span>' + COURTS.map((c) => `<span class="th">${c}</span>`).join('');
        TIMES.forEach((t, ti) => {
            html += `<span class="time">${t}</span>`;
            COURTS.forEach((c, ci) => {
                const key = `${ti}-${ci}`;
                const isBooked = d.booked.has(key);
                const isSel = state.sel === key;
                const justBooked = d.justBooked === key;
                const label = isBooked ? 'Booked' : isSel ? 'Selected' : 'Free';
                html += `<button type="button" class="slot${justBooked ? ' just-booked' : ''}" data-key="${key}" ${isBooked ? 'disabled' : `aria-pressed="${isSel}"`} aria-label="${c}, ${t}, ${label}">${justBooked ? 'Yours ✓' : label}</button>`;
            });
        });
        table.innerHTML = html;
    }
    function renderSummary() {
        if (!state.sel) {
            summary.textContent = 'Pick a free time to book.';
            bookBtn.disabled = true;
            return;
        }
        const [ti, ci] = state.sel.split('-').map(Number);
        summary.innerHTML = `<b>${COURTS[ci]} · ${TIMES[ti]} · ${days[state.day].label}</b> — ${fmt(PRICE)}`;
        bookBtn.disabled = false;
    }
    function renderChart() {
        const max = Math.max(...weekCounts, 8);
        chart.innerHTML = weekCounts.map((n, i) => `<div class="bar${i === todayIdx ? ' today' : ''}"><i style="height:${(n / max) * 100}%"></i><span>${WEEK[i]}</span></div>`).join('');
    }
    function renderKpis(animate) {
        const allSlots = days.length * TIMES.length * COURTS.length;
        const bookedSlots = days.reduce((a, d) => a + d.booked.size, 0);
        kpiBookings.textContent = totalBookings;
        kpiRevenue.textContent = fmt(totalBookings * PRICE);
        kpiBusy.textContent = `${Math.round((bookedSlots / allSlots) * 100)}%`;
        if (animate && !reduceMotion) [kpiBookings, kpiRevenue, kpiBusy].forEach((k) => { k.classList.remove('bump'); void k.offsetWidth; k.classList.add('bump'); });
    }
    function addFeed(name, court, time, day, isNew) {
        const li = document.createElement('li');
        if (isNew) li.className = 'new';
        li.innerHTML = `<span class="av" aria-hidden="true">${name.slice(0, 2)}</span><div><b>${name}</b><small>${court} · ${time} · ${day}</small></div><span class="amt">+${fmt(PRICE)}</span>`;
        feed.prepend(li);
        while (feed.children.length > 4) feed.lastElementChild.remove();
    }

    tabsEl.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        state.day = Number(b.dataset.day);
        state.sel = null;
        renderTabs(); renderSlots(); renderSummary();
    });
    table.addEventListener('click', (e) => {
        const b = e.target.closest('.slot');
        if (!b || b.disabled) return;
        state.sel = state.sel === b.dataset.key ? null : b.dataset.key;
        renderSlots(); renderSummary();
        const again = table.querySelector(`[data-key="${b.dataset.key}"]`);
        if (again) again.focus();
    });

    const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 150) : ms));
    const bubble = (cls, html) => {
        const div = document.createElement('div');
        div.className = `bubble ${cls}`;
        div.innerHTML = html;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    };
    const clock = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    bookBtn.addEventListener('click', async () => {
        if (!state.sel || state.busy) return;
        state.busy = true;
        const d = days[state.day];
        const key = state.sel;
        const [ti, ci] = key.split('-').map(Number);
        const name = NAMES[(Math.random() * NAMES.length) | 0];
        const court = COURTS[ci], time = TIMES[ti];

        chatBody.innerHTML = '';
        chat.hidden = false;
        chatAgain.hidden = true;
        await wait(450);
        bubble('me', `Hi! I'd like to book ${court} at ${time}, ${d.label.toLowerCase()}. — ${name}<small>${clock()} ✓✓</small>`);

        // The message reaches the owner's dashboard
        beamDot.classList.remove('go'); void beamDot.offsetWidth; beamDot.classList.add('go');
        await wait(800);
        d.booked.add(key);
        d.justBooked = key;
        weekCounts[d.week] += 1;
        totalBookings += 1;
        state.sel = null;
        renderSlots(); renderSummary(); renderChart(); renderKpis(true);
        addFeed(name, court, time, d.label, true);
        owner.classList.add('flash');
        setTimeout(() => owner.classList.remove('flash'), 900);
        ownerLive.textContent = `New booking on the dashboard: ${court}, ${time}, ${d.label}.`;

        const typing = bubble('them typing', '<i></i><i></i><i></i>');
        await wait(1100);
        typing.remove();
        bubble('them', `Confirmed ✓ ${court}, ${time} ${d.label.toLowerCase()}. See you on the court, ${name}! ⚽<small>${clock()}</small>`);
        await wait(300);
        chatAgain.hidden = false;
        chatAgain.focus();
        state.busy = false;
    });

    chatAgain.addEventListener('click', () => {
        chat.hidden = true;
        days.forEach((d) => { d.justBooked = null; });
        renderSlots();
        const first = table.querySelector('.slot:not([disabled])');
        if (first) first.focus(); else bookBtn.focus();
    });

    renderTabs(); renderSlots(); renderSummary(); renderChart(); renderKpis(false);
    addFeed('Nimal', 'Court 1', '6 PM', 'Today', false);
    addFeed('Shehani', 'Court 2', '9 PM', 'Tomorrow', false);
    addFeed('Ruwan', 'Court 1', '5 PM', 'Saturday', false);
})();

// ---------- Work filters ----------
(function filters() {
    const buttons = document.querySelectorAll('.filter');
    const cases = document.querySelectorAll('.case');
    const status = document.getElementById('filterStatus');
    buttons.forEach((btn) => btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        let shown = 0;
        cases.forEach((c) => {
            const show = f === 'all' || c.dataset.cat === f;
            c.classList.toggle('is-hidden', !show);
            c.classList.remove('is-entering');
            if (show) {
                shown++;
                c.classList.add('in');
                if (!reduceMotion) { void c.offsetWidth; c.classList.add('is-entering'); }
            }
        });
        status.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}.`;
    }));
})();

// ---------- Cursor spotlight + mockup tilt (mouse only) ----------
if (finePointer) {
    document.querySelectorAll('.case, .service').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });
    if (!reduceMotion) {
        document.querySelectorAll('.case-visual').forEach((v) => {
            const mock = v.querySelector('.mock');
            if (!mock) return;
            v.addEventListener('pointermove', (e) => {
                const r = v.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                mock.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 12}deg) translateZ(20px)`;
            });
            v.addEventListener('pointerleave', () => { mock.style.transform = ''; });
        });
    }
}

// ---------- "Ask about this" links pre-select the need in the form ----------
document.querySelectorAll('[data-need]').forEach((link) => {
    link.addEventListener('click', () => {
        const box = document.querySelector(`#callForm input[name="need"][value="${link.dataset.need}"]`);
        if (!box) return;
        box.checked = true;
        const chip = box.nextElementSibling;
        chip.classList.remove('flash'); void chip.offsetWidth; chip.classList.add('flash');
        setTimeout(() => document.getElementById('f-name').focus({ preventScroll: true }), 700);
    });
});

// Hide the floating "Book a call" button while the contact section is on screen
const fab = document.querySelector('.fab');
const contact = document.getElementById('contact');
if (fab && contact) {
    new IntersectionObserver(([entry]) => {
        fab.classList.toggle('hidden', entry.isIntersecting);
    }, { threshold: 0.15 }).observe(contact);
}

// ---------- Call request form: builds a WhatsApp message ----------
const form = document.getElementById('callForm');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const phone = (data.get('phone') || '').trim();
    const business = (data.get('business') || '').trim();
    const needs = data.getAll('need');
    const time = data.get('time');
    const message = (data.get('message') || '').trim();

    const nameInput = form.elements.name;
    const phoneInput = form.elements.phone;
    const phoneOk = phone.replace(/\D/g, '').length >= 9;
    nameInput.classList.toggle('invalid', !name);
    phoneInput.classList.toggle('invalid', !phoneOk);
    nameInput.setAttribute('aria-invalid', String(!name));
    phoneInput.setAttribute('aria-invalid', String(!phoneOk));

    if (!name || !phoneOk) {
        errorEl.textContent = !name ? 'Please add your name.' : 'Please add a phone number we can call.';
        (!name ? nameInput : phoneInput).focus();
        return;
    }
    errorEl.textContent = '';

    const lines = [
        'Hi Nico Labs! I’d like to book a call.',
        '',
        `Name: ${name}`,
        `Phone: ${phone}`,
    ];
    if (business) lines.push(`Business: ${business}`);
    if (needs.length) lines.push(`Looking for: ${needs.join(', ')}`);
    lines.push(`Best time to call: ${time}`);
    if (message) lines.push('', message);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
});
