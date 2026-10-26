/**
 * Klenzix — Main JavaScript
 * Pure vanilla JS, no dependencies.
 * ───────────────────────────────────────────
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ─── Constants ─────────────────────────── */
  const WHATSAPP_NUMBER = '919347596143';
  const SCROLL_THRESHOLD = 50;
  const TOAST_DURATION = 4000;
  const COUNTER_DURATION = 2000;
  const REVEAL_THRESHOLD = 0.15;

  /* ─── Cached DOM refs ──────────────────── */
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const headerNav = document.querySelector('.header__nav');
  const headerLogo = document.querySelector('.header__logo');
  const inquiryForm = document.getElementById('inquiry-form');
  const whatsappSubmit = document.getElementById('whatsapp-submit');

  /* ═══════════════════════════════════════════
     1. Mobile Navigation Toggle
     ═══════════════════════════════════════════ */

  /**
   * Toggle the mobile navigation menu open / closed.
   */
  const toggleNav = () => {
    headerNav?.classList.toggle('open');
    hamburger?.classList.toggle('active');
  };

  /**
   * Close the mobile navigation menu if it is open.
   */
  const closeNav = () => {
    headerNav?.classList.remove('open');
    hamburger?.classList.remove('active');
  };

  hamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNav();
  });

  /* Close when a nav link is clicked */
  headerNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  /* Close when clicking outside the nav */
  document.addEventListener('click', (e) => {
    if (
      headerNav?.classList.contains('open') &&
      !headerNav.contains(e.target) &&
      !hamburger?.contains(e.target)
    ) {
      closeNav();
    }
  });

  /* Close nav on resize above mobile breakpoint */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeNav();
  });

  /* ═══════════════════════════════════════════
     2. Sticky Header Enhancement
     ═══════════════════════════════════════════ */

  /**
   * Add / remove `.header--scrolled` depending on scroll position.
   */
  const handleHeaderScroll = () => {
    if (!header) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // run once on load

  /* ═══════════════════════════════════════════
     3. Smooth Scroll for Anchor Links
     ═══════════════════════════════════════════ */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      closeNav();
    });
  });

  /* ═══════════════════════════════════════════
     4. Scroll Reveal Animations
     ═══════════════════════════════════════════ */

  /**
   * Stagger `.reveal-child` elements inside a revealed parent.
   * @param {HTMLElement} parent - The revealed container element.
   */
  const staggerChildren = (parent) => {
    const children = parent.querySelectorAll('.reveal-child');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
      child.classList.add('active');
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          staggerChildren(entry.target);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: REVEAL_THRESHOLD }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  /* ═══════════════════════════════════════════
     5. Inquiry Form → WhatsApp + Email
     ═══════════════════════════════════════════ */

  /**
   * Read all inquiry-form fields and return a plain object.
   * @returns {{ name: string, phone: string, business_type: string, city: string, message: string }}
   */
  const buildFormData = () => {
    if (!inquiryForm) return {};
    return {
      name: (inquiryForm.querySelector('[name="name"]')?.value ?? '').trim(),
      phone: (inquiryForm.querySelector('[name="phone"]')?.value ?? '').trim(),
      business_type: (inquiryForm.querySelector('[name="business_type"]')?.value ?? '').trim(),
      city: (inquiryForm.querySelector('[name="city"]')?.value ?? '').trim(),
      message: (inquiryForm.querySelector('[name="message"]')?.value ?? '').trim(),
    };
  };

  /**
   * Build a nicely formatted WhatsApp message string.
   * @param {{ name: string, phone: string, business_type: string, city: string, message: string }} data
   * @returns {string}
   */
  const buildWhatsAppMessage = (data) => {
    return [
      '*New Inquiry - Klenzix*',
      '━━━━━━━━━━━━━━━━',
      `*Name:* ${data.name}`,
      `*Phone:* ${data.phone}`,
      `*Business Type:* ${data.business_type}`,
      `*City:* ${data.city}`,
      `*Message:* ${data.message}`,
      '━━━━━━━━━━━━━━━━',
      '_Sent from klenzix.com_',
    ].join('\n');
  };

  /**
   * Open a WhatsApp chat with a pre-filled message.
   * @param {string} message - The message body.
   */
  const openWhatsApp = (message) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  /* Regular form submit — validate, toast, then open WhatsApp as fallback */
  inquiryForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = buildFormData();
    const validation = validateForm(data);

    if (!validation.valid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    // TODO: future backend / email integration goes here.

    showToast('Your inquiry has been sent successfully!', 'success');

    const waMessage = buildWhatsAppMessage(data);
    openWhatsApp(waMessage);

    inquiryForm.reset();
  });

  /* WhatsApp button — validate then open WhatsApp directly */
  whatsappSubmit?.addEventListener('click', (e) => {
    e.preventDefault();

    const data = buildFormData();
    const validation = validateForm(data);

    if (!validation.valid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    const waMessage = buildWhatsAppMessage(data);
    openWhatsApp(waMessage);
  });

  /* ═══════════════════════════════════════════
     6. Click-to-Call & Click-to-WhatsApp
        (native — no JS override needed)
     ═══════════════════════════════════════════ */

  /* ═══════════════════════════════════════════
     7. Toast Notification System
     ═══════════════════════════════════════════ */

  /**
   * Show a temporary toast notification.
   * @param {string} message - The text to display.
   * @param {'success' | 'error'} type - Visual style of the toast.
   */
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    /* Inline styles — keeps this self-contained without extra CSS */
    Object.assign(toast.style, {
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      zIndex: '10000',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      lineHeight: '1.4',
      boxShadow: '0 8px 24px rgba(0,0,0,.18)',
      opacity: '0',
      transform: 'translateY(-12px)',
      transition: 'opacity .35s ease, transform .35s ease',
      background: type === 'success'
        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
        : 'linear-gradient(135deg, #ef4444, #dc2626)',
      maxWidth: '380px',
      wordBreak: 'break-word',
    });

    document.body.appendChild(toast);

    /* Trigger enter animation */
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    /* Auto-remove */
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      /* Fallback removal in case transitionend never fires */
      setTimeout(() => toast.remove(), 500);
    }, TOAST_DURATION);
  };

  /* ═══════════════════════════════════════════
     8. Form Validation
     ═══════════════════════════════════════════ */

  /**
   * Validate an Indian phone number (10 digits, optionally prefixed with +91 / 91 / 0).
   * @param {string} phone
   * @returns {boolean}
   */
  const isValidIndianPhone = (phone) => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^(?:\+?91|0)?[6-9]\d{9}$/.test(cleaned);
  };

  /**
   * Validate the inquiry form data.
   * @param {{ name: string, phone: string, business_type: string, city: string, message: string }} data
   * @returns {{ valid: boolean, errors: string[] }}
   */
  const validateForm = (data) => {
    const errors = [];

    if (!data.name) errors.push('Please enter your name.');
    if (!data.phone) {
      errors.push('Please enter your phone number.');
    } else if (!isValidIndianPhone(data.phone)) {
      errors.push('Please enter a valid Indian phone number.');
    }
    if (!data.business_type) errors.push('Please select your business type.');
    if (!data.city) errors.push('Please enter your city.');
    if (!data.message) errors.push('Please enter a message.');

    return { valid: errors.length === 0, errors };
  };

  /* ═══════════════════════════════════════════
     9. Scroll-to-Top on Logo Click
     ═══════════════════════════════════════════ */

  headerLogo?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ═══════════════════════════════════════════
     10. "Get Rates" Buttons → WhatsApp
     ═══════════════════════════════════════════ */

  document.querySelectorAll('.catalogue__card .btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const card = btn.closest('.catalogue__card');
      const heading = card?.querySelector('h3, h4, .catalogue__card-title');
      const productName = heading?.textContent?.trim() || 'your product';

      const message = `Hi, I'd like to get rates for ${productName}. Please share the latest pricing.`;
      openWhatsApp(message);
    });
  });

  /* ═══════════════════════════════════════════
     11. Counter Animation for Stats
     ═══════════════════════════════════════════ */

  /**
   * Animate a number from 0 to `target` inside the given element.
   * @param {HTMLElement} el - The element whose textContent will be updated.
   * @param {number} target - The final number to count up to.
   * @param {number} duration - Animation duration in milliseconds.
   * @param {string} suffix - Optional suffix to append (e.g. '+', 'hrs').
   */
  const animateCounter = (el, target, duration, suffix = '') => {
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubic for a satisfying deceleration */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  /**
   * Parse a stat element's text to extract the numeric target and any suffix.
   * Handles formats like "10,000+", "6+", "24hrs", "48hrs", etc.
   * @param {string} text
   * @returns {{ target: number, suffix: string }}
   */
  const parseStatValue = (text) => {
    const cleaned = text.replace(/,/g, '').trim();
    const match = cleaned.match(/^(\d+)(.*)/);
    if (!match) return { target: 0, suffix: '' };
    return {
      target: parseInt(match[1], 10),
      suffix: match[2] || '',
    };
  };

  /* Observe the stats section and trigger counters once */
  const statElements = document.querySelectorAll('.stat__number, .stats__number, [data-counter]');
  let statsAnimated = false;

  if (statElements.length) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;

            statElements.forEach((el) => {
              const { target, suffix } = parseStatValue(el.textContent);
              if (target > 0) {
                animateCounter(el, target, COUNTER_DURATION, suffix);
              }
            });

            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    /* Observe the closest section wrapper, or each element individually */
    const statsSection =
      statElements[0]?.closest('section') ?? statElements[0]?.parentElement;

    if (statsSection) {
      statsObserver.observe(statsSection);
    } else {
      statElements.forEach((el) => statsObserver.observe(el));
    }
  }

  /* ═══════════════════════════════════════════
     12. Active Section Highlighting
     ═══════════════════════════════════════════ */

  const sections = document.querySelectorAll('section[id]');

  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              /* Silently update the URL hash without scrolling */
              history.replaceState(null, '', `#${id}`);
            }

            /* Highlight matching nav link if present */
            headerNav?.querySelectorAll('a').forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }
});
