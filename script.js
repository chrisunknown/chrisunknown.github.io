(function () {
  'use strict';

  var JUMP_LOCK_MS = 650;
  var WHEEL_THRESHOLD = 4;

  // Walks clockwise around the edges: bottom-left -> bottom-center ->
  // bottom-right -> right -> top-right -> top-center -> top-left -> left.
  var GLOW_POSITIONS = [
    { left: '15%', top: '100%' },
    { left: '50%', top: '100%' },
    { left: '85%', top: '100%' },
    { left: '100%', top: '50%' },
    { left: '85%', top: '0%' },
    { left: '50%', top: '0%' },
    { left: '15%', top: '0%' },
    { left: '0%', top: '50%' },
  ];

  var track = document.getElementById('track');
  var glow = document.getElementById('glow');
  var dockButtons = Array.prototype.slice.call(document.querySelectorAll('.dock-icon'));
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));

  var activeIndex = 0;
  var isJumping = false;
  var unlockTimeout = null;

  function setActiveIndex(index) {
    var clamped = Math.min(slides.length - 1, Math.max(0, index));
    activeIndex = clamped;

    dockButtons.forEach(function (btn, i) {
      btn.classList.toggle('active', i === clamped);
    });

    var pos = GLOW_POSITIONS[clamped % GLOW_POSITIONS.length];
    glow.style.left = pos.left;
    glow.style.top = pos.top;

    var reveal = slides[clamped].querySelector('.reveal');
    if (reveal) {
      reveal.classList.remove('reveal-play');
      // Force reflow so the animation restarts even if the class never left the DOM.
      void reveal.offsetWidth;
      reveal.classList.add('reveal-play');
    }

    return clamped;
  }

  function scrollToIndex(index) {
    var clamped = setActiveIndex(index);
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
  }

  track.addEventListener(
    'wheel',
    function (e) {
      e.preventDefault();
      if (isJumping) return;

      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < WHEEL_THRESHOLD) return;

      var next = activeIndex + (delta > 0 ? 1 : -1);
      if (next < 0 || next > slides.length - 1) return;

      isJumping = true;
      scrollToIndex(next);

      clearTimeout(unlockTimeout);
      unlockTimeout = setTimeout(function () {
        isJumping = false;
      }, JUMP_LOCK_MS);
    },
    { passive: false }
  );

  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') scrollToIndex(activeIndex + 1);
    if (e.key === 'ArrowLeft') scrollToIndex(activeIndex - 1);
  });

  dockButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      scrollToIndex(parseInt(btn.dataset.index, 10));
    });
  });

  window.addEventListener('resize', function () {
    track.scrollTo({ left: activeIndex * track.clientWidth, behavior: 'auto' });
  });

  // Reveal the first (intro) section immediately on load.
  setActiveIndex(0);

  // ---- timeline card expand/collapse (Section 03) ----
  var timelineCards = Array.prototype.slice.call(document.querySelectorAll('.timeline-card'));
  timelineCards.forEach(function (card) {
    card.addEventListener('click', function () {
      timelineCards.forEach(function (c) {
        c.classList.toggle('active', c === card);
      });
    });
  });
})();
