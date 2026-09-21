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
