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

// Langue français / anglais : le français est lu dans la page, l'anglais vient de i18n.js
const langToggle = document.getElementById('lang-toggle');
const metaDescription = document.querySelector('meta[name="description"]');
const textNodes = [...document.querySelectorAll('[data-i18n]')];
const attrNodes = [...document.querySelectorAll('[data-i18n-attr]')].map(el => {
  const [attr, key] = el.dataset.i18nAttr.split(':');
  return { el, attr, key, fr: el.getAttribute(attr) };
});
const frenchText = new Map(textNodes.map(el => [el, el.innerHTML]));
const frenchMeta = { title: document.title, description: metaDescription.content };
// Chaque page a son titre et sa description en anglais : clés meta.* par défaut, ou celles indiquées sur <body>
const metaKey = document.body.dataset.i18nMeta || 'meta';

const setLang = lang => {
  const en = lang === 'en';
  root.lang = lang;
  textNodes.forEach(el => {
    el.innerHTML = (en && english[el.dataset.i18n]) || frenchText.get(el);
  });
  attrNodes.forEach(({ el, attr, key, fr }) => {
    el.setAttribute(attr, (en && english[key]) || fr);
  });
  document.title = en ? english[`${metaKey}.title`] : frenchMeta.title;
  metaDescription.content = en ? english[`${metaKey}.description`] : frenchMeta.description;

  // Le bouton affiche la langue vers laquelle il permet de passer
  langToggle.textContent = en ? 'FR' : 'EN';
  langToggle.lang = en ? 'fr' : 'en';
  langToggle.setAttribute('aria-label', en ? 'Passer en français' : 'Switch to English');
};

setLang(root.lang === 'en' ? 'en' : 'fr');

langToggle.addEventListener('click', () => {
  const next = root.lang === 'en' ? 'fr' : 'en';
  setLang(next);
  try { localStorage.setItem('lang', next); } catch (e) {}

  // L'adresse reflète la langue choisie, pour pouvoir partager le lien en anglais
  const url = new URL(location.href);
  if (next === 'en') url.searchParams.set('lang', 'en');
  else url.searchParams.delete('lang');
  history.replaceState(null, '', url);
});

// Email : l'adresse est assemblée ici pour la cacher aux robots qui lisent le HTML
// (seulement sur la page d'accueil, la seule à avoir le bloc Contact)
const mailBox = document.querySelector('[data-mail-user]');
const copyButton = document.getElementById('copy-email');

if (mailBox && copyButton) {
  const email = `${mailBox.dataset.mailUser}@${mailBox.dataset.mailDomain}`;
  document.querySelectorAll('[data-email]').forEach(link => { link.href = `mailto:${email}`; });
  document.querySelectorAll('[data-email-text]').forEach(link => { link.textContent = email; });

  const copyStatus = document.getElementById('copy-status');
  let copyTimer = null;

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {}
    // Ancienne méthode, pour les navigateurs qui refusent l'accès au presse-papiers
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (e) {}
    area.remove();
    return copied;
  };

  copyButton.addEventListener('click', async () => {
    if (!(await copyText(email))) {
      // La copie est impossible : on sélectionne l'adresse pour que le visiteur la copie lui-même
      getSelection().selectAllChildren(document.querySelector('[data-email-text]'));
      return;
    }
    copyButton.classList.add('is-copied');
    copyStatus.textContent = root.lang === 'en' ? 'Email address copied' : 'Adresse email copiée';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyButton.classList.remove('is-copied');
      copyStatus.textContent = '';
    }, 2000);
  });
}

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
      const current = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('is-active', current);
      // Les lecteurs d'écran annoncent aussi la section en cours
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
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

// Méthode : l'étape active illumine la partie du dessin qui lui correspond
const method = document.getElementById('method');

if (method) {
  const art = document.getElementById('method-art');
  const steps = [...method.querySelectorAll('.step')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stepIndex = 0;
  let stepTimer = null;
  let userChoseStep = false;

  const showStep = index => {
    stepIndex = index;
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === index);
      const button = step.querySelector('.step-btn');
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    art.dataset.active = String(index + 1);
  };

  const stopSteps = () => {
    clearInterval(stepTimer);
    stepTimer = null;
    method.classList.remove('is-auto');
  };

  const startSteps = () => {
    if (reduceMotion || userChoseStep || stepTimer) return;
    method.classList.add('is-auto');
    stepTimer = setInterval(() => showStep((stepIndex + 1) % steps.length), 4000);
  };

  steps.forEach((step, i) => {
    step.querySelector('.step-btn').addEventListener('click', () => {
      userChoseStep = true;
      stopSteps();
      showStep(i);
    });
  });

  new IntersectionObserver(entries => {
    entries.forEach(entry => (entry.isIntersecting ? startSteps() : stopSteps()));
  }, { threshold: 0.25 }).observe(method);

  if (reduceMotion) art.querySelector('svg').pauseAnimations();
}
