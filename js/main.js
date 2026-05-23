/* ==============================================
   WEALTHSPRING PROPERTIES
   Main JavaScript — Site-wide Logic
   ============================================== */

'use strict';

/* -----------------------------------------------
   WHATSAPP CONFIG
   All WhatsApp buttons on the site use this.
   To change the number, update WA_NUMBER only.
----------------------------------------------- */
const WA_NUMBER = '2347068086845';

const WA_MESSAGES = {
  general:     'Hello WealthSpring Properties! I came across your website and would love to learn more about your land properties. Please assist me.',
  enquiry:     'Hello WealthSpring Properties! I am interested in one of your listed properties and would like more details. Could someone assist me?',
  inspection:  'Hello WealthSpring Properties! I would like to schedule a property inspection. Please let me know the next steps.',
  springai:    'Hello WealthSpring Properties! I was chatting with SpringAI on your website and need further assistance from your team.',
  faq:         'Hello WealthSpring Properties! I have a question that was not covered in your FAQ section. Could you please help me?',
};

function openWhatsApp(type) {
  const message = WA_MESSAGES[type] || WA_MESSAGES.general;
  const url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* Attach to every element with data-wa attribute */
document.addEventListener('click', function (e) {
  const target = e.target.closest('[data-wa]');
  if (target) {
    e.preventDefault();
    openWhatsApp(target.getAttribute('data-wa') || 'general');
  }
});


/* -----------------------------------------------
   NAVBAR
----------------------------------------------- */
var navbar     = document.getElementById('navbar');
var hamburger  = document.getElementById('hamburger');
var navDrawer  = document.getElementById('nav-drawer');

/* Scrolled state */
if (navbar) {
  window.addEventListener('scroll', function () {
    if (window.scrollY > 24) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* Hamburger toggle */
if (hamburger && navDrawer) {
  hamburger.addEventListener('click', function () {
    var isOpen = hamburger.classList.toggle('open');
    navDrawer.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close drawer when a link is tapped */
  navDrawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navDrawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close on outside tap */
  document.addEventListener('click', function (e) {
    if (
      navDrawer.classList.contains('open') &&
      !navDrawer.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.classList.remove('open');
      navDrawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}


/* -----------------------------------------------
   HERO VIDEO CROSSFADE
   Looks for .hero-video elements.
   If none exist, the placeholder gradient stays.
   Videos fade out 3 seconds before ending.
----------------------------------------------- */
(function initHeroVideos() {
  var videos     = Array.from(document.querySelectorAll('.hero-video'));
  var indicators = Array.from(document.querySelectorAll('.hero-indicator'));

  if (videos.length === 0) return;

  var current          = 0;
  var slideTimer       = null;
  var fadeTimer        = null;
  var VIDEO_DURATIONS  = [15, 15, 15, 15, 15];
  var FADE_OUT_OFFSET  = 3;

  function clearSlideTimers() {
    clearTimeout(slideTimer);
    clearTimeout(fadeTimer);
  }

  function showSlide(index) {
    clearSlideTimers();

    /* Hide all */
    videos.forEach(function (v, i) {
      v.classList.remove('active', 'ending');
      if (i !== index) { v.pause(); }
    });

    /* Reset indicators */
    indicators.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
      var fill = dot.querySelector('.hero-indicator-fill');
      if (fill) { fill.style.animation = 'none'; }
    });

    /* Show current */
    videos[index].classList.add('active');
    videos[index].currentTime = 0;
    videos[index].play().catch(function () {
      /* Autoplay blocked — video will show as poster */
    });

    /* Re-trigger indicator animation */
    if (indicators[index]) {
      indicators[index].classList.add('active');
      var fill = indicators[index].querySelector('.hero-indicator-fill');
      if (fill) {
        var duration = VIDEO_DURATIONS[index] || 8;
        fill.style.setProperty('--indicator-duration', duration + 's');
        /* Force reflow then re-enable animation */
        void fill.offsetWidth;
        fill.style.animation = '';
      }
    }

    current = index;

    var durationMs = (VIDEO_DURATIONS[index] || 8) * 1000;
    fadeTimer = setTimeout(function () {
      videos[index].classList.add('ending');
    }, Math.max(durationMs - FADE_OUT_OFFSET * 1000, 0));

    slideTimer = setTimeout(function () {
      videos[index].classList.remove('ending');
      nextSlide();
    }, durationMs);
  }

  function nextSlide() {
    var next = (current + 1) % videos.length;
    showSlide(next);
  }

  videos.forEach(function (v, index) {
    v.addEventListener('ended', function () {
      if (current === index) {
        clearSlideTimers();
        v.classList.remove('ending');
        nextSlide();
      }
    });
  });

  /* Indicator click */
  indicators.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  /* Kick off */
  showSlide(0);
})();


/* -----------------------------------------------
   SCROLL ANIMATIONS
----------------------------------------------- */
(function initScrollAnimations() {
  var elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold:   0.1,
    rootMargin: '0px 0px -36px 0px',
  });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* -----------------------------------------------
   FAQ ACCORDION
----------------------------------------------- */
document.querySelectorAll('.faq-item').forEach(function (item) {
  var question = item.querySelector('.faq-question');
  if (!question) return;

  question.addEventListener('click', function () {
    var isOpen = item.classList.contains('open');

    /* Close all open items */
    document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
      openItem.classList.remove('open');
      var q = openItem.querySelector('.faq-question');
      if (q) { q.setAttribute('aria-expanded', 'false'); }
    });

    /* Open clicked item if it was closed */
    if (!isOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });

  /* Keyboard support */
  question.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      question.click();
    }
  });
});


/* -----------------------------------------------
   PROPERTY MODAL
   Property data lives here as an object.
   When the backend is ready, replace this with
   a fetch() call to /api/listings.
----------------------------------------------- */
var PROPERTY_DATA = {
  'site-alpha': {
    name:     'The Cove',
    location: 'Katampe Extension, FCT Abuja',
    badge:    'Available',
    badgeDark: false,
    description: 'A premium residential land development within Katampe, one of Abuja\'s most flourishing communities. Fully surveyed with Certificate of Occupancy and Government Allocation. The estate features tarred access roads, drainage channels, and perimeter fencing. Ideal for immediate building or long-term investment.',
    sqms: [
      { size: '300 SQM',   price: '₦29,000,000' },
      { size: '500 SQM',   price: '₦43,000,000' },
      { size: '1,000 SQM', price: '₦68,000,000' },
    ],
  },
  'site-beta': {
    name:     'WealthCourt',
    location: 'Phase II, Kuje, FCT Abuja',
    badge:    'Hot Deal',
    badgeDark: true,
    description: 'Serviced plots in the fast-growing Kuje axis of Abuja. Road infrastructure and drainage are in place. All plots carry verified documentation and are ready for immediate allocation. Excellent value for money in one of Abuja\'s expanding residential corridors.',
    sqms: [
      { size: '200 SQM', price: '₦2,000,000' },
      { size: '250 SQM', price: '₦2,500,000' },
      { size: '350 SQM', price: '₦4,000,000' },
      { size: '450 SQM', price: '₦5,000,000' },
      { size: '550 SQM', price: '₦6,000,000' },
      { size: '1,000 SQM', price: '₦10,500,000' },
    ],
  },
  'site-gamma': {
    name:     'Estora Residence',
    location: 'Maitama II, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Located in the Maitama II district of Abuja, Estora Residence offers prime residential plots with clean titles and immediate allocation. The estate features tarred roads, drainage, and perimeter fencing. With its strategic location and verified documentation, Estora Residence is an excellent choice for homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '250 SQM', price: '₦10,000,000'  },
      { size: '450 SQM', price: '₦15,000,000' },
      { size: '500 SQM', price: '₦20,000,000' },
      { size: '1,000 SQM', price: '₦40,000,000' },
    ],
  },

  'havilahs-court': {
    name:     'Havilahs Court',
    location: 'Army post Housing Estate, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Havilahs Court offers clean-title plots with immediate transfer and no encumbrances. A sound investment in one of Abuja\'s most active growth corridors.',
    sqms: [
      { size: '250 SQM', price: '₦15,000,000'  },
      { size: '500 SQM', price: '₦30,000,000' },
      { size: '750 SQM', price: '₦40,000,000' },
      { size: '1,000 SQM', price: '₦75,000,000' },
    ],
  },

  'suncrest-estate': {
    name:     'SunCrest Estate',
    location: 'Kurudu, Phase 1, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'SunCrest Estate is in the rapidly developing Kurudu area of Abuja. The estate features well-laid-out plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, SunCrest offers an excellent opportunity for both homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '150 SQM', price: '₦2,200,000'  },
      { size: '250 SQM', price: '₦3,300,000' },
      { size: '300 SQM', price: '₦3,900,000' },
      { size: '350 SQM', price: '₦5,000,000' },
    ],
  },

  'hutu-polo': {
    name:     'Hutu Polo Golf Resort',
    location: 'Before Cetenary road, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Hutu Polo Golf Resort is a prestigious land development located along the Cetenary Road corridor in Abuja. The estate offers spacious plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, Hutu Polo Golf Resort presents an excellent opportunity for both homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '150 SQM', price: '₦9,300,000'  },
      { size: '250 SQM', price: '₦15,300,000' },
      { size: '350 SQM', price: '₦21,700,000' },
      { size: '500 SQM', price: '₦31,100,000' },
      { size: '1,000 SQM', price: '₦62,200,000' },
    ],
  },

  'upper-heaven': {
    name:     'Upper Heaven',
    location: 'Sheretti-Kabusa, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Upper Heaven is an exclusive land development located in the serene Sheretti-Kabusa area of Abuja. The estate offers spacious plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, Upper Heaven presents an excellent opportunity for both homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '250 SQM', price: '₦10,000,000'  },
      { size: '300 SQM', price: '₦12,000,000' },
      { size: '450 SQM', price: '₦18,000,000' },
      { size: '600 SQM', price: '₦24,000,000' },
    ],
  },

  'stabug-golf': {
    name:     'Stabug Golf Resort',
    location: 'Army post Housing Estate, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Stabug Golf Resort is a prestigious land development located 5 min from Green house resort by civil defence, Karshi, in Abuja. The estate offers spacious plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, Stabug Golf Resort presents an excellent opportunity for both homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '250 SQM', price: '₦2,500,000'  },
      { size: '300 SQM', price: '₦3,000,000' },
      { size: '400 SQM', price: '₦4,000,000' },
      { size: '500 SQM', price: '₦5,000,000' },
      { size: '1,000 SQM', price: '₦10,000,000' },
    ],
  },

  'signature-estate': {
    name:     'Signature Estate',
    location: 'Ojo, Lagos',
    badge:    'New',
    badgeDark: true,
    description: 'Signature Estate is a prestigious land development located in Ojo, Lagos. The estate offers spacious plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, Signature Estate presents an excellent opportunity for both homeowners and investors looking to capitalize on Lagos\'s growth.',
    sqms: [
      { size: '250 SQM', price: '₦25,000,000'  },
      { size: '350 SQM', price: '₦35,000,000' },
      { size: '500 SQM', price: '₦50,000,000' },
    ],
  },

  'comfort-villa': {
    name:     'Comfort Villa',
    location: 'Lugbe, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Comfort Villa is an exclusive land development located in the serene Lugbe area of Abuja. The estate offers spacious plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, Comfort Villa presents an excellent opportunity for both homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '250 SQM', price: '₦16,000,000'  },
      { size: '300 SQM', price: '₦20,000,000' },
      { size: '400 SQM', price: '₦26,000,000' },
    ],
  },

  'ridge-city': {
    name:     'Ridge City',
    location: 'Guzape 2, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Ridge City is a prestigious land development located in the upscale Guzape 2 area of Abuja. The estate offers spacious plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, Ridge City presents an excellent opportunity for both homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '200 SQM', price: '₦27,500,000'  },
      { size: '250 SQM', price: '₦30,000,000' },
      { size: '400 SQM', price: '₦40,000,000' },
      { size: '450 SQM', price: '₦45,000,000' },
      { size: '600 SQM', price: '₦55,000,000' },
      { size: '1,000 SQM', price: '₦85,000,000' },
    ],
  },

  'homesphere': {
    name:     'Homesphere',
    location: 'Karsana South, FCT Abuja',
    badge:    'New',
    badgeDark: true,
    description: 'Homesphere is one of the most prestigious land developments located in Karsana South, Abuja. The estate offers spacious plots with access to tarred roads, drainage, and perimeter fencing. With verified documentation and immediate allocation, Homesphere presents an excellent opportunity for both homeowners and investors looking to capitalize on Abuja\'s growth.',
    sqms: [
      { size: '270 SQM', price: '₦18,000,000'  },
      { size: '350 SQM', price: '₦25,000,000' },
      { size: '400 SQM', price: '₦30,000,000' },
      { size: '1,000 SQM', price: '₦65,000,000' },
    ],
  },
};

