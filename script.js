(() => {
  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  const total = slides.length;
  let current = 0;
  let animating = false;

  const progressBar = document.getElementById('progressBar');
  const slideNum = document.getElementById('slideNum');
  const slideTotal = document.getElementById('slideTotal');
  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const hint = document.getElementById('hint');

  slideTotal.textContent = String(total).padStart(2, '0');

  // Build dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'dot-nav' + (i === 0 ? ' active' : '');
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function update() {
    slideNum.textContent = String(current + 1).padStart(2, '0');
    progressBar.style.width = `${((current + 1) / total) * 100}%`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    prevBtn.style.opacity = current === 0 ? 0.35 : 1;
    nextBtn.style.opacity = current === total - 1 ? 0.35 : 1;
  }

  function goTo(index, dir = null) {
    if (index < 0 || index >= total || index === current || animating) return;
    animating = true;
    const from = slides[current];
    const to = slides[index];
    from.classList.add('is-leaving');
    from.classList.remove('is-active');
    to.classList.add('is-active');
    setTimeout(() => {
      from.classList.remove('is-leaving');
      animating = false;
    }, 650);
    current = index;
    update();
    hideHint();
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home': goTo(0); break;
      case 'End': goTo(total - 1); break;
      case 'f': case 'F':
        toggleFullscreen(); break;
    }
  });

  // Wheel / trackpad navigation (debounced)
  let wheelLock = false;
  window.addEventListener('wheel', (e) => {
    if (wheelLock || Math.abs(e.deltaY) < 28) return;
    wheelLock = true;
    if (e.deltaY > 0) next(); else prev();
    setTimeout(() => (wheelLock = false), 800);
  }, { passive: true });

  // Touch swipe
  let touchX = 0, touchY = 0;
  window.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  let hintTimer = setTimeout(hideHint, 6000);
  function hideHint() {
    hint.classList.add('hide');
    clearTimeout(hintTimer);
  }

  update();
})();
