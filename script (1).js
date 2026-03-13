/* ═══════════════════════════════════════════════════
   BMW M4 Competition — script.js
   ═══════════════════════════════════════════════════ */

'use strict';

// ── Custom cursor ──
(function () {
  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.style.cssText = `
    position:fixed;top:0;left:0;width:12px;height:12px;
    background:var(--blue);border-radius:50%;pointer-events:none;
    z-index:99999;transform:translate(-50%,-50%);
    transition:width .2s,height .2s,background .2s;
    mix-blend-mode:difference;
  `;
  document.body.appendChild(cursor);

  const trail = document.createElement('div');
  trail.style.cssText = `
    position:fixed;top:0;left:0;width:36px;height:36px;
    border:1px solid rgba(28,105,212,0.5);border-radius:50%;
    pointer-events:none;z-index:99998;transform:translate(-50%,-50%);
    transition:all .12s ease;
  `;
  document.body.appendChild(trail);

  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  (function animTrail() {
    tx += (mx - tx) * 0.18;
    ty += (my - ty) * 0.18;
    trail.style.left = tx + 'px';
    trail.style.top = ty + 'px';
    requestAnimationFrame(animTrail);
  })();

  document.querySelectorAll('a, button, .swatch, .gallery-item, .exp-card, .hotspot').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.background = 'var(--blue-light)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '12px';
      cursor.style.height = '12px';
      cursor.style.background = 'var(--blue)';
    });
  });
})();

// ── Navbar scroll ──
(function () {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  ham.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close nav on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
})();

// ── Hero fade-in sequence ──
(function () {
  const els = document.querySelectorAll('.fade-up');
  els.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => {
      el.classList.add('visible');
    }, 300 + delay);
  });
})();

