const header = document.getElementById('header');
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const menuLinks = [...menu.querySelectorAll('a')];

document.getElementById('year').textContent = new Date().getFullYear();

// Bordure du header une fois la page défilée
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

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
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
