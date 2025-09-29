// translations.js
const translations = {
  pt: {
    projetos: "PROJETOS",
    sobre:    "SOBRE",
    contactos:    "CONTACTOS",
    fotografia: "Fotografia",
    violoncelista: "Violoncelista",
     observadora: "Observadora",
     frase_contactos: "Adorova conhecê-lo(a) :)",
      contacte_me: "CONTACTE-ME!",
  },
  en: {
    projetos: "PROJECTS",
    sobre:    "ABOUT",
    contactos:    "CONTACTS",
    fotografia: "Photography",
    violoncelista: "Cellist",
    observadora: "Observer",
    frase_contactos:"I'd love to meet you :)",
    contacte_me: "CONTACT ME!",
  }
};

function applyTranslations(locale) {
  const dict = translations[locale] || {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
}