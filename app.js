'use strict';

let slides = [];
let currentSlide = 0;
const activated = new Set();

// ── TYPE → CSS CLASS MAP ──────────────────────────────────────────────────────
function resolveClass(slide) {
  if (slide.type === 'content') {
    return (slide.headline || '').toLowerCase().includes('challenge')
      ? 'slide-challenge'
      : 'slide-partnership';
  }
  const map = {
    title:       'slide-title',
    section:     'slide-mission',
    beforeAfter: 'slide-services',
    closing:     'slide-closing',
  };
  return map[slide.type] || 'slide-partnership';
}

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  const res  = await fetch('content.json');
  const data = await res.json();
  slides = data.slides;
  renderDeck();
  setupNavbar();
  setupKeyboard();
  setupTouchSwipe();
  setupIntersectionObserver();
  setupNavbarOffset();
  setupCursorGlow();
  setupParticles();
  updateCounter();
}

// ── RENDER DECK ───────────────────────────────────────────────────────────────
function renderDeck() {
  const deck = document.getElementById('deck');
  deck.innerHTML = '';
  slides.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = 'slide ' + resolveClass(slide);
    el.id = 'slide-' + i;
    el.innerHTML = buildSlideHTML(slide, i);
    deck.appendChild(el);
  });
}

function buildSlideHTML(slide) {
  switch (slide.type) {
    case 'title':       return htmlTitle(slide);
    case 'section':     return htmlMission(slide);
    case 'content':     return (slide.headline||'').toLowerCase().includes('challenge')
                          ? htmlChallenge(slide) : htmlPartnership();
    case 'beforeAfter': return htmlServices(slide);
    case 'closing':     return htmlClosing();
    default:            return htmlPartnership();
  }
}