var modalOverlay = document.getElementById('modal-overlay');
var modalBox     = document.getElementById('modal-content');

function buildModalHTML(property) {
  var sqmRows = property.sqms.map(function (s) {
    return (
      '<div class="modal-sqm-row">' +
        '<span class="modal-sqm-size">' + s.size + '</span>' +
        '<span class="modal-sqm-price">' + s.price + '</span>' +
      '</div>'
    );
  }).join('');

  var badgeClass = property.badgeDark ? ' property-badge-dark' : '';

  return (
    '<div class="modal-handle"></div>' +
    '<button class="modal-close" id="modal-close" aria-label="Close">&times;</button>' +

    /* Image placeholder — replace with <img> when photos are ready */
    '<div class="modal-prop-img-placeholder img-placeholder">' +
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">' +
        '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
        '<circle cx="8.5" cy="8.5" r="1.5"/>' +
        '<polyline points="21 15 16 10 5 21"/>' +
      '</svg>' +
      '<span>Property photo coming soon</span>' +
    '</div>' +

    '<div class="modal-prop-badge-row">' +
      '<span class="property-badge' + badgeClass + '">' + property.badge + '</span>' +
    '</div>' +

    '<h2 class="modal-prop-name">' + property.name + '</h2>' +
    '<p class="modal-prop-location">' + property.location + '</p>' +
    '<p class="modal-prop-desc">' + property.description + '</p>' +

    '<p class="modal-sqm-label">Available Plots and Pricing</p>' +
    '<div class="modal-sqm-list">' + sqmRows + '</div>' +

    '<div class="modal-prop-actions">' +
      '<button class="btn btn-whatsapp btn-full" data-wa="enquiry">' +
        '<svg class="wa-icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.524 5.855L.057 23.243a.75.75 0 00.916.916l5.388-1.467A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.98 0-3.852-.538-5.464-1.48l-.39-.23-4.04 1.1 1.1-4.04-.23-.39A10.448 10.448 0 011.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5z"/></svg>' +
        'Enquire on WhatsApp' +
      '</button>' +
      '<a href="properties.html" class="btn btn-outline-black btn-full">View All Details</a>' +
    '</div>'
  );
}

