(function () {
  'use strict';

  /* ---------------------------------------------------------------------
   * Mobile navigation toggle
   * ------------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
      mobileNav.hidden = isOpen;
      mobileNav.classList.toggle('is-open', !isOpen);
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Открыть меню');
        mobileNav.hidden = true;
        mobileNav.classList.remove('is-open');
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Sticky header shadow on scroll
   * ------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = '0 8px 24px -16px rgba(0,0,0,0.6)';
      } else {
        header.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
   * Booking form -> WhatsApp deep link
   * ------------------------------------------------------------------- */
  var WHATSAPP_NUMBER = '79160610354';

  var form = document.getElementById('bookingForm');
  var formNote = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = form.elements['name'].value.trim();
      var phone = form.elements['phone'].value.trim();
      var service = form.elements['service'].value;
      var car = form.elements['car'].value.trim();
      var comment = form.elements['comment'].value.trim();

      var missing = [];
      if (!name) missing.push(form.elements['name']);
      if (!phone) missing.push(form.elements['phone']);

      if (missing.length) {
        missing[0].focus();
        if (formNote) {
          formNote.textContent = 'Пожалуйста, укажите имя и телефон — это нужно, чтобы мы могли с вами связаться.';
          formNote.classList.add('is-error');
        }
        return;
      }

      var lines = [
        'Здравствуйте! Хочу записаться в «Мистер Детейлинг».',
        'Имя: ' + name,
        'Телефон: ' + phone,
        'Услуга: ' + service
      ];
      if (car) lines.push('Автомобиль: ' + car);
      if (comment) lines.push('Комментарий: ' + comment);

      var message = lines.join('\n');
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

      window.open(url, '_blank', 'noopener,noreferrer');

      if (formNote) {
        formNote.textContent = 'Заявка сформирована — в открывшейся вкладке WhatsApp нажмите «отправить».';
        formNote.classList.remove('is-error');
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Reduced motion: single source of truth for the two JS-driven effects
   * below (CSS animations already fall back via the global
   * prefers-reduced-motion rule in styles.css). Checked once at load —
   * good enough to fully skip attaching any listeners/transforms.
   * ------------------------------------------------------------------- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
   * 3D tilt on service/price cards — perspective + rotateX/rotateY driven
   * by pointer position, plus a metallic/lacquer sheen (radial highlight)
   * and a directional shadow that both track the tilt direction.
   * ------------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var tiltCards = document.querySelectorAll('.price-card');
    var MAX_TILT_DEG = 7;

    tiltCards.forEach(function (card) {
      var rafId = null;

      function applyTilt(clientX, clientY) {
        var rect = card.getBoundingClientRect();
        var px = (clientX - rect.left) / rect.width;   // 0..1 across card
        var py = (clientY - rect.top) / rect.height;   // 0..1 down card
        px = Math.min(Math.max(px, 0), 1);
        py = Math.min(Math.max(py, 0), 1);

        var rotateY = (px - 0.5) * (MAX_TILT_DEG * 2);   // left/right tilt
        var rotateX = (0.5 - py) * (MAX_TILT_DEG * 2);   // up/down tilt

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          card.style.setProperty('--icon-angle', (135 + rotateY * 4).toFixed(1) + 'deg');
          card.style.transform =
            'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateZ(2px)';
          card.style.boxShadow =
            (-rotateY * 2.2).toFixed(1) + 'px ' + (rotateX * 2.2).toFixed(1) + 'px 34px -14px rgba(0,0,0,0.55), ' +
            (rotateY * 1.6).toFixed(1) + 'px ' + (-rotateX * 1.6).toFixed(1) + 'px 28px -10px rgba(200,135,74,0.28)';
        });
      }

      function resetTilt() {
        if (rafId) cancelAnimationFrame(rafId);
        card.classList.remove('is-tilting');
        card.style.transform = '';
        card.style.boxShadow = '';
      }

      card.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'touch') return;
        card.classList.add('is-tilting');
      });
      card.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;
        applyTilt(event.clientX, event.clientY);
      });
      card.addEventListener('pointerleave', function (event) {
        if (event.pointerType === 'touch') return;
        resetTilt();
      });
      card.addEventListener('blur', resetTilt);
    });
  }

  /* ---------------------------------------------------------------------
   * Hero parallax — the decorative hero-texture layer drifts at a
   * different speed than the page scroll (no background-attachment:fixed,
   * just a translateY recalculated in a requestAnimationFrame loop).
   * ------------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var heroTexture = document.querySelector('.hero-texture');

    if (heroTexture) {
      var PARALLAX_FACTOR = 0.12;
      var PARALLAX_MAX = 60; // px — matches the -60px/-60px overscan in CSS
      var parallaxTicking = false;

      var updateParallax = function () {
        var offset = Math.min(window.scrollY * PARALLAX_FACTOR, PARALLAX_MAX);
        heroTexture.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
        parallaxTicking = false;
      };

      var onParallaxScroll = function () {
        if (!parallaxTicking) {
          parallaxTicking = true;
          requestAnimationFrame(updateParallax);
        }
      };

      window.addEventListener('scroll', onParallaxScroll, { passive: true });
      updateParallax();
    }
  }
})();
