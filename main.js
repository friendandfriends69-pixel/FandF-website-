/* =========================================================
   Friend&Friends — interactions
   Nav toggle, scroll reveals, tilt cards, animated counters,
   process timeline fill, QC stamp flip, contact form.
   ========================================================= */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Mobile nav ---------------- */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    mainNav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => mainNav.classList.remove('open'))
    );
  }

  /* ---------------- Active nav link on scroll ---------------- */
  const sections = ['home', 'catalogue', 'qc', 'process', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------------- Tilt cards ---------------- */
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /* ---------------- Animated stat counters ---------------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------------- Process timeline fill ---------------- */
  const timelineFill = document.getElementById('timeline-fill');
  const timelineSection = document.querySelector('.process-section');
  if (timelineFill && timelineSection) {
    const updateFill = () => {
      const rect = timelineSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.4;
      const scrolled = vh * 0.8 - rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / total));
      timelineFill.style.width = `${pct * 100}%`;
    };
    window.addEventListener('scroll', updateFill, { passive: true });
    updateFill();
  }

  /* ---------------- QC stamp flip on scroll into view ---------------- */
  const qcStamp = document.getElementById('qc-stamp');
  if (qcStamp) {
    const qcObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const spin = () => qcStamp.classList.toggle('flip');
            spin();
            qcStamp.dataset.timer = setInterval(spin, 3200);
          } else if (qcStamp.dataset.timer) {
            clearInterval(qcStamp.dataset.timer);
          }
        });
      },
      { threshold: 0.4 }
    );
    qcObserver.observe(qcStamp);
  }

  /* ---------------- Contact form ---------------- */
  const form = document.getElementById('requirement-form');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullname = form.fullname.value.trim();
      const phone = form.phone.value.trim();
      const requirement = form.requirement.value.trim();

      if (!fullname || !phone || !requirement) {
        showToast('Please fill in all required fields.');
        return;
      }

      // NOTE: no backend is wired up yet — replace this block with a real
      // fetch() call to your API, form service, or CRM webhook.
      console.log('Requirement submitted:', {
        fullname,
        phone,
        requirement,
        quantity: form.quantity.value.trim()
      });

      showToast("Requirement submitted! We'll reach out within 24 hours.");
      form.reset();
    });
  }

  /* ---------------- Smooth-scroll offset for sticky header ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.site-header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
})();
