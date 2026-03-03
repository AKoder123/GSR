'use strict';

let slides = [];
let currentSlide = 0;
let activatedSlides = new Set();

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  const res = await fetch('content.json');
  const data = await res.json();
  renderDeck(data.slides);
  setupNavbar();
  setupKeyboard();
  setupIntersectionObserver();
  setupNavbarOffset();
  setupCursorGlow();
  setupParticles();
  updateCounter();
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderDeck(slideData) {
  const deck = document.getElementById('deck');
  deck.innerHTML = '';
  slides = slideData;
  slideData.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = 'slide';
    el.id = `slide-${i}`;
    el.innerHTML = renderSlide(slide, i);
    deck.appendChild(el);
  });
}

function renderSlide(slide, index) {
  switch (slide.type) {
    case 'title':       return renderTitle(slide, index);
    case 'section':     return renderMission(slide, index);
    case 'content':     return renderContent(slide, index);
    case 'beforeAfter': return renderServices(slide, index);
    case 'closing':     return renderClosing(slide, index);
    default:            return renderContent(slide, index);
  }
}

// ── TITLE ─────────────────────────────────────────────────────────────────────
function renderTitle(slide) {
  const tags = (slide.bullets || []).map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <div class="orb1"></div><div class="orb2"></div>
    <div class="title-layout">
      <div class="title-left">
        <div class="eyebrow" data-animate data-delay="0">GSR &amp; Associates</div>
        <h1 data-animate data-delay="1">Growing Leaders,<br><em>Scaling Vision,</em><br>Together.</h1>
        <p class="title-sub" data-animate data-delay="2">${slide.subheadline || ''}</p>
        <div class="tag-cloud" data-animate data-delay="3">${tags}</div>
      </div>
      <div class="data-panel" data-animate data-delay="2">
        <div class="data-row"><span class="data-label">Focus</span><span class="data-value accent">Founder-First</span></div>
        <div class="data-row"><span class="data-label">Model</span><span class="data-value">Partnership</span></div>
        <div class="data-row"><span class="data-label">Approach</span><span class="data-value">Invest &amp; Advise</span></div>
        <div class="data-row"><span class="data-label">Timeline</span><span class="data-value accent">12-Month Journey</span></div>
        <div class="data-row"><span class="data-label">Markets</span><span class="data-value">Global</span></div>
        <button class="cta-button" onclick="scrollToSlide(slides.length - 1)">PARTNER WITH US</button>
      </div>
    </div>
    <div class="scroll-cue"><span>SCROLL</span><div class="chevron"></div></div>
  `;
}

// ── MISSION ───────────────────────────────────────────────────────────────────
function renderMission(slide) {
  const cards = [
    { icon: '🤝', title: 'True Partners', desc: 'We invest in your vision, not just your metrics.' },
    { icon: '🌍', title: 'Global Reach', desc: 'Connections across markets, industries and borders.' },
    { icon: '🚀', title: 'Scale Ready', desc: 'Systems and strategies built for exponential growth.' },
    { icon: '💡', title: 'Ideas First', desc: 'We champion innovation before it becomes obvious.' }
  ];
  const cardsHtml = cards.map((c, i) => `
    <div class="mission-card" data-animate data-delay="${i + 2}">
      <div class="mission-icon">${c.icon}</div>
      <div class="mission-card-text"><h4>${c.title}</h4><p>${c.desc}</p></div>
    </div>`).join('');
  return `
    <div class="mission-layout">
      <div class="mission-left">
        <div class="eyebrow" data-animate data-delay="0">Our Mission</div>
        <h2 data-animate data-delay="1">We believe in <em>founders,</em> not just formulas.</h2>
        <p class="mission-body" data-animate data-delay="2">${(slide.bullets || []).join(' ')}</p>
        <div class="divider-bar" data-animate data-delay="3"></div>
      </div>
      <div class="mission-right">${cardsHtml}</div>
    </div>`;
}

// ── CONTENT ROUTER ────────────────────────────────────────────────────────────
function renderContent(slide) {
  if ((slide.headline || '').toLowerCase().includes('challenge')) return renderChallenge(slide);
  return renderPartnership(slide);
}

// ── CHALLENGE ─────────────────────────────────────────────────────────────────
function renderChallenge(slide) {
  const items = (slide.bullets || []).map((b, i) => `
    <div class="challenge-item" data-animate data-delay="${i + 2}">
      <div class="bullet-dot"></div><span>${b}</span>
    </div>`).join('');
  return `
    <div class="challenge-layout">
      <div class="challenge-left">
        <div class="eyebrow" data-animate data-delay="0">The Challenge</div>
        <h2 data-animate data-delay="1">The world loses transformative ideas when founders face these <em>alone.</em></h2>
        <p class="challenge-desc" data-animate data-delay="2">${slide.note || ''}</p>
      </div>
      <div class="challenge-right">${items}</div>
    </div>`;
}

// ── PARTNERSHIP ───────────────────────────────────────────────────────────────
function renderPartnership() {
  const timelineItems = [
    { label: 'Month 1–3', title: 'Market Research & Strategy' },
    { label: 'Month 4–6', title: 'Network Activation & Introductions' },
    { label: 'Month 7–9', title: 'Capital Raising & Deal Structuring' },
    { label: 'Month 10–12', title: 'Scale, Optimise & Expand' }
  ];
  const tlHtml = timelineItems.map((t, i) => `
    <div class="timeline-item" data-animate data-delay="${i + 3}">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-label">${t.label}</div>
        <div class="timeline-title">${t.title}</div>
      </div>
    </div>`).join('');
  return `
    <div class="partnership-layout">
      <div class="partnership-left">
        <div class="eyebrow" data-animate data-delay="0">Partnership Model</div>
        <h2 data-animate data-delay="1">Every milestone, every risk, every <em>triumph.</em></h2>
        <p class="partnership-desc" data-animate data-delay="2">GSR invests alongside you. We succeed when you succeed. We are in the trenches, celebrating wins and navigating setbacks together.</p>
        <div class="testimonial" data-animate data-delay="3">
          <p>"GSR didn't just advise us, they invested in us."</p>
        </div>
      </div>
      <div class="timeline-section">
        <div class="case-study-label" data-animate data-delay="1">Case Study — 12-Month Journey</div>
        <div class="timeline">${tlHtml}</div>
      </div>
    </div>`;
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
function renderServices(slide) {
  const lBullets = (slide.left?.bullets || []).map(b => `<li>${b}</li>`).join('');
  const rBullets = (slide.right?.bullets || []).map(b => `<li>${b}</li>`).join('');
  return `
    <div class="services-layout">
      <div class="services-header">
        <div class="eyebrow" data-animate data-delay="0">What We Do</div>
        <h2 data-animate data-delay="1">Our Core Services</h2>
      </div>
      <div class="service-card" data-animate data-delay="2">
        <div class="service-card-title">${slide.left?.title || 'Capital & Markets'}</div>
        <ul class="service-list">${lBullets}</ul>
      </div>
      <div class="service-card" data-animate data-delay="3">
        <div class="service-card-title">${slide.right?.title || 'Strategy & Growth'}</div>
        <ul class="service-list">${rBullets}</ul>
      </div>
    </div>`;
}

// ── CLOSING ───────────────────────────────────────────────────────────────────
function renderClosing() {
  return `
    <div class="orb1"></div><div class="orb2"></div>
    <div class="closing-layout">
      <div class="closing-left">
        <div class="eyebrow" data-animate data-delay="0">Get In Touch</div>
        <h2 data-animate data-delay="1">Ready to Scale Your Vision?</h2>
        <p class="closing-sub" data-animate data-delay="2">Join the founders who chose a true partner over a consultant. Let's build something extraordinary together.</p>
        <div class="contact-grid" data-animate data-delay="3">
          <a href="mailto:hello@gsrassociates.com" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">✉️</div>
            <div class="contact-info"><div class="contact-label">Email</div><div class="contact-value">hello@gsrassociates.com</div></div>
          </a>
          <a href="https://gsrassociates.com" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">🌐</div>
            <div class="contact-info"><div class="contact-label">Website</div><div class="contact-value">gsrassociates.com</div></div>
          </a>
          <a href="https://linkedin.com" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">💼</div>
            <div class="contact-info"><div class="contact-label">LinkedIn</div><div class="contact-value">GSR & Associates</div></div>
          </a>
          <a href="tel:+1234567890" class="contact-card" target="_blank" rel="noopener">
            <div class="contact-icon">📞</div>
            <div class="contact-info"><div class="contact-label">Phone</div><div class="contact-value">Schedule a Call</div></div>
          </a>
        </div>
      </div>
      <div class="availability-card" data-animate data-delay="3">
        <div class="status-badge"><div class="status-dot"></div><span class="status-text">Accepting Partners</span></div>
        <h3>Partner With GSR</h3>
        <p>We work with a select number of founders each year to ensure every partner receives our full attention and commitment.</p>
        <a href="mailto:hello@gsrassociates.com" class="avail-cta">START THE CONVERSATION</a>
      </div>
    </div>`;
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────
function setupNavbar() {
  document.getElementById('exportPdfBtn').addEventListener('click', runPdfExport);
}

function setupNavbarOffset() {
  const navbar = document.getElementById('navbar');
  const ro = new ResizeObserver(() => {
    const h = navbar.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--topOffset', h + 'px');
  });
  ro.observe(navbar);
}

// ── COUNTER & PROGRESS ────────────────────────────────────────────────────────
function updateCounter() {
  const total = slides.length;
  document.getElementById('slideCounter').textContent =
    String(currentSlide + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  const pct = total > 1 ? (currentSlide / (total - 1)) * 100 : 0;
  document.getElementById('progressBar').style.width = pct + '%';
}

// ── INTERSECTION OBSERVER ─────────────────────────────────────────────────────
function setupIntersectionObserver() {
  const deck = document.getElementById('deck');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const el = entry.target;
        el.classList.add('is-active');
        const idx = parseInt(el.id.replace('slide-', ''));
        currentSlide = idx;
        updateCounter();
        if (!activatedSlides.has(idx)) {
          activatedSlides.add(idx);
          triggerEffects(el);
        }
      }
    });
  }, { threshold: 0.5, root: deck });
  document.querySelectorAll('.slide').forEach(s => observer.observe(s));
}

function triggerEffects(slideEl) {
  slideEl.querySelectorAll('[data-animate]').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0) * 75;
    setTimeout(() => { el.style.transitionDelay = delay + 'ms'; }, 10);
  });
}

// ── KEYBOARD NAV ──────────────────────────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    switch (e.key) {
      case ' ':         e.preventDefault(); e.shiftKey ? scrollToSlide(currentSlide - 1) : scrollToSlide(currentSlide + 1); break;
      case 'ArrowDown': case 'ArrowRight': case 'PageDown': e.preventDefault(); scrollToSlide(currentSlide + 1); break;
      case 'ArrowUp':   case 'ArrowLeft':  case 'PageUp': case 'Backspace': e.preventDefault(); scrollToSlide(currentSlide - 1); break;
    }
  });
}

function scrollToSlide(idx) {
  const clamped = Math.max(0, Math.min(slides.length - 1, idx));
  document.getElementById(`slide-${clamped}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── CURSOR GLOW ───────────────────────────────────────────────────────────────
function setupCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// ── PARTICLE SYSTEM ───────────────────────────────────────────────────────────
function setupParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 38;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.2 + 0.4,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.5 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }));

  let frame = 0;
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const pulse = p.alpha * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224,123,57,${pulse})`;
      ctx.fill();
    });

    // Draw subtle connection lines
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(224,123,57,${0.06 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// ── PDF EXPORT ────────────────────────────────────────────────────────────────
async function runPdfExport() {
  const btn = document.getElementById('exportPdfBtn');
  btn.disabled = true;
  btn.textContent = 'Exporting…';

  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    document.body.classList.add('exportingPdf');
    document.querySelectorAll('.slide').forEach(s => {
      s.classList.add('is-active');
      s.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transitionDelay = '0ms';
      });
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
    const slideEls = document.querySelectorAll('.slide');

    for (let i = 0; i < slideEls.length; i++) {
      const stage = document.createElement('div');
      stage.id = 'pdfStage';
      document.body.appendChild(stage);

      const clone = slideEls[i].cloneNode(true);
      clone.classList.add('is-active');
      clone.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '1'; el.style.transform = 'none';
      });
      stage.appendChild(clone);

      const canvas = await html2canvas(stage, {
        scale: 2, useCORS: true,
        width: 1920, height: 1080,
        windowWidth: 1920, windowHeight: 1080
      });

      if (i > 0) pdf.addPage([1920, 1080], 'landscape');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 1920, 1080);
      document.body.removeChild(stage);
    }

    pdf.save('gsr-associates.pdf');
  } catch (err) {
    console.error(err);
    alert('Export failed. Please ensure cdnjs.cloudflare.com is reachable.');
  } finally {
    document.body.classList.remove('exportingPdf');
    btn.disabled = false;
    btn.textContent = 'Export PDF';
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

init();
