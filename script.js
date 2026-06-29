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


/* ---------- 4. HERO CUBE — IDLE SPIN vs HOVER CONTROL ---------- */
// Two distinct modes:
//   - Not hovering the cube: it spins on its own at a constant pace,
//     and any tilt eases back to a neutral resting angle.
//   - Hovering the cube: auto-spin PAUSES, and tilt is driven directly
//     by where the pointer is over the cube itself.
const cube = document.getElementById('cube');
const cubeStage = document.getElementById('cubeStage');

let isHovering = false;

let autoRotation = 35;     // base Y rotation, only climbs while idle
const autoSpeed = 0.38;    // degrees added per frame while idle

let targetTiltX = -20;     // neutral resting tilt
let targetTiltY = 0;
let currentTiltX = -20;    // eased/rendered tilt
let currentTiltY = 0;
const ease = 0.15;

cubeStage.addEventListener('mouseenter', () => { isHovering = true; });
cubeStage.addEventListener('mouseleave', () => { isHovering = false; });

cubeStage.addEventListener('mousemove', (e) => {
  if (!isHovering) return;
  // position of the pointer relative to the cube stage itself, not the whole window
  const rect = cubeStage.getBoundingClientRect();
  const xPercent = ((e.clientX - rect.left) / rect.width) - 0.5;   // -0.5 .. 0.5
  const yPercent = ((e.clientY - rect.top) / rect.height) - 0.5;   // -0.5 .. 0.5

  targetTiltY = xPercent * 80;          // direct left/right control
  targetTiltX = -20 - yPercent * 70;    // direct up/down control
});

function animateCube() {
  if (isHovering) {
    // hovering: auto-spin is frozen, tilt is fully pointer-driven (eased target above)
  } else {
    // idle: keep spinning forever at a constant pace, tilt relaxes back to neutral
    autoRotation += autoSpeed;
    targetTiltX = -20;
    targetTiltY = 0;
  }

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