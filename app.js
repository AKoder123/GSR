
/* GSR Web Deck — vanilla JS, no framework */
(() => {
  const deckEl = document.getElementById('deck');
  const dotsEl = document.getElementById('dots');
  const progressBar = document.getElementById('progressBar');
  const exportBtn = document.getElementById('exportPdfBtn');
  const topbar = document.getElementById('topbar');

  const hint = document.getElementById('hint');
  const helpBtn = document.getElementById('helpBtn');
  const closeHintBtn = document.getElementById('closeHintBtn');

  let slides = [];
  let activeIndex = 0;
  let observer;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function setTopOffset() {
    const rect = topbar.getBoundingClientRect();
    const safe = 0;
    const offset = Math.ceil(rect.height + safe);
    document.documentElement.style.setProperty('--topOffset', offset + 'px');
  }

  function setCompactMode() {
    // Compact mode for short viewports: keep everything visible at 100% zoom.
    const h = window.innerHeight;
    document.body.classList.toggle('compact', h < 740);
  }

  function escapeHtml(str) {
    return (str ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[c]);
  }

  function highlightAccent(headline) {
    // turn tokens wrapped with {accent:word} into accent span
    return escapeHtml(headline).replace(/\{accent:([^}]+)\}/g, '<span class="accent">$1</span>');
  }

  function withAccentStyling(text) {
    // Allow simple emphasis with *word* => accent italic.
    const safe = escapeHtml(text);
    return safe.replace(/\*([^*]+)\*/g, '<span class="accent">$1</span>');
  }

  function renderSlide(slide, idx, meta) {
    const type = slide.type;
    const wrapper = document.createElement('section');
    wrapper.className = 'slide';
    wrapper.dataset.index = String(idx);

    // Each slide has a clone-friendly background layer.
    const bg = document.createElement('div');
    bg.className = 'bg';
    wrapper.appendChild(bg);

    const inner = document.createElement('div');
    inner.className = 'slide__inner';
    wrapper.appendChild(inner);

    if (type === 'title' || type === 'closing') {
      const hero = document.createElement('div');
      hero.className = 'panel hero hero--dark';

      const eyebrow = document.createElement('div');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = meta.title;
      eyebrow.setAttribute('data-animate','');
      eyebrow.dataset.delay = '1';

      const h = document.createElement('h1');
      h.className = 'h1';
      h.innerHTML = withAccentStyling(slide.headline).replace(/\n/g,'<br/>');
      h.setAttribute('data-animate','');
      h.dataset.delay = '2';

      const p = document.createElement('p');
      p.className = 'lede';
      p.innerHTML = withAccentStyling(slide.subheadline || '').replace(/\n/g,'<br/>');
      p.setAttribute('data-animate','');
      p.dataset.delay = '3';

      const row = document.createElement('div');
      row.className = 'hero__ctaRow';
      row.setAttribute('data-animate','');
      row.dataset.delay = '4';

      const cta = document.createElement('button');
      cta.type = 'button';
      cta.className = 'btn';
      cta.textContent = (type === 'closing') ? 'Contact us' : 'Partner with us';
      cta.addEventListener('click', () => {
        const target = (type === 'closing') ? 'mailto:hello@gsr.associates' : '#';
        if (target.startsWith('mailto:')) window.location.href = target;
        else alert('CTA placeholder — wire this to your contact form or calendar link.');
      });

      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = '<span class="chip__dot" aria-hidden="true"></span><span>Advisory + Investment Partnership</span>';

      row.appendChild(cta);
      row.appendChild(chip);

      hero.appendChild(eyebrow);
      hero.appendChild(h);
      hero.appendChild(p);
      hero.appendChild(row);

      inner.appendChild(hero);

      if (slide.bullets?.length) {
        const list = document.createElement('ul');
        list.className = 'kpiList';
        slide.bullets.forEach((b) => {
          const li = document.createElement('li');
          li.className = 'kpi';
          li.innerHTML = `<div class="dot" aria-hidden="true"></div><div><strong>Detail</strong><span>${escapeHtml(b)}</span></div>`;
          li.setAttribute('data-animate','');
          li.dataset.delay = '4';
          list.appendChild(li);
        });
        inner.appendChild(list);
      }
      return wrapper;
    }

    if (type === 'section') {
      const stack = document.createElement('div');
      stack.className = 'stack';

      const eyebrow = document.createElement('div');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = (slide.headline || '').toUpperCase();
      eyebrow.setAttribute('data-animate','');
      eyebrow.dataset.delay = '1';

      const h = document.createElement('h2');
      h.className = 'h2';
      // mimic screenshot: large serif with an accent word
      const words = (slide.subheadline || '').split(' ');
      if (words.length > 0) {
        // accent the last word
        const last = words.pop();
        h.innerHTML = `${escapeHtml(words.join(' '))} <span class="accent">${escapeHtml(last)}</span>`;
      } else {
        h.textContent = slide.subheadline || '';
      }
      h.setAttribute('data-animate','');
      h.dataset.delay = '2';

      const rule = document.createElement('div');
      rule.className = 'rule';
      rule.setAttribute('data-animate','');
      rule.dataset.delay = '3';

      stack.appendChild(eyebrow);
      stack.appendChild(h);
      stack.appendChild(rule);

      inner.appendChild(stack);
      return wrapper;
    }

    if (type === 'beforeAfter') {
      const panel = document.createElement('div');
      panel.className = 'panel hero';
      panel.style.background = 'rgba(255,255,255,0.74)';

      const eyebrow = document.createElement('div');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'Differentiation';
      eyebrow.setAttribute('data-animate','');
      eyebrow.dataset.delay = '1';

      const h = document.createElement('h2');
      h.className = 'h2';
      h.innerHTML = withAccentStyling(slide.headline || '');
      h.setAttribute('data-animate','');
      h.dataset.delay = '2';

      const compare = document.createElement('div');
      compare.className = 'compare';
      compare.setAttribute('data-animate','');
      compare.dataset.delay = '3';

      const col = (side, cls) => {
        const c = document.createElement('div');
        c.className = `compare__col ${cls}`;
        const t = document.createElement('div');
        t.className = 'compare__title';
        t.textContent = side.title || '';
        const ul = document.createElement('ul');
        ul.className = 'ul';
        (side.bullets || []).forEach(b => {
          const li = document.createElement('li');
          li.textContent = b;
          ul.appendChild(li);
        });
        c.appendChild(t);
        c.appendChild(ul);
        return c;
      };

      compare.appendChild(col(slide.left || {}, 'left'));
      compare.appendChild(col(slide.right || {}, 'right'));

      panel.appendChild(eyebrow);
      panel.appendChild(h);
      panel.appendChild(compare);

      inner.appendChild(panel);
      return wrapper;
    }

    // content slide (default)
    const shell = document.createElement('div');
    shell.className = 'grid2';

    const left = document.createElement('div');
    left.className = 'panel hero';
    left.style.background = 'rgba(255,255,255,0.74)';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = (type === 'content') ? 'Overview' : 'Content';
    eyebrow.setAttribute('data-animate','');
    eyebrow.dataset.delay = '1';

    const h = document.createElement('h2');
    h.className = 'h2';
    h.innerHTML = withAccentStyling(slide.headline || '').replace(/\n/g,'<br/>');
    h.setAttribute('data-animate','');
    h.dataset.delay = '2';

    const p = document.createElement('p');
    p.className = 'lede';
    p.innerHTML = withAccentStyling(slide.subheadline || '').replace(/\n/g,'<br/>');
    p.setAttribute('data-animate','');
    p.dataset.delay = '3';

    left.appendChild(eyebrow);
    left.appendChild(h);
    if (slide.subheadline) left.appendChild(p);
    left.appendChild(document.createElement('div')).className = 'rule';

    // Right side: either cards (bullets) + optional quote
    const right = document.createElement('div');
    right.className = 'stack';

    if (Array.isArray(slide.bullets) && slide.bullets.length) {
      const cards = document.createElement('div');
      cards.className = 'cards';
      slide.bullets.forEach((b, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-animate','');
        card.dataset.delay = String(clamp(i + 1, 1, 4));

        const row = document.createElement('div');
        row.className = 'card__row';

        const d = document.createElement('div');
        d.className = 'dot';
        d.setAttribute('aria-hidden','true');

        const t = document.createElement('p');
        t.className = 'card__text';
        t.textContent = b;

        row.appendChild(d);
        row.appendChild(t);
        card.appendChild(row);
        cards.appendChild(card);
      });
      right.appendChild(cards);
    }

    if (slide.note) {
      const q = document.createElement('div');
      q.className = 'panel hero';
      q.style.background = 'rgba(255,255,255,0.66)';
      q.setAttribute('data-animate','');
      q.dataset.delay = '4';

      const line = document.createElement('div');
      line.style.width = '4px';
      line.style.height = '64px';
      line.style.borderRadius = '999px';
      line.style.background = 'linear-gradient(180deg, var(--accent), transparent)';
      line.style.marginRight = '14px';

      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '14px';
      wrap.style.alignItems = 'flex-start';

      const qt = document.createElement('p');
      qt.className = 'quote';
      qt.textContent = slide.note.replace(/^Quote:\s*/i,'').trim();

      wrap.appendChild(line);
      wrap.appendChild(qt);
      q.appendChild(wrap);
      right.appendChild(q);
    }

    shell.appendChild(left);
    shell.appendChild(right);

    inner.appendChild(shell);
    return wrapper;
  }

  function buildDots(total) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.className = 'dotBtn';
      b.type = 'button';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => scrollToIndex(i));
      dotsEl.appendChild(b);
    }
  }

  function setActiveIndex(i, fromObserver = false) {
    activeIndex = clamp(i, 0, slides.length - 1);
    const dotButtons = Array.from(dotsEl.querySelectorAll('.dotBtn'));
    dotButtons.forEach((d, idx) => d.setAttribute('aria-current', String(idx === activeIndex)));
    const pct = slides.length <= 1 ? 0 : (activeIndex / (slides.length - 1)) * 100;
    progressBar.style.width = `${pct}%`;
    if (!fromObserver) slides[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollToIndex(i) {
    setActiveIndex(i, false);
  }

  function getNearestIndex() {
    const rect = deckEl.getBoundingClientRect();
    const centerY = rect.top + rect.height * 0.35;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const dist = Math.abs((r.top + r.height * 0.1) - centerY);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  function setupObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target;
        if (e.isIntersecting) el.classList.add('is-active');
      }
      // Update active dot based on nearest slide.
      setActiveIndex(getNearestIndex(), true);
    }, { root: deckEl, threshold: 0.38 });
    slides.forEach(s => observer.observe(s));
  }

  function bindKeys() {
    window.addEventListener('keydown', (e) => {
      // Don't hijack typing.
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      const typing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      if (typing) return;

      if (e.code === 'Space') {
        e.preventDefault();
        const dir = e.shiftKey ? -1 : 1;
        scrollToIndex(activeIndex + dir);
      }
      if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      }
      if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
      if (e.code === 'Escape') closeHint();
    }, { passive: false });
  }

  function openHint(){
    hint.setAttribute('aria-hidden','false');
  }
  function closeHint(){
    hint.setAttribute('aria-hidden','true');
  }

  async function loadContent() {
    const res = await fetch('content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load content.json');
    return await res.json();
  }

  async function init() {
    setTopOffset();
    setCompactMode();

    window.addEventListener('resize', () => { setTopOffset(); setCompactMode(); }, { passive: true });

    helpBtn.addEventListener('click', openHint);
    closeHintBtn.addEventListener('click', closeHint);
    hint.addEventListener('click', (e) => { if (e.target === hint) closeHint(); });

    bindKeys();

    let data;
    try {
      data = await loadContent();
    } catch (err) {
      deckEl.innerHTML = `
        <section class="slide is-active">
          <div class="bg"></div>
          <div class="slide__inner">
            <div class="panel hero" style="background:rgba(255,255,255,0.84)">
              <div class="eyebrow">Error</div>
              <h2 class="h2">Can’t load content.</h2>
              <p class="lede">Make sure <strong>content.json</strong> is in the same folder as <strong>index.html</strong>, then refresh.</p>
              <p class="lede" style="color:rgba(15,23,42,0.72)">Details: ${escapeHtml(String(err.message || err))}</p>
            </div>
          </div>
        </section>`;
      return;
    }

    const meta = data.meta || { title: 'GSR & Associates' };
    const slideData = Array.isArray(data.slides) ? data.slides : [];

    deckEl.innerHTML = '';
    slideData.forEach((s, idx) => deckEl.appendChild(renderSlide(s, idx, meta)));

    slides = Array.from(deckEl.querySelectorAll('.slide'));
    buildDots(slides.length);
    setupObserver();

    // Ensure initial state
    slides[0]?.classList.add('is-active');
    setActiveIndex(0, true);

    setupPdfExport();
  }

  /* --------------------- PDF Export (cdn, 16:9 fixed) --------------------- */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensurePdfLibs() {
    if (window.html2canvas && window.jspdf?.jsPDF) return;
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    } catch (err) {
      alert('PDF export needs cdnjs.cloudflare.com доступ/allowed. If blocked, self-host html2canvas and jsPDF or allow the CDN.');
      throw err;
    }
  }

  function forceEnteredState() {
    slides.forEach(s => s.classList.add('is-active'));
  }

  function createPdfStage() {
    const stage = document.createElement('div');
    stage.id = 'pdfStage';
    const deck = document.createElement('div');
    deck.className = 'deck';
    stage.appendChild(deck);
    document.body.appendChild(stage);
    return { stage, deck };
  }

  async function captureSlideToCanvas(slideEl) {
    const { stage, deck } = createPdfStage();

    // clone background layer
    const bg = slideEl.querySelector('.bg');
    if (bg) deck.appendChild(bg.cloneNode(true));

    // clone slide itself
    const clone = slideEl.cloneNode(true);
    clone.classList.add('is-active');
    deck.appendChild(clone);

    // Make sure the stage is fully laid out
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const scale = Math.max(2, window.devicePixelRatio || 1);

    const canvas = await window.html2canvas(stage, {
      backgroundColor: '#050611',
      scale,
      useCORS: true,
      logging: false
    });

    stage.remove();
    return canvas;
  }

  async function setupPdfExport() {
    exportBtn.addEventListener('click', async () => {
      exportBtn.disabled = true;
      const prevText = exportBtn.textContent;
      exportBtn.textContent = 'Exporting…';

      try {
        await ensurePdfLibs();

        document.body.classList.add('exportingPdf');
        forceEnteredState();

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });

        for (let i = 0; i < slides.length; i++) {
          const canvas = await captureSlideToCanvas(slides[i]);
          const img = canvas.toDataURL('image/png');

          if (i > 0) pdf.addPage([1920, 1080], 'landscape');
          pdf.addImage(img, 'PNG', 0, 0, 1920, 1080);
        }

        pdf.save('GSR.pdf');
      } catch (err) {
        console.error(err);
      } finally {
        document.body.classList.remove('exportingPdf');
        exportBtn.disabled = false;
        exportBtn.textContent = prevText;
      }
    });
  }

  init();
})();