// ── Hero parallax ──
(function () {
  const heroImg = document.getElementById('heroImg');
  if (!heroImg) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        heroImg.style.transform = `scale(1.1) translateY(${scrollY * 0.3}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ── Intersection Observer — reveal elements ──
(function () {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

// ── Number counters ──
(function () {
  const counters = document.querySelectorAll('.spec-counter');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isDecimal = el.dataset.decimal === '1';
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = isDecimal
          ? current.toFixed(1) + suffix
          : Math.round(current) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ── Showcase Slider ──
(function () {
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('slideDots');
  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');
  let current = 0;
  let autoTimer = null;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  });

  function goTo(idx) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  const stage = document.querySelector('.showcase-stage');
  stage.addEventListener('mouseenter', stopAuto);
  stage.addEventListener('mouseleave', startAuto);

  // Touch swipe
  let touchStartX = 0;
  stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  });

  startAuto();
})();

// ── Color Selector ──
(function () {
  const swatches = document.querySelectorAll('.swatch');
  const colorName = document.getElementById('colorName');
  const colorBar = document.getElementById('colorBar');

  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      colorName.textContent = sw.dataset.name;
      colorName.style.color = 'var(--white)';
      colorBar.style.background = sw.dataset.color;
    });
  });
})();

// ── Gallery Lightbox ──
(function () {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  let currentIdx = 0;

  const gallery = Array.from(items).map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt,
    caption: item.querySelector('.gallery-overlay span')?.textContent || ''
  }));

  function openLightbox(idx) {
    currentIdx = idx;
    lbImg.src = gallery[idx].src;
    lbImg.alt = gallery[idx].alt;
    lbCaption.textContent = gallery[idx].caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showLb(idx) {
    currentIdx = (idx + gallery.length) % gallery.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = gallery[currentIdx].src;
      lbCaption.textContent = gallery[currentIdx].caption;
      lbImg.style.opacity = '1';
    }, 200);
    lbImg.style.transition = 'opacity 0.3s';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => showLb(currentIdx - 1));
  lbNext.addEventListener('click', () => showLb(currentIdx + 1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLb(currentIdx - 1);
    if (e.key === 'ArrowRight') showLb(currentIdx + 1);
  });
})();

// ── Ripple effect ──
(function () {
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;border-radius:50%;
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        background:rgba(255,255,255,0.25);
        transform:scale(0);
        animation:ripple-effect 0.7s linear;
        pointer-events:none;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
})();

// ── Engine Sound Simulation ──
(function () {
  const btn = document.getElementById('soundBtn');
  const rpmBar = document.getElementById('rpmBar');
  const rpmLabel = document.getElementById('rpmLabel');
  let isRunning = false;
  let audioCtx = null;
  let animFrame = null;
  let currentRpm = 0;
  let targetRpm = 0;

  function createEngineAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Oscillators simulating engine
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 1.5);
    gain.connect(audioCtx.destination);

    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(60, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 1.5);

    const osc2 = audioCtx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 1.5);

    const distortion = audioCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (3 + 80) * x / (Math.PI + 80 * Math.abs(x));
    }
    distortion.curve = curve;

    osc1.connect(distortion);
    osc2.connect(distortion);
    distortion.connect(gain);
    osc1.start();
    osc2.start();

    return { gain, osc1, osc2, startTime: audioCtx.currentTime };
  }

  let engineNodes = null;

  function animRpm(running) {
    if (running) {
      targetRpm = 3800 + Math.random() * 800;
    } else {
      targetRpm = 0;
    }

    function tick() {
      const diff = targetRpm - currentRpm;
      currentRpm += diff * 0.04;
      const pct = Math.min((currentRpm / 7000) * 100, 100);
      rpmBar.style.width = pct * 2 + 'px';
      rpmLabel.textContent = Math.round(currentRpm) + ' RPM';

      if (running && Math.abs(currentRpm - targetRpm) < 100) {
        targetRpm = 2500 + Math.random() * 2500;
      }

      if (!running && currentRpm < 10) {
        currentRpm = 0;
        rpmBar.style.width = '0';
        rpmLabel.textContent = '0 RPM';
        return;
      }

      animFrame = requestAnimationFrame(tick);
    }

    cancelAnimationFrame(animFrame);
    tick();
  }

  btn.addEventListener('click', () => {
    if (!isRunning) {
      isRunning = true;
      btn.classList.add('active');
      btn.querySelector('.sound-icon').textContent = '■';
      btn.querySelector('.sound-label').textContent = 'RUNNING';
      try { engineNodes = createEngineAudio(); } catch (e) {}
      animRpm(true);
    } else {
      isRunning = false;
      btn.classList.remove('active');
      btn.querySelector('.sound-icon').textContent = '▶';
      btn.querySelector('.sound-label').textContent = 'START ENGINE';
      if (engineNodes) {
        try {
          engineNodes.gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
          setTimeout(() => {
            engineNodes.osc1.stop();
            engineNodes.osc2.stop();
          }, 1300);
        } catch (e) {}
        engineNodes = null;
      }
      animRpm(false);
    }
  });
})();

// ── Timeline node pulse on hover ──
(function () {
  document.querySelectorAll('.tl-node:not(.current)').forEach(node => {
    node.addEventListener('mouseenter', () => {
      node.style.background = 'var(--blue)';
      node.style.boxShadow = '0 0 12px var(--blue-glow)';
    });
    node.addEventListener('mouseleave', () => {
      node.style.background = '';
      node.style.boxShadow = '';
    });
  });
})();

// ── Animated gradient heading on hero scroll ──
(function () {
  const accent = document.querySelector('.title-line.accent');
  if (!accent) return;
  let hue = 210;

  window.addEventListener('scroll', () => {
    hue = 210 + (window.scrollY / document.body.scrollHeight) * 30;
    accent.style.color = `hsl(${hue}, 75%, 55%)`;
  }, { passive: true });
})();

// ── Section active nav highlight ──
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navAs = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAs.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + entry.target.id
            ? 'var(--white)'
            : 'var(--white-dim)';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

// ── Ambient interior glow cycling ──
(function () {
  const glow = document.getElementById('ambientGlow');
  if (!glow) return;
  const colors = [
    'rgba(28,105,212,0.18)',
    'rgba(50,180,255,0.12)',
    'rgba(28,105,212,0.2)',
    'rgba(100,100,255,0.12)',
  ];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % colors.length;
    glow.style.background = `radial-gradient(ellipse at 50% 80%, ${colors[idx]}, transparent 60%)`;
    glow.style.transition = 'background 2s ease';
  }, 2500);
})();

// ── Lazy loading fallback ──
(function () {
  if ('loading' in HTMLImageElement.prototype) return;
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = img.dataset.src || img.src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  });
})();

// ── Specs section animated glow on hover ──
(function () {
  document.querySelectorAll('.spec-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--gx', x + '%');
      card.style.setProperty('--gy', y + '%');
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(28,105,212,0.12), var(--carbon2) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = 'var(--carbon2)';
    });
  });
})();

// ── Page load progress bar ──
(function () {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:2px;
    background:var(--blue);z-index:99999;
    transition:width .3s ease;width:0;
    box-shadow:0 0 8px var(--blue-glow);
  `;
  document.body.appendChild(bar);
  bar.style.width = '30%';
  window.addEventListener('load', () => {
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; setTimeout(() => bar.remove(), 400); }, 500);
  });
})();

// ── Footer reveal on scroll ──
(function () {
  const footer = document.getElementById('footer');
  if (!footer) return;
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      footer.style.opacity = '1';
      footer.style.transform = 'none';
      obs.unobserve(footer);
    }
  }, { threshold: 0.05 });
  footer.style.opacity = '0';
  footer.style.transform = 'translateY(20px)';
  footer.style.transition = 'opacity 0.8s, transform 0.8s';
  obs.observe(footer);
})();
