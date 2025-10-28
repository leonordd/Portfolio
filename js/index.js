//API HOMEPAGE (INDEX)
const BUCKET = 'portfolio';
const READ_KEY = '830isr5EuSuUw0n4N6RjNCuW1Bn9S4YRyjNTJiBn34HdXeURBQ';

let currentLocale = getLocale();
setLocale(currentLocale);
setUrlLang(currentLocale); // garante que a URL da home tem ?lang=...
// garante que a própria página tem ?lang=
preserveLangOnLinks(currentLocale); // faz com que todos os <a> internos levem ?lang=


function buildQuery(q) {
  return encodeURIComponent(JSON.stringify(q));
}

// normaliza o valor do metadata.locale para "pt" | "en"
function normLocale(metaLocale) {
  if (metaLocale == null) return '';
  // string simples
  if (typeof metaLocale === 'string') return metaLocale.trim().toLowerCase();
  // objeto com .value (ex.: select do Cosmic)
  if (typeof metaLocale === 'object' && 'value' in metaLocale) {
    return String(metaLocale.value).trim().toLowerCase();
  }
  // array (ex.: multi-select)
  if (Array.isArray(metaLocale)) {
    // tenta encontrar "pt" ou "en" em qualquer item (string ou obj.value)
    for (const it of metaLocale) {
      const v = typeof it === 'string' ? it : ('value' in (it||{}) ? it.value : '');
      const n = String(v).trim().toLowerCase();
      if (n === 'pt' || n === 'en') return n;
    }
  }
  // fallback genérico
  return String(metaLocale).trim().toLowerCase();
}


// index.js — SUBSTITUI apenas esta função
async function fetchApiList(locale) {
  const base =
    `https://api.cosmicjs.com/v3/buckets/${BUCKET}/objects` + `?pretty=true&query=%7B%22type%22:%22works%22%7D&limit=10&skip=0&`+
    `?read_key=${READ_KEY}&depth=1&sort=-modified_at&props=slug,title,metadata,type,`;

    //`?read_key=${READ_KEY}&depth=1&props=slug,title,metadata,id,type&sort=-order`;

  // 1) query aninhada (preferida)
  const qNested = encodeURIComponent(JSON.stringify({
    type: "works",
    status: "published",
    metadata: { locale }
  }));

  // 2) fallback dot-notation
  const qDot = encodeURIComponent(JSON.stringify({
    type: "works",
    status: "published",
    "metadata.locale": locale
  }));

  // tenta nested
  let res = await fetch(`${base}&query=${qNested}`);
  let ok = res.ok;
  let data = ok ? await res.json() : { objects: [] };

  // fallback se necessário
  if (!ok || !Array.isArray(data.objects)) {
    res = await fetch(`${base}&query=${qDot}`);
    ok = res.ok;
    data = ok ? await res.json() : { objects: [] };
  }

  const list = Array.isArray(data.objects) ? data.objects : [];

  return list.filter(o => normLocale(o?.metadata?.locale) === locale);

}

/*function displayProjects(data) {
  let container = document.querySelector("#container");
  container.innerHTML = '';

  data.forEach((project, index) => {
    let img_projects = document.createElement('img');
    let link =  document.createElement('a');
    link.classList.add('imgs', 'img-wrapper');
    link.id = 'img' + (index + 1);

    // >>> mantém a língua actual na navegação
    const u = new URL('project.html', location.origin);
    u.searchParams.set('lang', currentLocale);
    u.searchParams.set('id', project.id);
    link.href = u.toString();

    img_projects.src = project.metadata.cover_image.url;

    // carrossel (mantém a tua lógica)
    if (project.metadata.carroussel) {
      img_projects.onmouseover = function(){
        startCarousel(project.metadata.carroussel, project.title, link);
      };
      img_projects.onmouseout = function(){
        stopCarousel(link);
      };
    }

    link.appendChild(img_projects);
    container.appendChild(link);
  });
}*/

function displayProjects(data) {
  const container = document.querySelector("#container");
  container.innerHTML = '';

  // Pré-carregamento (cache na memória por projeto)
  const carouselCache = new Map();

  // Preload no viewport
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const link = e.target;
        const project = link.__projectData;
        if (project?.metadata?.carroussel && !carouselCache.has(project.id)) {
          // cria Image() para cada URL e faz decode antecipado
          const loaders = project.metadata.carroussel.map(({ url }) => {
            const im = new Image();
            im.decoding = 'async';
            im.fetchPriority = 'low';
            im.src = url;
            return im.decode().catch(() => {}); // ignora falhas pontuais
          });
          Promise.allSettled(loaders).then(() => {
            carouselCache.set(project.id, true);
          });
        }
        io.unobserve(link);
      }
    }
  }, { rootMargin: '200px' });

  data.forEach((project, index) => {
    const img_projects = document.createElement('img');
    const link = document.createElement('a');
    const base = document.baseURI; // respeita <base href="/Portfolio/">
    link.classList.add('imgs', 'img-wrapper');
    link.id = 'img' + (index + 1);

    const u = new URL('html/project.html', base);
    u.searchParams.set('lang', getLocale());
    u.searchParams.set('id', project.id);
    link.href = u.toString();

    // Covers mais eficientes
    img_projects.src = project.metadata.cover_image.url;
    img_projects.loading = 'lazy';
    img_projects.decoding = 'async';
    // prioridade alta só para os primeiros acima da dobra
    img_projects.fetchPriority = index < 4 ? 'high' : 'low';
    // se souberes a largura/altura, define:
    // img_projects.width = 800; img_projects.height = 600;

    // Guarda dados do projeto no link para o IO
    link.__projectData = project;
    io.observe(link);

    // Carrossel on hover (mantém a tua lógica, só acrescentamos atraso anti-“flicker”)
    let hoverTimer;
    if (project.metadata.carroussel) {
      img_projects.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          startCarousel(project.metadata.carroussel, project.metadata.project_name, link);
        }, 120); // pequeno atraso evita hovers acidentais
      });
      img_projects.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        stopCarousel(link);
      });
    }

    link.appendChild(img_projects);
    container.appendChild(link);
  });
}


// —— Botões PT / ENG na home ——
const btnPT = document.getElementById('lang_pt');
const btnEN = document.getElementById('lang_en');

if (btnPT) btnPT.onclick = async () => {
  currentLocale = 'pt';
  setLocale(currentLocale);
  setUrlLang(currentLocale);
  applyTranslations(currentLocale);  
  displayProjects(await fetchApiList(currentLocale));
};
if (btnEN) btnEN.onclick = async () => {
  currentLocale = 'en';
  setLocale(currentLocale);
  setUrlLang(currentLocale);
  applyTranslations(currentLocale);  
  displayProjects(await fetchApiList(currentLocale));
};

// init
(async () => {
  const list = await fetchApiList(currentLocale);
  displayProjects(list);
})();


