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
})();
