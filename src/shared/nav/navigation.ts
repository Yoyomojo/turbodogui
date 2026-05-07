export function initializeNavigation(): void {
  updateActiveLink();
  initializeHamburger();

  const app = document.getElementById('app');
  if (app) {
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        updateActiveLink();
        initializeHamburger();
      }, 50);
    });

    observer.observe(app, {
      childList: true,
      subtree: true
    });

    const cleanup = () => {
      observer.disconnect();
      window.removeEventListener('beforeunload', cleanup);
    };

    window.addEventListener('beforeunload', cleanup);
  }
}

function initializeHamburger(): void {
  const hamburger = document.querySelector<HTMLButtonElement>('.nav-hamburger');
  const nav = document.querySelector<HTMLElement>('.app-nav');

  if (!hamburger || !nav || hamburger.dataset.initialized) return;

  hamburger.dataset.initialized = 'true';

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('ui-link') || target.closest('a')) {
      nav.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

function updateActiveLink(): void {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links ui-link');

  navLinks.forEach((link: Element) => {
    const href = link.getAttribute('href') || '/';
    const isActive = currentPath === href;

    if (isActive) {
      link.classList.add('nav-link-active');
      link.setAttribute('aria-current', 'page');
      (link as HTMLElement).style.color = '#FF8C00';
    } else {
      link.classList.remove('nav-link-active');
      link.removeAttribute('aria-current');
      (link as HTMLElement).style.color = 'inherit';
    }
  });
}
