/* ==========================================================================
   script.js — Subtle animations, typing effect, binary background,
   boot screen, and scroll observers.
   ========================================================================== */

(function () {
  // Utility: clamp
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Boot screen: simulate brief loading then hide
  const boot = document.getElementById('boot-screen');
  const bootFill = document.querySelector('.boot-fill');
  const bootStatus = document.querySelector('.boot-status');

  const finishBoot = () => {
    bootStatus.textContent = 'ready';
    // Fade out
    boot.style.transition = 'opacity 360ms ease';
    boot.style.opacity = '0';
    setTimeout(() => boot.remove(), 380);
    // Start typing once boot is done
    startTyping();
  };

  // If animations disabled, skip quickly
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    finishBoot();
  } else {
    // End boot after fill animation completes
    setTimeout(finishBoot, 1800);
  }

  // Typing effect
  function startTyping() {
    const typedEl = document.getElementById('typed');
    if (!typedEl) return;

    // Phrases feel like a living compiler
    const lines = [
      'compile --mind --opt-level=O2',
      'analyze --data-structures graph stack queue',
      'link --ideas --memory=RAII',
      'emit bytecode --target=experience',
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const speed = { type: 36, pause: 800, back: 20 }; // ms

    function tick() {
      const full = lines[lineIndex];

      if (!deleting) {
        charIndex++;
        typedEl.textContent = full.slice(0, charIndex);
        if (charIndex === full.length) {
          deleting = true;
          setTimeout(tick, speed.pause);
          return;
        }
        setTimeout(tick, speed.type);
      } else {
        charIndex--;
        typedEl.textContent = full.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          lineIndex = (lineIndex + 1) % lines.length;
          setTimeout(tick, 500);
          return;
        }
        setTimeout(tick, speed.back);
      }
    }

    tick();
  }

  // IntersectionObserver for scroll animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Optionally unobserve for performance
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  document.querySelectorAll('.observe').forEach(el => observer.observe(el));

  // Binary background (subtle matrix/rain style)
  const canvas = document.getElementById('binary-bg');
  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0, height = 0;
  let columns = 0;
  let drops = [];
  let lastTime = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / 16); // column width
    drops = Array.from({ length: columns }, () => Math.random() * height);
  }
  window.addEventListener('resize', resize);
  resize();

  function draw(ts) {
    const dt = ts - lastTime;
    lastTime = ts;

    // Semi-transparent clearing for trails
    ctx.fillStyle = 'rgba(6, 17, 11, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#21ff6a';
    ctx.font = '14px ' + (document.documentElement.style.getPropertyValue('--font-mono') || 'monospace');

    for (let i = 0; i < columns; i++) {
      const x = i * 16;
      const y = drops[i];
      const char = Math.random() > 0.5 ? '0' : '1';
      ctx.fillText(char, x, y);

      // Move down at a slow, slightly random rate
      const speed = 40 + (i % 7) * 6; // px/s
      drops[i] = y + (dt * speed) / 1000;

      // Reset drop randomly when it goes off screen
      if (drops[i] > height) {
        drops[i] = -Math.random() * 80;
      }
    }

    // Respect reduced motion
    if (!prefersReduced) {
      requestAnimationFrame(draw);
    }
  }
  requestAnimationFrame(draw);

  // Subtle per-card "alive" animation on hover via JS class toggles
  const cards = document.querySelectorAll('.lang-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('alive');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('alive');
    });
  });

})();