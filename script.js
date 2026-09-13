const navLinks = document.querySelectorAll('.nav-link');
const sections = [...document.querySelectorAll('main section[id]')];

const updateActiveNav = () => {
  const current = sections.reduce((active, section) => {
    if (window.scrollY + 140 >= section.offsetTop) return section.id;
    return active;
  }, 'work');

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((navLink) => navLink.classList.remove('is-active'));
    const matchingLink = [...navLinks].find((navLink) => navLink.getAttribute('href') === link.getAttribute('href'));
    matchingLink?.classList.add('is-active');
  });
});

const caseNav = document.querySelector('.case-nav');

if (caseNav) {
  document.querySelectorAll('.case-section[id] h2').forEach((heading) => {
    const link = document.createElement('a');
    link.href = `#${heading.id || heading.parentElement.id}`;
    link.textContent = heading.textContent;
    caseNav.append(link);
  });
}

const gallery = document.querySelector('[data-gallery]');

if (gallery) {
  const frame = gallery.querySelector('.gallery-frame');
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const status = gallery.querySelector('[data-gallery-status]');
  const toggle = gallery.querySelector('[data-gallery-toggle]');
  let currentIndex = 0;
  let isPaused = false;
  let isTransitioning = false;
  let startedAt = performance.now();
  const holdDuration = 2000;
  const duration = 8000;
  const fadeDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800;

  const showSlide = (index) => {
    if (isTransitioning) return;
    const nextIndex = (index + slides.length) % slides.length;
    isTransitioning = true;
    slides[currentIndex].classList.remove('is-active');
    window.setTimeout(() => {
      currentIndex = nextIndex;
      slides[currentIndex].querySelector('img').style.transform = 'translateY(0)';
      slides[currentIndex].classList.add('is-active');
      status.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      startedAt = performance.now();
      isTransitioning = false;
    }, fadeDuration);
  };

  const setPaused = (paused) => {
    isPaused = paused;
    toggle.textContent = isPaused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', isPaused ? 'Play gallery' : 'Pause gallery');
    if (!isPaused) startedAt = performance.now();
  };

  gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => showSlide(currentIndex - 1));
  gallery.querySelector('[data-gallery-next]').addEventListener('click', () => showSlide(currentIndex + 1));
  toggle.addEventListener('click', () => setPaused(!isPaused));
  gallery.addEventListener('mouseenter', () => setPaused(true));
  gallery.addEventListener('mouseleave', () => setPaused(false));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);

  const tick = (timestamp) => {
    if (!isPaused && !isTransitioning) {
      const slide = slides[currentIndex];
      const image = slide.querySelector('img');
      const distance = Math.max(0, image.getBoundingClientRect().height - frame.clientHeight);
      const elapsed = timestamp - startedAt - holdDuration;
      const progress = Math.min(1, Math.max(0, elapsed / duration));
      image.style.transform = `translateY(${-distance * progress}px)`;
      if (elapsed >= duration) showSlide(currentIndex + 1);
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
