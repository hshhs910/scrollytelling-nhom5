(() => {
  const chapters = [...document.querySelectorAll('.chapter[data-chapter]')];
  const progressFill = document.getElementById('progress-fill');
  const currentNumber = document.getElementById('current-number');
  const tocToggle = document.getElementById('toc-toggle');
  const tocClose = document.getElementById('toc-close');
  const chapterNav = document.getElementById('chapter-nav');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js-ready');

  const setActiveChapter = (chapter) => {
    chapters.forEach((item) => item.classList.toggle('is-active', item === chapter));
    if (chapter && currentNumber) currentNumber.textContent = chapter.dataset.chapter;
  };

  const chapterObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length) setActiveChapter(visible[0].target);
  }, {
    rootMargin: '-24% 0px -48% 0px',
    threshold: [0, 0.12, 0.25, 0.4, 0.6]
  });

  chapters.forEach((chapter) => chapterObserver.observe(chapter));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

  const updateProgress = () => {
    if (!chapters.length || !progressFill) return;
    const first = chapters[0];
    const last = chapters[chapters.length - 1];
    const start = first.getBoundingClientRect().top + window.scrollY;
    const end = last.getBoundingClientRect().bottom + window.scrollY;
    const span = Math.max(1, end - start - window.innerHeight * 0.25);
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / span));
    progressFill.style.width = `${(progress * 100).toFixed(2)}%`;
  };

  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      scrollQueued = false;
    });
  };

  const closeNav = () => {
    chapterNav.hidden = true;
    tocToggle.setAttribute('aria-expanded', 'false');
    tocToggle.focus();
  };

  tocToggle?.addEventListener('click', () => {
    const willOpen = chapterNav.hidden;
    chapterNav.hidden = !willOpen;
    tocToggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) chapterNav.querySelector('a')?.focus();
  });

  tocClose?.addEventListener('click', closeNav);

  chapterNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      chapterNav.hidden = true;
      tocToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chapterNav && !chapterNav.hidden) closeNav();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  window.addEventListener('load', () => {
    updateProgress();
    const initial = chapters.find((chapter) => chapter.getBoundingClientRect().top >= 0) || chapters[0];
    if (initial) setActiveChapter(initial);
    if (reduceMotion) document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
  }, { once: true });

  updateProgress();
})();
