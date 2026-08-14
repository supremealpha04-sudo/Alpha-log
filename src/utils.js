// ============================================
// UTILITIES
// ============================================
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function readingTime(text) {
  if (!text) return '1 min read';
  const words = text.split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return mins + ' min read';
}

export function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

export function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
  }
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
}

export function initScrollHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

export function trackFloatNav() {
  const sections = ['home', 'work', 'writings', 'sponsors', 'contact'];
  const floatBtns = document.querySelectorAll('.float-btn');
  window.addEventListener('scroll', () => {
    let current = 'home';
    sections.forEach(sec => {
      const el = document.getElementById(sec);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 200) current = sec;
      }
    });
    floatBtns.forEach(btn => {
      const href = btn.getAttribute('href');
      if (href) btn.classList.toggle('active', href === '#' + current);
    });
  });
}