function openModal(propertyId) {
  var property = PROPERTY_DATA[propertyId];
  if (!property || !modalOverlay || !modalBox) return;

  modalBox.innerHTML = buildModalHTML(property);
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  /* Bind close button rendered inside modal */
  var closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* Open on card click */
document.querySelectorAll('[data-property]').forEach(function (card) {
  card.addEventListener('click', function () {
    openModal(card.getAttribute('data-property'));
  });
  /* Keyboard */
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card.getAttribute('data-property'));
    }
  });
});

/* Close on overlay backdrop click */
if (modalOverlay) {
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) { closeModal(); }
  });
}

/* Close on Escape key */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeModal(); }
});


/* -----------------------------------------------
   CONTACT FORM
   Simulates submission now.
   Replace the setTimeout with a real fetch() call
   to your FastAPI /api/contact endpoint later.
----------------------------------------------- */
var contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var submitBtn  = contactForm.querySelector('[type="submit"]');
    var originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled    = true;

    // Collect form data
    var formData = new FormData(contactForm);
    var firstName = formData.get('first_name') || '';
    var lastName = formData.get('last_name') || '';
    var email = formData.get('email') || '';
    var phone = formData.get('phone') || '';
    var interest = formData.get('interest') || '';
    var message = formData.get('message') || '';

    // Build email body
    var body = 'Name: ' + firstName + ' ' + lastName + '\n' +
               'Email: ' + email + '\n' +
               'Phone: ' + phone + '\n' +
               'Interest: ' + interest + '\n' +
               'Message: ' + message;

    // Build mailto URL
    var subject = 'Contact Form Submission from ' + firstName + ' ' + lastName;
    var mailtoUrl = 'mailto:wealthspringproperties@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    // Open email client
    window.location.href = mailtoUrl;

    // Reset form after a short delay
    setTimeout(function () {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      contactForm.reset();
    }, 1000);
  });
}


/* -----------------------------------------------
   SMOOTH SCROLL for in-page anchor links
----------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var href   = anchor.getAttribute('href');
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    var navH   = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
    ) || 70;

    var top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});