(() => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  function getSavedTheme() {
    try { return localStorage.getItem('theme'); } catch { return null; }
  }
  function saveTheme(val) {
    try { localStorage.setItem('theme', val); } catch {}
  }
  function applyTheme(mode) {
    if (mode === 'auto') {
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', mode);
    }
    const isDark = root.getAttribute('data-theme') === 'dark';
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.setAttribute('aria-pressed', String(isDark));
  }
  const saved = getSavedTheme();
  applyTheme(saved || 'auto');

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
    });
  }

  // Mobile nav
  const menuBtn = document.getElementById('menuToggle');
  const navList = document.getElementById('navList');
  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      const open = navList.getAttribute('data-open') === 'true';
      navList.setAttribute('data-open', String(!open));
      menuBtn.setAttribute('aria-expanded', String(!open));
    });
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navList.setAttribute('data-open', 'false');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // Reveal on scroll
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        ent.target.classList.add('in');
        observer.unobserve(ent.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }) : null;

  if (observer) document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  else document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in'));

  // Copy to clipboard for chips with data-copy
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    return Promise.resolve();
  }
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      await copyText(text);
      const old = btn.innerHTML;
      btn.innerHTML = '✔ Disalin';
      setTimeout(() => { btn.innerHTML = old; }, 1200);
    });
  });

  // Contact form -> mailto
  const form = document.getElementById('contactForm');
  if (form) {
    const nameEl = form.querySelector('#f-name');
    const emailEl = form.querySelector('#f-email');
    const msgEl = form.querySelector('#f-message');

    function setError(el, message) {
      const small = el.parentElement.querySelector('.error');
      if (small) small.textContent = message || '';
      el.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    function validate() {
      let ok = true;
      if (!nameEl.value || nameEl.value.trim().length < 2) {
        setError(nameEl, 'Minimal 2 karakter.');
        ok = false;
      } else setError(nameEl, '');

      if (!emailEl.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        setError(emailEl, 'Masukkan email yang valid.');
        ok = false;
      } else setError(emailEl, '');

      if (!msgEl.value || msgEl.value.trim().length < 10) {
        setError(msgEl, 'Minimal 10 karakter.');
        ok = false;
      } else setError(msgEl, '');

      return ok;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;
      const to = (document.querySelector('[data-copy]')?.getAttribute('data-copy')) || 'emailkamu@contoh.com';
      const subject = encodeURIComponent('Pesan dari ' + nameEl.value.trim());
      const body = encodeURIComponent(
        msgEl.value.trim() +
        '\n\n—\nNama: ' + nameEl.value.trim() +
        '\nEmail: ' + emailEl.value.trim() +
        '\nDikirim dari situs portofolio'
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      form.reset();
    });

    ['input', 'blur'].forEach(evt => form.addEventListener(evt, () => validate(), true));
  }

  // Footer year
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  // Back to top
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    if (window.scrollY > 500) toTop.classList.add('show');
    else toTop.classList.remove('show');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
