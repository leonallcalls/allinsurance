const head = document.querySelector('header'), tog = head.querySelector('button');
tog.onclick = () => tog.setAttribute('aria-expanded', head.toggleAttribute('data-open'));
head.querySelectorAll('nav a').forEach(a => a.onclick = () => head.removeAttribute('data-open'));
onscroll = () => head.toggleAttribute('data-stuck', scrollY > 8);
document.getElementById('y').textContent = new Date().getFullYear();

/* carriers carousel: pause on touch, resume after release */
const ct = document.querySelector('.all-carriers-track');
if (ct) {
  let moved = false;
  const onStart = (e) => { moved = false; if (e.touches || e.type === 'mousedown') ct.setAttribute('data-paused',''); };
  const onMove = () => { if (ct.hasAttribute('data-paused')) moved = true; };
  const onEnd = () => {
    if (moved) { setTimeout(() => ct.removeAttribute('data-paused'), 2000); }
    else { setTimeout(() => ct.removeAttribute('data-paused'), 800); }
  };
  ct.addEventListener('touchstart', onStart, { passive: true });
  ct.addEventListener('touchmove', onMove, { passive: true });
  ct.addEventListener('touchend', onEnd);
  ct.addEventListener('mousedown', onStart);
  ct.addEventListener('mouseup', onEnd);
  ct.addEventListener('touchcancel', () => ct.removeAttribute('data-paused'));
}

/* Lenis smooth scroll (self-hosted, vendor/lenis.min.js) */
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true });
  lenis.on('scroll', () => {
    const head = document.querySelector('header');
    if (head) head.toggleAttribute('data-stuck', lenis.scroll > 8);
  });
  lenis.on('scroll', (e) => document.dispatchEvent(new CustomEvent('lenis:scroll', { detail: e })));
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // smooth in-page anchor links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.hash.length > 1) {
      const t = document.querySelector(a.hash);
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
    }
  });
}
