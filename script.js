const root = document.documentElement;
const header = document.getElementById('header');
const progress = document.getElementById('progress');
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const menuLinks = [...menu.querySelectorAll('a')];

document.getElementById('year').textContent = new Date().getFullYear();

// Thème clair / sombre
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = root.getAttribute('data-theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Bordure du header et barre de progression
const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
  const max = root.scrollHeight - window.innerHeight;
  progress.style.setProperty('--p', max > 0 ? window.scrollY / max : 0);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

// Menu mobile
const closeMenu = () => {
  menu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
};

burger.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});

menuLinks.forEach(link => link.addEventListener('click', closeMenu));

// Lien actif selon la section visible
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    menuLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

// Apparition des blocs au défilement
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Bandeau défilant : le contenu est doublé pour boucler sans coupure
const track = document.getElementById('marquee-track');
track.innerHTML += track.innerHTML;
track.classList.add('is-running');

// Halo lumineux qui suit la souris sur les cartes
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
}
