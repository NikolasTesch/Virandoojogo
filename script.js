/**
 * VIRANDO O JOGO — script.js
 * Vanilla JS modular e limpo
 * Módulos: Nav | ScrollSpy | FadeIn | FAQ | Hamburger
 */

'use strict';

/* ==================================================
   UTILITÁRIO: Seletor seguro
   ================================================== */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];


/* ==================================================
   MÓDULO: Header scroll (sticky shadow)
   ================================================== */
const initHeaderScroll = () => {
  const header = $('.site-header');
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        if (currentY > 60) {
          header.style.background = 'rgba(18, 18, 18, 0.97)';
          header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5)';
        } else {
          header.style.background = 'rgba(18, 18, 18, 0.85)';
          header.style.boxShadow = 'none';
        }

        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
};


/* ==================================================
   MÓDULO: Smooth scroll para links internos
   ================================================== */
const initSmoothScroll = () => {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = $(targetId);
    if (!target) return;

    e.preventDefault();

    // Fecha menu mobile se estiver aberto
    closeMobileMenu();

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // Mantém acessibilidade: move o foco para a seção
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
};


/* ==================================================
   MÓDULO: Fade-in com Intersection Observer
   ================================================== */
const initFadeIn = () => {
  const elements = $$('.fade-in');
  if (!elements.length) return;

  // Respeita a preferência de movimento reduzido
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger por posição no DOM dentro do pai
          const siblings = $$('.fade-in', entry.target.parentElement);
          const index = siblings.indexOf(entry.target);
          const delay = Math.min(index * 80, 400); // máx 400ms de delay

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    }
  );

  elements.forEach(el => observer.observe(el));
};


/* ==================================================
   MÓDULO: Menu mobile (hamburguer)
   ================================================== */
let mobileMenuOpen = false;

const closeMobileMenu = () => {
  const btn = $('.hamburger');
  const menu = $('.mobile-menu');
  if (!btn || !menu) return;

  btn.classList.remove('active');
  btn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('hidden', '');
  document.body.style.overflow = '';
  mobileMenuOpen = false;
};

const openMobileMenu = () => {
  const btn = $('.hamburger');
  const menu = $('.mobile-menu');
  if (!btn || !menu) return;

  btn.classList.add('active');
  btn.setAttribute('aria-expanded', 'true');
  menu.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  mobileMenuOpen = true;

  // Move foco para o menu
  const firstLink = $('a, button', menu);
  if (firstLink) firstLink.focus();
};

const initHamburger = () => {
  const btn = $('.hamburger');
  if (!btn) return;

  btn.addEventListener('click', () => {
    mobileMenuOpen ? closeMobileMenu() : openMobileMenu();
  });

  // Fecha com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
      $('.hamburger')?.focus();
    }
  });

  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!mobileMenuOpen) return;
    const menu = $('.mobile-menu');
    const hamburger = $('.hamburger');
    if (menu && hamburger && !menu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });
};


/* ==================================================
   MÓDULO: FAQ accordion
   ================================================== */
const initFAQ = () => {
  const questions = $$('.faq-question');
  if (!questions.length) return;

  questions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = $(`#${answerId}`);
      if (!answer) return;

      // Fecha todos os outros
      questions.forEach((other) => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherAnswerId = other.getAttribute('aria-controls');
          const otherAnswer = $(`#${otherAnswerId}`);
          if (otherAnswer) {
            otherAnswer.setAttribute('hidden', '');
          }
        }
      });

      // Toggle o atual
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        answer.setAttribute('hidden', '');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');

        // Scroll suave para o item se estiver fora da view
        requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          if (rect.top < 0 || rect.top > window.innerHeight * 0.7) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }
    });

    // Suporte a teclado: Enter e Space
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
};


/* ==================================================
   MÓDULO: Active nav link (ScrollSpy)
   ================================================== */
const initScrollSpy = () => {
  const sections = $$('section[id], main[id]');
  const navLinks = $$('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.removeAttribute('aria-current');
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
              link.setAttribute('aria-current', 'true');
              link.style.color = 'var(--clr-accent)';
            }
          });
        }
      });
    },
    {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
};


/* ==================================================
   MÓDULO: Botões CTA — ripple effect
   ================================================== */
const initRipple = () => {
  const buttons = $$('.btn-primary');

  buttons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      // Cria o elemento de ripple
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      Object.assign(ripple.style, {
        position: 'absolute',
        borderRadius: '50%',
        width:  `${size}px`,
        height: `${size}px`,
        left:   `${x}px`,
        top:    `${y}px`,
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'scale(0)',
        animation: 'ripple-anim 500ms ease-out forwards',
        pointerEvents: 'none',
      });

      // Garante que o botão tem position relative
      const prevPosition = getComputedStyle(this).position;
      if (prevPosition === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 520);
    });
  });

  // Inject keyframe via JS (evita poluir o CSS)
  if (!$('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-anim {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
};


/* ==================================================
   MÓDULO: Validação de links externos
   Garante que todos os links externos abrem em nova aba
   ================================================== */
const initExternalLinks = () => {
  $$('a[href^="https://"], a[href^="http://"]').forEach((link) => {
    if (!link.hostname || link.hostname === window.location.hostname) return;

    if (!link.getAttribute('target')) {
      link.setAttribute('target', '_blank');
    }
    if (!link.getAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
};


/* ==================================================
   MÓDULO: Lazy loading de imagens (caso existam <img>)
   ================================================== */
const initLazyImages = () => {
  const images = $$('img[data-src]');
  if (!images.length) return;

  if ('loading' in HTMLImageElement.prototype) {
    // Suporte nativo
    images.forEach(img => {
      img.src = img.dataset.src;
      img.setAttribute('loading', 'lazy');
    });
    return;
  }

  // Fallback: Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
};


/* ==================================================
   MÓDULO: Contador de estatísticas animado
   ================================================== */
const animateCounter = (element, target, duration = 1200) => {
  const startTime = performance.now();
  const isDecimal = String(target).includes('.');

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Easing: easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const value = eased * target;

    element.textContent = isDecimal
      ? value.toFixed(1)
      : Math.floor(value).toString();

    if (progress < 1) requestAnimationFrame(step);
    else element.textContent = target.toString();
  };

  requestAnimationFrame(step);
};

const initCounters = () => {
  // Para esta página, os stat numbers são texto, não números puros.
  // Mantemos a função disponível para extensões futuras.
};


/* ==================================================
   INICIALIZAÇÃO — DOMContentLoaded
   ================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initSmoothScroll();
  initFadeIn();
  initHamburger();
  initFAQ();
  initScrollSpy();
  initRipple();
  initExternalLinks();
  initLazyImages();
  initCounters();

  // Log de inicialização (remova em produção)
  console.log('%cVIRANDO O JOGO 🏆', 'color:#cf0c0c;font-size:18px;font-weight:bold;');
  console.log('%cProjeto Esportivo · Teixeira de Freitas, BA', 'color:#a8a8a8;');
});