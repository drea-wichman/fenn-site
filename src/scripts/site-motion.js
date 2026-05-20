import { animate, inView } from 'motion';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* === Fade-in for section headline groups ============================== */
function setupFadeIn() {
  const targets = document.querySelectorAll('[data-fade]');
  if (!targets.length) return;

  if (reduceMotion) {
    targets.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  // Set initial state inline so SSR'd content doesn't flash before JS runs.
  targets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.willChange = 'opacity, transform';
  });

  targets.forEach((el) => {
    inView(el, () => {
      animate(el, { opacity: 1, transform: 'translateY(0px)' }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
    }, { amount: 0.2, margin: '0px 0px -10% 0px' });
  });
}

/* === Number count-up stats ============================================ */
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

function formatNumber(n, raw) {
  // Preserve trailing "+" if present in target.
  const plus = /\+$/.test(raw) ? '+' : '';
  const value = Math.round(n);
  return value.toLocaleString('en-GB') + plus;
}

function startValue(el) {
  // Stats with data-stat-start (e.g. the "records on our servers" count-DOWN
  // stat) animate from that value to data-stat-target. Otherwise they
  // animate from 0 up to target.
  const raw = el.dataset.statStart;
  if (!raw) return 0;
  return parseInt(raw.replace(/[^\d-]/g, ''), 10) || 0;
}

function pulseOnce(el) {
  animate(
    el,
    { transform: ['scale(1)', 'scale(1.08)', 'scale(1)'] },
    { duration: 0.4, easing: 'ease-in-out' }
  );
}

function countUp(el) {
  const raw = el.dataset.statTarget || el.textContent || '0';
  const target = parseInt(raw.replace(/[^\d-]/g, ''), 10) || 0;
  const start = startValue(el);
  const duration = 2400;

  // Cancel any in-flight animation on this element before starting a new one.
  if (el._countRaf) cancelAnimationFrame(el._countRaf);

  // No animation needed if start equals target (e.g. static "0" with no start).
  if (start === target) {
    el.textContent = formatNumber(target, raw);
    return;
  }

  if (reduceMotion) {
    el.textContent = formatNumber(target, raw);
    return;
  }

  // Show start value immediately so there's no flash of stale state.
  el.textContent = formatNumber(start, raw);

  const t0 = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - t0) / duration);
    const eased = easeOutQuart(t);
    const current = start + (target - start) * eased;
    el.textContent = formatNumber(current, raw);
    if (t < 1) {
      el._countRaf = requestAnimationFrame(tick);
    } else {
      el._countRaf = null;
      // Single settle-pulse on count-DOWN stats once they land at 0.
      if (start > target && target === 0) pulseOnce(el);
    }
  }
  el._countRaf = requestAnimationFrame(tick);
}

function resetStat(el) {
  if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
  const raw = el.dataset.statTarget || '0';
  const target = parseInt(raw.replace(/[^\d-]/g, ''), 10) || 0;
  const start = startValue(el);
  // Count-down stats reset to their start value so the next entry re-plays
  // the count-down. Count-up stats reset to 0 (or to target if static).
  if (start !== target) {
    el.textContent = formatNumber(start, raw);
  } else {
    el.textContent = target === 0 ? formatNumber(0, raw) : '0';
  }
  // Reset transform too in case the settle-pulse left a residual.
  el.style.transform = '';
}

function setupStats() {
  const section = document.querySelector('[data-stats]');
  if (!section) return;
  const values = section.querySelectorAll('[data-stat-target]');
  if (!values.length) return;

  inView(section, () => {
    values.forEach((el) => countUp(el));
    // Cleanup runs when the section leaves the viewport; resetting lets the
    // count-up replay the next time the user scrolls back into view.
    return () => values.forEach((el) => resetStat(el));
  }, { amount: 0.35, margin: '0px' });
}

/* === Scroll-driven line draw between How-it-works steps =============== */
function setupStepLine() {
  const line = document.querySelector('[data-step-line] path');
  if (!line) return;

  // Initialize as fully hidden via dasharray. We'll set the actual length
  // once layout settles (after fonts load).
  function init() {
    const length = line.getTotalLength();
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = reduceMotion ? '0' : String(length);
  }
  init();

  if (reduceMotion) return;

  const section = document.querySelector('[data-step-line]');
  if (!section) return;

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // Map: section top reaches mid-viewport (progress 0) -> section bottom reaches mid-viewport (progress 1)
    const total = rect.height + vh * 0.5;
    const passed = Math.max(0, Math.min(total, vh - rect.top - vh * 0.25));
    const progress = total > 0 ? Math.min(1, Math.max(0, passed / total)) : 0;
    const length = line.getTotalLength();
    line.style.strokeDashoffset = String(length * (1 - progress));
  }

  // Recompute length after fonts settle (in case section grows).
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => { init(); update(); });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* === Boot ============================================================= */
function boot() {
  setupFadeIn();
  setupStats();
  setupStepLine();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
