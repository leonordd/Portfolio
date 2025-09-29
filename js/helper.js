// === helpers de idioma ===
function getLocaleFromUrl() {
  const p = new URLSearchParams(location.search);
  const q = (p.get('lang') || '').toLowerCase();
  return q === 'en' || q === 'pt' ? q : null;
}

function getLocale() {
  // prioridade: URL > localStorage > 'pt'
  return getLocaleFromUrl() || localStorage.getItem('locale') || 'pt';
}

function setLocale(lang) {
  localStorage.setItem('locale', lang);
  document.documentElement.lang = lang;
}

function setUrlLang(lang) {
  const u = new URL(location.href);
  u.searchParams.set('lang', lang);
  history.replaceState({}, '', u.toString());
}

//para aplicar as traduções em tudo
function applyTranslations(locale) {
  const dict = translations[locale] || {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
}


function preserveLangOnLinks(lang) {
  const anchors = document.querySelectorAll('a[href]');
  const origin = location.origin;
  anchors.forEach(a => {
    try {
      const url = new URL(a.getAttribute('href'), origin);
      if (url.origin !== origin) return;                 // externo
      if (['mailto:', 'tel:'].includes(url.protocol)) return;
      url.searchParams.set('lang', lang);
      a.setAttribute('href', url.pathname + url.search + url.hash);
    } catch (_) {}
  });
}


