/* ===================================================
   TECHFEST — interactions
   Everything here is vanilla JS: scroll listeners,
   IntersectionObserver, and basic DOM events.
   No external libraries.
=================================================== */

/* ---------- 1. SCROLL PROGRESS BAR ---------- */
// Tracks how far down the page we are and fills the top bar accordingly.
const progressBar = document.getElementById('scrollProgress');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (scrollTop / docHeight) * 100;
  progressBar.style.width = percent + '%';
}

window.addEventListener('scroll', updateScrollProgress);
updateScrollProgress(); // run once on load too


/* ---------- 2. CARD ENTRANCE ANIMATION ON SCROLL ---------- */
// IntersectionObserver watches each card. When it scrolls into the viewport,
// we add the "in-view" class, which is what actually triggers the CSS
// rotateX/translateY transition defined in style.css.
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // small stagger delay so cards don't all snap in at once
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, index * 90);
      cardObserver.unobserve(entry.target); // only need to trigger this once
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.flip-card').forEach(card => {
  cardObserver.observe(card);
});


/* ---------- 3. CLICK-TO-FLIP CARDS ---------- */
// Each card toggles its own "flipped" class on click.
// CSS handles the actual 3D rotateY(180deg) flip.
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});


/* ---------- 4. HERO CUBE — ALWAYS SPINNING + MOUSE TILT ---------- */
// The cube has two motions happening at once:
//   1. A constant auto-rotation on the Y axis that NEVER stops, frame after frame.
//   2. A smoothed tilt offset that follows wherever the mouse currently is.
// Both are combined into one transform every animation frame.
const cube = document.getElementById('cube');

let autoRotation = 35;     // current base Y rotation, keeps climbing forever
const autoSpeed = 0.18;    // degrees added per frame -> controls spin speed

let targetTiltX = -20;     // where the mouse WANTS the tilt to be
let targetTiltY = 0;
let currentTiltX = -20;    // the tilt we actually render (eased toward target)
let currentTiltY = 0;
const ease = 0.06;         // lower = smoother/slower follow, higher = snappier

// Track mouse position across the whole window so the cube reacts
// even when the cursor isn't directly over it.
window.addEventListener('mousemove', (e) => {
  const xPercent = (e.clientX / window.innerWidth) - 0.5;   // -0.5 .. 0.5
  const yPercent = (e.clientY / window.innerHeight) - 0.5;  // -0.5 .. 0.5

  targetTiltY = xPercent * 50;   // left/right mouse movement -> extra Y rotation
  targetTiltX = -20 - yPercent * 40; // up/down mouse movement -> X tilt, offset from base -20deg
});

function animateCube() {
  // continuous spin, frame after frame, regardless of the mouse
  autoRotation += autoSpeed;

  // ease the rendered tilt toward wherever the mouse currently targets it
  currentTiltX += (targetTiltX - currentTiltX) * ease;
  currentTiltY += (targetTiltY - currentTiltY) * ease;

  cube.style.transform = `rotateX(${currentTiltX}deg) rotateY(${autoRotation + currentTiltY}deg)`;

  requestAnimationFrame(animateCube);
}
requestAnimationFrame(animateCube);


/* ---------- 5. STAT COUNTERS ---------- */
// Each .stat element has a data-count attribute with its target number.
// When it scrolls into view, we animate the number from 0 up to that target.
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
  statObserver.observe(stat);
});

function animateCount(statEl) {
  const target = parseInt(statEl.dataset.count, 10);
  const numberEl = statEl.querySelector('.stat-num');
  const duration = 1200; // ms
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(progress * target);
    numberEl.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}