// ── SLIDE: TITLE ──────────────────────────────────────────────────────────────
function htmlTitle(s) {
  const tags = (s.bullets || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  return `
    <div class="orb orb-1"></div><div class="orb orb-2"></div>
    <div class="title-layout">
      <div class="title-left">
        <div class="eyebrow" data-animate data-delay="0">GSR &amp; Associates</div>
        <h1 data-animate data-delay="1">Growing Leaders,<br><em>Scaling Vision,</em><br>Together.</h1>
        <p class="title-sub" data-animate data-delay="2">${esc(s.subheadline || '')}</p>
        <div class="tag-cloud" data-animate data-delay="3">${tags}</div>
      </div>
      <div class="data-panel" data-animate data-delay="2">
        <div class="data-row"><span class="data-label">Focus</span><span class="data-value accent">Founder-First</span></div>
        <div class="data-row"><span class="data-label">Model</span><span class="data-value">Partnership</span></div>
        <div class="data-row"><span class="data-label">Approach</span><span class="data-value">Invest &amp; Advise</span></div>
        <div class="data-row"><span class="data-label">Timeline</span><span class="data-value accent">12-Month Journey</span></div>
        <div class="data-row"><span class="data-label">Markets</span><span class="data-value">Global</span></div>
        <button class="cta-btn" onclick="scrollToSlide(${slides.length - 1})">PARTNER WITH US</button>
      </div>
    </div>
    <div class="scroll-cue"><span>SCROLL</span><div class="scroll-chevron"></div></div>`;
}

// ── SLIDE: MISSION ────────────────────────────────────────────────────────────
function htmlMission(s) {
  const cards = [
    { icon: '🤝', title: 'True Partners',  desc: 'We invest in your vision, not just your metrics.' },
    { icon: '🌍', title: 'Global Reach',   desc: 'Connections across markets, industries and borders.' },
    { icon: '🚀', title: 'Scale Ready',    desc: 'Systems and strategies built for exponential growth.' },
    { icon: '💡', title: 'Ideas First',    desc: 'We champion innovation before it becomes obvious.' },
  ];
  const cardsHTML = cards.map((c, i) => `
    <div class="mission-card" data-animate data-delay="${i + 2}">
      <div class="mission-icon">${c.icon}</div>
      <div><h4>${c.title}</h4><p>${c.desc}</p></div>
    </div>`).join('');
  return `
    <div class="mission-layout">
      <div class="mission-left">
        <div class="eyebrow" data-animate data-delay="0">Our Mission</div>
        <h2 data-animate data-delay="1">We believe in <em>founders,</em><br>not just formulas.</h2>
        <p class="mission-body" data-animate data-delay="2">${(s.bullets || []).join(' ')}</p>
        <div class="divider-bar" data-animate data-delay="3"></div>
      </div>
      <div class="mission-right">${cardsHTML}</div>
    </div>`;
}

// ── SLIDE: CHALLENGE ──────────────────────────────────────────────────────────
function htmlChallenge(s) {
  const items = (s.bullets || []).map((b, i) => `
    <div class="challenge-item" data-animate data-delay="${i + 2}">
      <div class="bullet-dot"></div><span>${esc(b)}</span>
    </div>`).join('');
  return `
    <div class="challenge-layout">
      <div class="challenge-left">
        <div class="eyebrow" data-animate data-delay="0">The Challenge</div>
        <h2 data-animate data-delay="1">The world loses transformative ideas when founders face these <em>alone.</em></h2>
        <p class="challenge-desc" data-animate data-delay="2">${esc(s.note || '')}</p>
      </div>
      <div class="challenge-right">${items}</div>
    </div>`;
}

// ── SLIDE: PARTNERSHIP ────────────────────────────────────────────────────────
function htmlPartnership() {
  const tl = [
    { label: 'Month 1–3',   title: 'Market Research & Strategy' },
    { label: 'Month 4–6',   title: 'Network Activation & Introductions' },
    { label: 'Month 7–9',   title: 'Capital Raising & Deal Structuring' },
    { label: 'Month 10–12', title: 'Scale, Optimise & Expand' },
  ];
  const tlHTML = tl.map((t, i) => `
    <div class="tl-item" data-animate data-delay="${i + 3}">
      <div class="tl-dot"></div>
      <div><div class="tl-label">${t.label}</div><div class="tl-title">${t.title}</div></div>
    </div>`).join('');
  return `
    <div class="partnership-layout">
      <div class="partnership-left">
        <div class="eyebrow" data-animate data-delay="0">Partnership Model</div>
        <h2 data-animate data-delay="1">Every milestone, every risk, every <em>triumph.</em></h2>
        <p class="partnership-desc" data-animate data-delay="2">GSR invests alongside you. We succeed when you succeed. We are in the trenches, celebrating wins and navigating setbacks together.</p>
        <div class="testimonial" data-animate data-delay="3"><p>"GSR didn't just advise us, they invested in us."</p></div>
      </div>
      <div class="timeline-section">
        <div class="case-label" data-animate data-delay="1">Case Study — 12-Month Journey</div>
        <div class="timeline">${tlHTML}</div>
      </div>
    </div>`;
}

// ── SLIDE: SERVICES ───────────────────────────────────────────────────────────
function htmlServices(s) {
  const lItems = (s.left?.bullets  || []).map(b => `<li>${esc(b)}</li>`).join('');
  const rItems = (s.right?.bullets || []).map(b => `<li>${esc(b)}</li>`).join('');
  return `
    <div class="services-layout">
      <div class="services-header">
        <div class="eyebrow" data-animate data-delay="0">What We Do</div>
        <h2 data-animate data-delay="1">Our Core Services</h2>
      </div>
      <div class="service-card" data-animate data-delay="2">
        <div class="service-title">${esc(s.left?.title  || 'Capital & Markets')}</div>
        <ul class="service-list">${lItems}</ul>
      </div>
      <div class="service-card" data-animate data-delay="3">
        <div class="service-title">${esc(s.right?.title || 'Strategy & Growth')}</div>
        <ul class="service-list">${rItems}</ul>
      </div>
    </div>`;
}

// ── SLIDE: CLOSING ────────────────────────────────────────────────────────────
function htmlClosing() {
  return `
    <div class="orb orb-1"></div><div class="orb orb-2"></div>
    <div class="closing-layout">
      <div class="closing-left">
        <div class="eyebrow" data-animate data-delay="0">Get In Touch</div>
        <h2 data-animate data-delay="1">Ready to Scale Your Vision?</h2>
        <p class="closing-sub" data-animate data-delay="2">Join the founders who chose a true partner over a consultant. Let's build something extraordinary together.</p>
        <div class="contact-grid" data-animate data-delay="3">
          <a href="mailto:hello@gsrassociates.com" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">✉️</div>
            <div><div class="contact-label">Email</div><div class="contact-value">hello@gsrassociates.com</div></div>
          </a>
          <a href="https://gsrassociates.com" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">🌐</div>
            <div><div class="contact-label">Website</div><div class="contact-value">gsrassociates.com</div></div>
          </a>
          <a href="https://linkedin.com" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">💼</div>
            <div><div class="contact-label">LinkedIn</div><div class="contact-value">GSR &amp; Associates</div></div>
          </a>
          <a href="tel:+1234567890" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">📞</div>
            <div><div class="contact-label">Phone</div><div class="contact-value">Schedule a Call</div></div>
          </a>
        </div>
      </div>
      <div class="avail-card" data-animate data-delay="3">
        <div class="status-badge"><div class="status-dot"></div><span class="status-text">Accepting Partners</span></div>
        <h3>Partner With GSR</h3>
        <p>We work with a select number of founders each year to ensure every partner receives full attention.</p>
        <a href="mailto:hello@gsrassociates.com" class="avail-cta">START THE CONVERSATION</a>
      </div>
    </div>`;
}

// ── UTILITY ───────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────
function setupNavbar() {
  document.getElementById('exportPdfBtn').addEventListener('click', runPdfExport);
}
function setupNavbarOffset() {
  const nav = document.getElementById('navbar');
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--topOffset', nav.offsetHeight + 'px');
  }).observe(nav);
}

