/**
 * CNG Wine & Spirits - Main JavaScript
 * Mobile menu toggle, FAQ accordion, and shared behavior.
 * No frameworks; vanilla JS.
 */

(function () {
  'use strict';

  /* ==========================================================================
     Mobile menu toggle
     ========================================================================== */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileNav = document.getElementById('mobile-nav');
    var body = document.body;

    if (!hamburger || !mobileNav) return;

    function openMenu() {
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('is-open');
      body.classList.add('menu-open');
    }

    function closeMenu() {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      body.classList.remove('menu-open');
    }

    function toggleMenu() {
      var isOpen = mobileNav.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      toggleMenu();
    });

    // Close when clicking a link inside mobile nav (for same-page navigation)
    mobileNav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link && link.getAttribute('href') && link.getAttribute('href')[0] !== '#') {
        closeMenu();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Optional: close on resize to desktop (avoids stuck state)
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768 && mobileNav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Ensure aria attributes for accessibility
    hamburger.setAttribute('aria-controls', 'mobile-nav');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
  }

  /* ==========================================================================
     FAQ accordion
     ========================================================================== */
  function initFaqAccordion() {
    var faqList = document.getElementById('faq-list');
    if (!faqList) return;

    var items = faqList.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var header = item.querySelector('.faq-item__header');
      var content = item.querySelector('.faq-item__content');
      if (!header || !content) return;

      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', content.id || null);
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', header.id || null);

      header.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Close all others (single open at a time)
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            var otherHeader = other.querySelector('.faq-item__header');
            var otherContent = other.querySelector('.faq-item__content');
            if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
            if (otherContent) otherContent.style.maxHeight = '';
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          header.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '';
        } else {
          item.classList.add('is-open');
          header.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });

    // Set maxHeight on open items (e.g. if one is open by default in HTML)
    items.forEach(function (item) {
      var content = item.querySelector('.faq-item__content');
      if (item.classList.contains('is-open') && content) {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  }

  /* ==========================================================================
     Run on DOM ready
     ========================================================================== */
  function init() {
    initMobileMenu();
    initFaqAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ==========================================================================
   Email subscription pop-up (localStorage/sessionStorage)
   ========================================================================== */
(function() {
  var visitCount = parseInt(localStorage.getItem('pageVisitCount') || '0', 10);
  visitCount++;
  localStorage.setItem('pageVisitCount', visitCount);

  var hasSession = sessionStorage.getItem('popupSessionId');
  var lastShown = localStorage.getItem('emailPopupShown');
  var fiveMinutes = 5 * 60 * 1000;
  var now = Date.now();
  var isNewSession = !hasSession;
  var hasEnoughVisits = visitCount >= 5;
  var neverShown = !lastShown;
  var cooldownExpired = lastShown && (now - parseInt(lastShown, 10)) >= fiveMinutes;
  var shouldShow = isNewSession || hasEnoughVisits || neverShown || cooldownExpired;

  if (shouldShow) {
    setTimeout(function() {
      showEmailPopup();
    }, 3000);
  }

  function showEmailPopup() {
    localStorage.setItem('pageVisitCount', '0');
    sessionStorage.setItem('popupSessionId', 'active');
    var overlay = document.getElementById('email-popup-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeEmailPopup() {
    var overlay = document.getElementById('email-popup-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
    localStorage.setItem('emailPopupShown', Date.now().toString());
  }

  document.addEventListener('DOMContentLoaded', function() {
    var closeBtn = document.getElementById('popup-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeEmailPopup);
    }
    var overlay = document.getElementById('email-popup-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeEmailPopup();
        }
      });
    }
    var form = document.getElementById('popup-subscribe-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var emailInput = document.getElementById('popup-email-input');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email || email.indexOf('@') === -1) {
          alert('Please enter a valid email address.');
          return;
        }
        var submitBtn = document.getElementById('popup-submit-btn');
        if (submitBtn) submitBtn.disabled = true;
        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        })
          .then(function(r) {
            if (r.ok) {
              var formArea = document.getElementById('popup-form-area');
              var successArea = document.getElementById('popup-success-area');
              if (formArea) formArea.style.display = 'none';
              if (successArea) successArea.style.display = 'block';
              setTimeout(closeEmailPopup, 2500);
            } else {
              alert('Something went wrong. Please try again later.');
            }
          })
          .catch(function() {
            alert('Something went wrong. Please try again later.');
          })
          .finally(function() {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }
  });
})();
