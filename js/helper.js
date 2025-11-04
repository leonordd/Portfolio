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
  const base = document.baseURI; // respeita <base href="/Portfolio/">

  anchors.forEach(a => {
    const href = a.getAttribute('href');
    // Ignora externos/anchors/mailto/tel
    if (!href || href.startsWith('http') || href.startsWith('mailto:')
        || href.startsWith('tel:') || href.startsWith('#')) return;

    // Resolve relativo à <base>
    const url = new URL(href, base);

    // Garante ?lang
    url.searchParams.set('lang', lang);

    // Escreve de volta SEM perder /Portfolio/
    a.setAttribute('href', url.pathname + url.search + url.hash);
  });
}