// ── COUNTER + PROGRESS ────────────────────────────────────────────────────────
function updateCounter() {
  const n = slides.length;
  document.getElementById('slideCounter').textContent =
    String(currentSlide + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
  document.getElementById('progressBar').style.width =
    (n > 1 ? (currentSlide / (n - 1)) * 100 : 0) + '%';
}

// ── INTERSECTION OBSERVER ─────────────────────────────────────────────────────
function setupIntersectionObserver() {
  const deck = document.getElementById('deck');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.intersectionRatio < 0.4) return;
      e.target.classList.add('is-active');
      const idx = parseInt(e.target.id.replace('slide-', ''));
      currentSlide = idx;
      updateCounter();
      if (!activated.has(idx)) {
        activated.add(idx);
        staggerAnimations(e.target);
      }
    });
  }, { threshold: 0.4 }); // no root — works for both snap and free scroll
  document.querySelectorAll('.slide').forEach(s => obs.observe(s));
}

function staggerAnimations(slideEl) {
  slideEl.querySelectorAll('[data-animate]').forEach(el => {
    el.style.transitionDelay = (parseInt(el.dataset.delay || '0') * 80) + 'ms';
  });
}

// ── KEYBOARD NAVIGATION ───────────────────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const NEXT = ['ArrowDown', 'ArrowRight', 'PageDown'];
    const PREV = ['ArrowUp',   'ArrowLeft',  'PageUp', 'Backspace'];
    if (e.key === ' ')              { e.preventDefault(); scrollToSlide(currentSlide + (e.shiftKey ? -1 : 1)); }
    else if (NEXT.includes(e.key)) { e.preventDefault(); scrollToSlide(currentSlide + 1); }
    else if (PREV.includes(e.key)) { e.preventDefault(); scrollToSlide(currentSlide - 1); }
  });
}

// ── TOUCH SWIPE (mobile) ──────────────────────────────────────────────────────
function setupTouchSwipe() {
  const deck = document.getElementById('deck');
  let startY = 0, startX = 0;

  deck.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
  }, { passive: true });

  deck.addEventListener('touchend', e => {
    const dy = startY - e.changedTouches[0].clientY;
    const dx = startX - e.changedTouches[0].clientX;
    // Only act on predominantly vertical swipes of sufficient distance
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 60) {
      // On mobile we rely on natural scroll — just update counter from observer
      // No forced navigation needed; CSS scroll handles it
    }
  }, { passive: true });
}

// ── SCROLL TO SLIDE ───────────────────────────────────────────────────────────
function scrollToSlide(idx) {
  const clamped = Math.max(0, Math.min(slides.length - 1, idx));
  document.getElementById('slide-' + clamped)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── CURSOR GLOW (desktop only) ────────────────────────────────────────────────
function setupCursorGlow() {
  const el = document.getElementById('cursor-glow');
  if (!el || !window.matchMedia('(hover: hover)').matches) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let gx = mx, gy = my;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function tick() {
    gx += (mx - gx) * 0.07;
    gy += (my - gy) * 0.07;
    el.style.left = gx + 'px';
    el.style.top  = gy + 'px';
    requestAnimationFrame(tick);
  })();
}

// ── PARTICLE NETWORK ──────────────────────────────────────────────────────────
function setupParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  // Reduce particles on mobile for performance
  const isMobile = window.innerWidth < 600;
  const N = isMobile ? 20 : 40;

  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 0.4,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    a: Math.random() * 0.35 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }));

  let f = 0;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    f++;
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      const alpha = p.a * (0.65 + 0.35 * Math.sin(f * 0.018 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224,123,57,${alpha.toFixed(3)})`;
      ctx.fill();
    });
    // Connection lines (skip on mobile for perf)
    if (!isMobile) {
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(224,123,57,${(0.07 * (1 - d / 130)).toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(draw);
  })();
}

// ── PDF EXPORT ────────────────────────────────────────────────────────────────
async function runPdfExport() {
  const btn = document.getElementById('exportPdfBtn');
  btn.disabled = true; btn.textContent = 'Exporting…';
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    document.body.classList.add('exportingPdf');
    document.querySelectorAll('.slide').forEach(s => {
      s.classList.add('is-active');
      s.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '1'; el.style.transform = 'none'; el.style.transitionDelay = '0ms';
      });
    });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
    for (let i = 0; i < slides.length; i++) {
      const stage = document.createElement('div');
      stage.id = 'pdfStage';
      document.body.appendChild(stage);
      const clone = document.getElementById('slide-' + i).cloneNode(true);
      clone.classList.add('is-active');
      clone.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '1'; el.style.transform = 'none';
      });
      stage.appendChild(clone);
      const cvs = await html2canvas(stage, {
        scale: 2, useCORS: true,
        width: 1920, height: 1080,
        windowWidth: 1920, windowHeight: 1080,
      });
      if (i > 0) pdf.addPage([1920, 1080], 'landscape');
      pdf.addImage(cvs.toDataURL('image/png'), 'PNG', 0, 0, 1920, 1080);
      document.body.removeChild(stage);
    }
    pdf.save('gsr-associates.pdf');
  } catch (err) {
    console.error(err);
    alert('PDF export failed. Please ensure cdnjs.cloudflare.com is reachable.');
  } finally {
    document.body.classList.remove('exportingPdf');
    btn.disabled = false; btn.textContent = 'Export PDF';
  }
}

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

init();
