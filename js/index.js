//API HOMEPAGE (INDEX)
const BUCKET = 'portfolio';
const READ_KEY = '830isr5EuSuUw0n4N6RjNCuW1Bn9S4YRyjNTJiBn34HdXeURBQ';

let currentLocale = getLocale();
setLocale(currentLocale);
setUrlLang(currentLocale);
preserveLangOnLinks(currentLocale);

// Cache global para imagens pré-carregadas
const imageCache = new Map();

function buildQuery(q) {
  return encodeURIComponent(JSON.stringify(q));
}

function normLocale(metaLocale) {
  if (metaLocale == null) return '';
  if (typeof metaLocale === 'string') return metaLocale.trim().toLowerCase();
  if (typeof metaLocale === 'object' && 'value' in metaLocale) {
    return String(metaLocale.value).trim().toLowerCase();
  }
  if (Array.isArray(metaLocale)) {
    for (const it of metaLocale) {
      const v = typeof it === 'string' ? it : ('value' in (it||{}) ? it.value : '');
      const n = String(v).trim().toLowerCase();
      if (n === 'pt' || n === 'en') return n;
    }
  }
  return String(metaLocale).trim().toLowerCase();
}

async function fetchApiList(locale) {
  const base =
    `https://api.cosmicjs.com/v3/buckets/${BUCKET}/objects` +
    `?read_key=${READ_KEY}&depth=1&sort=-modified_at&props=slug,title,metadata,id,type,`;

  const qNested = encodeURIComponent(JSON.stringify({
    type: "works",
    status: "published",
    metadata: { locale }
  }));

  const qDot = encodeURIComponent(JSON.stringify({
    type: "works",
    status: "published",
    "metadata.locale": locale
  }));

  let res = await fetch(`${base}&query=${qNested}`);
  let ok = res.ok;
  let data = ok ? await res.json() : { objects: [] };

  if (!ok || !Array.isArray(data.objects)) {
    res = await fetch(`${base}&query=${qDot}`);
    ok = res.ok;
    data = ok ? await res.json() : { objects: [] };
  }

  const list = Array.isArray(data.objects) ? data.objects : [];
  return list.filter(o => normLocale(o?.metadata?.locale) === locale);
}

// Função para pré-carregar imagens do carrossel
function preloadCarouselImages(carroussel, projectId) {
  if (!carroussel || imageCache.has(projectId)) {
    return Promise.resolve();
  }

  const promises = carroussel.map(({ url }) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(url); // Continua mesmo com erro
      img.src = url;
    });
  });

  return Promise.all(promises).then(() => {
    imageCache.set(projectId, true);
  });
}

// Pré-carregamento em lote com priorização
async function batchPreloadImages(projects) {
  // Prioridade 1: Primeiros 3 projetos (acima da dobra)
  const priority1 = projects.slice(0, 3);
  await Promise.all(
    priority1.map(p => 
      p.metadata?.carroussel ? preloadCarouselImages(p.metadata.carroussel, p.id) : Promise.resolve()
    )
  );

  // Prioridade 2: Projetos 4-6 (com pequeno delay)
  setTimeout(() => {
    const priority2 = projects.slice(3, 6);
    Promise.all(
      priority2.map(p => 
        p.metadata?.carroussel ? preloadCarouselImages(p.metadata.carroussel, p.id) : Promise.resolve()
      )
    );
  }, 300);

  // Prioridade 3: Restantes projetos (lazy)
  setTimeout(() => {
    const priority3 = projects.slice(6);
    Promise.all(
      priority3.map(p => 
        p.metadata?.carroussel ? preloadCarouselImages(p.metadata.carroussel, p.id) : Promise.resolve()
      )
    );
  }, 1000);
}

function displayProjects(data) {
  const container = document.querySelector("#container");
  container.innerHTML = '';

  const visibleProjects = data.filter(p => p.metadata?.index_page === true);

  // Inicia o pré-carregamento imediatamente
  batchPreloadImages(visibleProjects);

  // Intersection Observer para carregar covers lazy
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const project = img.__projectData;
        
        // Pré-carrega o carrossel quando a imagem entra no viewport
        if (project?.metadata?.carroussel && !imageCache.has(project.id)) {
          preloadCarouselImages(project.metadata.carroussel, project.id);
        }
        
        io.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });

  visibleProjects.forEach((project, index) => {
    const img_projects = document.createElement('img');
    const link = document.createElement('a');
    link.classList.add('imgs', 'img-wrapper');
    link.id = 'img' + (index + 1);

    const base = document.baseURI;
    const u = new URL('html/project.html', base);
    u.searchParams.set('lang', getLocale());
    u.searchParams.set('id', project.id);
    link.href = u.pathname + u.search + u.hash;

    img_projects.src = project.metadata.cover_image.url;
    img_projects.loading = index < 3 ? 'eager' : 'lazy';
    img_projects.decoding = 'async';
    img_projects.fetchPriority = index < 3 ? 'high' : 'auto';

    // Guarda referência do projeto
    img_projects.__projectData = project;
    
    // Observa a imagem para lazy loading inteligente
    if (index >= 3) {
      io.observe(img_projects);
    }

    // Carrossel on hover - agora instantâneo!
    let hoverTimer;
    if (project.metadata.carroussel) {
      img_projects.addEventListener('mouseenter', () => {
        // Remove delay se imagens já estão carregadas
        const delay = imageCache.has(project.id) ? 0 : 80;
        hoverTimer = setTimeout(() => {
          startCarousel(project.metadata.carroussel, project.metadata.project_name, link);
        }, delay);
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

// Botões PT / ENG
const btnPT = document.getElementById('lang_pt');
const btnEN = document.getElementById('lang_en');

if (btnPT) btnPT.onclick = async () => {
  currentLocale = 'pt';
  setLocale(currentLocale);
  setUrlLang(currentLocale);
  applyTranslations(currentLocale);
  imageCache.clear(); // Limpa cache ao trocar idioma
  displayProjects(await fetchApiList(currentLocale));
};

if (btnEN) btnEN.onclick = async () => {
  currentLocale = 'en';
  setLocale(currentLocale);
  setUrlLang(currentLocale);
  applyTranslations(currentLocale);
  imageCache.clear();
  displayProjects(await fetchApiList(currentLocale));
};

// Inicialização
(async () => {
  const list = await fetchApiList(currentLocale);
  displayProjects(list);
})();