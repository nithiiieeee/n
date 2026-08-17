document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('slider');
  const slides = document.querySelectorAll('.slide-frame');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slideCounter = document.getElementById('slideCounter');
  const navButtons = document.querySelectorAll('[data-slide]');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const headerNav = document.getElementById('headerNav');

  let currentIndex = 0;
  const totalSlides = slides.length;
  let isAnimating = false;
  const ANIMATION_LOCKOUT = 850;

  function isMobile() {
    return window.innerWidth <= 900;
  }

  // Disable right-click context menu globally
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  function triggerSpin(img) {
    img.classList.remove('is-spinning');
    void img.offsetWidth;
    img.classList.add('is-spinning');
  }

  // =======================================================
  // EASTER EGG: STAR SPARKLE TOGGLE INFINITE SPIN ON/OFF
  // =======================================================
  const heroSparkle = document.querySelector('.hero-sparkle');
  const allImages = document.querySelectorAll('.slide-canvas img');
  let isEasterEggActive = false;

  if (heroSparkle) {
    heroSparkle.addEventListener('click', (e) => {
      e.stopPropagation();
      isEasterEggActive = !isEasterEggActive;

      heroSparkle.classList.toggle('easter-egg-active', isEasterEggActive);

      allImages.forEach((img, index) => {
        if (isEasterEggActive) {
          // Staggered trigger to start continuous spin across all images
          setTimeout(() => {
            img.classList.remove('is-spinning');
            img.classList.add('is-holding');
          }, (index % 4) * 120);
        } else {
          // Stop continuous spin and return to normal
          img.classList.remove('is-holding');
        }
      });
    });
  }

  // =======================================================
  // SLIDE 1: ALL-3 STAGGERED HOLD & CLICK SPIN WAVE
  // =======================================================
  const heroStack = document.querySelector('.hero-photo-stack');
  if (heroStack) {
    const heroCards = [
      heroStack.querySelector('.card-1 img'),
      heroStack.querySelector('.card-2 img'),
      heroStack.querySelector('.card-3 img')
    ].filter(Boolean);

    let heroHoldTimeouts = [];
    let isHeroHolding = false;

    const startHeroHold = (e) => {
      if (isEasterEggActive) return;
      if (e.type === 'mousedown' && e.button !== 0) return;

      heroHoldTimeouts.forEach(t => clearTimeout(t));
      heroHoldTimeouts = [];

      heroCards.forEach((cardImg, index) => {
        const t = setTimeout(() => {
          isHeroHolding = true;
          cardImg.classList.remove('is-spinning');
          cardImg.classList.add('is-holding');
        }, 150 + index * 180);
        heroHoldTimeouts.push(t);
      });
    };

    const stopHeroHold = () => {
      if (isEasterEggActive) return;
      heroHoldTimeouts.forEach(t => clearTimeout(t));
      heroHoldTimeouts = [];
      if (isHeroHolding) {
        isHeroHolding = false;
        heroCards.forEach(cardImg => cardImg.classList.remove('is-holding'));
      }
    };

    heroCards.forEach(img => {
      img.addEventListener('mousedown', startHeroHold);
      img.addEventListener('touchstart', startHeroHold, { passive: true });

      img.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isHeroHolding || isEasterEggActive) return;

        heroCards.forEach((cardImg, index) => {
          setTimeout(() => {
            triggerSpin(cardImg);
          }, index * 150);
        });
      });

      img.addEventListener('animationend', (e) => {
        if (e.animationName === 'fullSpin') {
          img.classList.remove('is-spinning');
        }
      });
    });

    window.addEventListener('mouseup', stopHeroHold);
    window.addEventListener('touchend', stopHeroHold, { passive: true });
    heroStack.addEventListener('mouseleave', stopHeroHold);
  }

  // =======================================================
  // OTHER SLIDES: INDIVIDUAL HOLD & CLICK SPIN
  // =======================================================
  const otherImages = document.querySelectorAll('.slide-frame:not(#slide-0) .slide-canvas img');
  otherImages.forEach(img => {
    let holdTimeout;
    let isHoldActive = false;

    const startHold = (e) => {
      if (isEasterEggActive) return;
      if (e.type === 'mousedown' && e.button !== 0) return;
      holdTimeout = setTimeout(() => {
        isHoldActive = true;
        img.classList.remove('is-spinning');
        img.classList.add('is-holding');
      }, 150);
    };

    const stopHold = () => {
      if (isEasterEggActive) return;
      clearTimeout(holdTimeout);
      if (isHoldActive) {
        isHoldActive = false;
        img.classList.remove('is-holding');
      }
    };

    img.addEventListener('mousedown', startHold);
    img.addEventListener('touchstart', startHold, { passive: true });

    window.addEventListener('mouseup', stopHold);
    window.addEventListener('touchend', stopHold, { passive: true });
    img.addEventListener('mouseleave', stopHold);

    img.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isHoldActive || isEasterEggActive) return;
      triggerSpin(img);
    });

    img.addEventListener('animationend', (e) => {
      if (e.animationName === 'fullSpin') {
        img.classList.remove('is-spinning');
      }
    });
  });

  // =======================================================
  // NAVIGATION & SLIDER ENGINE
  // =======================================================
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      headerNav.classList.toggle('active');
    });
  }

  function updateCounter(index) {
    const padded = String(index + 1).padStart(2, '0');
    const totalPadded = String(totalSlides).padStart(2, '0');
    if (slideCounter) {
      slideCounter.textContent = `${padded} / ${totalPadded}`;
    }
  }

  function goToSlide(index, allowLoop = false) {
    if (isAnimating) return;

    let targetIndex = index;

    if (allowLoop) {
      if (targetIndex < 0) {
        targetIndex = totalSlides - 1;
      } else if (targetIndex >= totalSlides) {
        targetIndex = 0;
      }
    } else {
      if (targetIndex < 0 || targetIndex >= totalSlides) return;
    }

    if (isMobile()) {
      currentIndex = targetIndex;
      slides[currentIndex].scrollIntoView({ behavior: 'smooth' });
      updateCounter(currentIndex);
      if (headerNav && headerNav.classList.contains('active')) {
        headerNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      }
      return;
    }

    isAnimating = true;
    currentIndex = targetIndex;

    slider.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
    const offset = (currentIndex / totalSlides) * 100;
    slider.style.transform = `translate3d(-${offset}%, 0, 0)`;

    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    updateCounter(currentIndex);

    setTimeout(() => {
      isAnimating = false;
    }, ANIMATION_LOCKOUT);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1, true));
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1, true));
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(btn.getAttribute('data-slide'), 10);
      goToSlide(targetIndex, false);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (isMobile() || isAnimating) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goToSlide(currentIndex + 1, true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(currentIndex - 1, true);
    }
  });

  let wheelDeltaSum = 0;
  const WHEEL_THRESHOLD = 35;

  window.addEventListener('wheel', (e) => {
    if (isMobile() || isAnimating) return;
    e.preventDefault();

    let delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    wheelDeltaSum += delta;

    if (wheelDeltaSum > WHEEL_THRESHOLD) {
      wheelDeltaSum = 0;
      if (currentIndex < totalSlides - 1) {
        goToSlide(currentIndex + 1, false);
      }
    } else if (wheelDeltaSum < -WHEEL_THRESHOLD) {
      wheelDeltaSum = 0;
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1, false);
      }
    }
  }, { passive: false });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-active');
        const idx = Array.from(slides).indexOf(entry.target);
        if (idx !== -1) {
          currentIndex = idx;
          updateCounter(currentIndex);
        }
      }
    });
  }, { threshold: 0.25 });

  slides.forEach(slide => observer.observe(slide));

  window.addEventListener('mousemove', (e) => {
    if (isMobile()) return;
    const activeSlide = slides[currentIndex];
    if (!activeSlide) return;

    const xFactor = (e.clientX / window.innerWidth - 0.5) * 8;
    const yFactor = (e.clientY / window.innerHeight - 0.5) * 8;

    const activeCanvas = activeSlide.querySelector('.slide-canvas');
    if (activeCanvas) {
      activeCanvas.style.transform = `translate3d(${xFactor}px, ${yFactor}px, 0)`;
      activeCanvas.style.transition = 'transform 0.15s ease-out';
    }
  });

  window.addEventListener('resize', () => {
    if (isMobile()) {
      slider.style.transform = 'none';
    } else {
      goToSlide(currentIndex, false);
    }
  });
});