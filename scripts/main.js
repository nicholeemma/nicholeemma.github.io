$(document).ready(function() {
  AOS.init({
    once: true,
    disable: function() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  });
});

(function() {
  var navToggle = document.querySelector('.site-nav-toggle');
  var navigation = document.getElementById('navigation');
  var backdrop = document.querySelector('.site-nav-backdrop');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.navbar-nav .nav-link'));
  var mobileNavigation = window.matchMedia('(max-width: 991px)');

  if (!navToggle || !navigation || !backdrop) {
    return;
  }

  function isOpen() {
    return navigation.classList.contains('is-open');
  }

  function syncNavigationState(open) {
    navigation.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    navToggle.classList.toggle('is-open', open);
    navToggle.classList.toggle('toggled', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('site-nav-open', open);

    if (mobileNavigation.matches) {
      navigation.setAttribute('aria-hidden', String(!open));
    } else {
      navigation.removeAttribute('aria-hidden');
    }
  }

  function closeNavigation(restoreFocus) {
    if (!isOpen()) {
      return;
    }
    syncNavigationState(false);
    if (restoreFocus) {
      navToggle.focus();
    }
  }

  navToggle.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    var open = !isOpen();
    syncNavigationState(open);
    if (open && navLinks.length) {
      navLinks[0].focus();
    }
  });

  backdrop.addEventListener('click', function() {
    closeNavigation(true);
  });

  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      closeNavigation(false);
    });
  });

  document.addEventListener('keydown', function(event) {
    if (!isOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      closeNavigation(true);
      return;
    }

    if (event.key === 'Tab') {
      var focusable = [navToggle].concat(navLinks);
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  function handleViewportChange(event) {
    if (!event.matches) {
      syncNavigationState(false);
    } else {
      navigation.setAttribute('aria-hidden', String(!isOpen()));
    }
  }

  if (mobileNavigation.addEventListener) {
    mobileNavigation.addEventListener('change', handleViewportChange);
  } else {
    mobileNavigation.addListener(handleViewportChange);
  }

  document.querySelectorAll('a.smooth-scroll[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(event) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) {
        return;
      }

      event.preventDefault();
      if (target.tagName === 'DETAILS') {
        target.open = true;
      }
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
      window.history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  var sections = navLinks.map(function(link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);
  var activeFrame;

  function updateActiveNavigation() {
    var marker = window.innerHeight * 0.32;
    var activeSection = sections[0];

    sections.forEach(function(section) {
      if (section.getBoundingClientRect().top <= marker) {
        activeSection = section;
      }
    });

    navLinks.forEach(function(link) {
      var active = activeSection && link.getAttribute('href') === '#' + activeSection.id;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function scheduleActiveNavigationUpdate() {
    window.cancelAnimationFrame(activeFrame);
    activeFrame = window.requestAnimationFrame(updateActiveNavigation);
  }

  window.addEventListener('scroll', scheduleActiveNavigationUpdate, { passive: true });
  window.addEventListener('resize', scheduleActiveNavigationUpdate);
  updateActiveNavigation();

  syncNavigationState(false);
})();
