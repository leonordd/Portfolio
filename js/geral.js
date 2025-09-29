// site.js — corre em todas as páginas
// Requer: helper.js (e opcionalmente translations.js)

(function () {
  // 1) descobrir e fixar idioma
  let currentLocale = getLocale();
  setLocale(currentLocale);
  setUrlLang(currentLocale);

  // 2) opcional: traduzir textos marcados com data-i18n
  if (typeof translations !== 'undefined') {
    applyTranslations(currentLocale);
  }

  // 3) propagar ?lang= para todos os links internos
  if (typeof preserveLangOnLinks === 'function') {
    preserveLangOnLinks(currentLocale);
  }

  // 4) ligar botões PT/EN se existirem na página
  const btnPT = document.getElementById('lang_pt');
  const btnEN = document.getElementById('lang_en');
  const onSwitch = (to) => {
    currentLocale = to;
    setLocale(currentLocale);
    setUrlLang(currentLocale);
    if (typeof translations !== 'undefined') applyTranslations(currentLocale);
    if (typeof preserveLangOnLinks === 'function') preserveLangOnLinks(currentLocale);

    // Dispara um evento para scripts da página reagirem (ex.: refetch na index)
    document.dispatchEvent(new CustomEvent('lang:changed', { detail: { locale: currentLocale } }));
  };
  if (btnPT) btnPT.addEventListener('click', () => onSwitch('pt'));
  if (btnEN) btnEN.addEventListener('click', () => onSwitch('en'));
})();
