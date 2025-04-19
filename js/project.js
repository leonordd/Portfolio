//API HOMEPAGE
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');
//console.log(projectId);

const PROJECTS_URL = `https://api.cosmicjs.com/v3/buckets/portfolio/objects/${projectId}?read_key=830isr5EuSuUw0n4N6RjNCuW1Bn9S4YRyjNTJiBn34HdXeURBQ&depth=1&props=slug%2Ctitle%2Cmetadata%2Cid%2Ctype&sort=-order`;
console.log(PROJECTS_URL);

//let projectsData;

async function fetchApi(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`error loading search results: ${response.status}`)
        }
        const data = await response.json()
        return data.object;
    } catch (error) {
        console.error('Fetching error:', error);
        throw error;
    }
}

function displayProject(data) {
    console.log(data);

    //let title = data.title;
    //let text = data.metadata.content;
    //let tags =  data.metadata.tags;

    let title = document.getElementById('project_title');
    let text = document.getElementById('project_text');
    //console.log(text);
    
    if (data.title !== null) {
        title.innerText = data.title;
    } 
    
    if (data.metadata.content !== null) {
        const rawText = data.metadata.content;
        const lines = rawText.split('\n');
    
        // Cria HTML a partir do conteúdo
        const html = lines.map(line => {
            if (line.startsWith('##')) {
                return `<h2>${line.replace(/^##\s*/, '')}</h2>`;
            } else if (line.trim() !== '') {
                return `<p>${line}</p>`;
            } else {
                return ''; // para ignorar linhas em branco
            }
        }).join('');
    
        text.innerHTML = html;
    }
    
    if(data.metadata.tags!== null){  //Se as tags existirem então
        const tagsContainer = document.getElementById('tags_container')
        const list = document.createElement('ul')

        data.metadata.tags.forEach(tag => {
            const item = document.createElement('li');
            item.textContent = tag.metadata.name;
            //item.style.backgroundColor = tags_back;
            //item.style.color = tags_text;
            list.appendChild(item)
        });

        tagsContainer.appendChild(list);
    } 

    if(data.metadata.people_envolved !== null){
        console.log(data.metadata.people_envolved);

        const authorsContainer = document.getElementById('author_names')
        const list_names = document.createElement('ul')

        data.metadata.people_envolved.forEach(person => {
            const item = document.createElement('li');
            item.textContent = person.metadata.first_last_name;
            //item.style.backgroundColor = tags_back;
            //item.style.color = tags_text;
            list_names.appendChild(item)
        });

        authorsContainer.appendChild(list_names);
    }

    if(data.metadata.live_url !== null){
        const footer = document.getElementById('footer')

        //external link
        const external_link = document.createElement('a');
        external_link.id = 'external_link';
        external_link.href = data.metadata.live_url; 
        external_link.target = "_blank";
        external_link.classList.add("tooltip");

        //img
        const imagem = document.createElement('img')
        imagem.alt = 'external website link';
        imagem.src = 'data/icons/external_link.svg';
        imagem.width = '23.41';
        imagem.height = '23.41';

        //tooltip text
        const tooltiptext = document.createElement('span');
        tooltiptext.classList.add("tooltiptext");
        tooltiptext.innerText = "Website Link"

        footer.appendChild(external_link);
        external_link.appendChild(imagem);
        external_link.appendChild(tooltiptext);
    }

    let index = 0;
    let project_number = index + 1;
    
    //let link =  document.createElement('a');
    let projectImages = document.getElementById('project_images');
    let img_projects = document.createElement('img');
    img_projects.id = 'image';

    if (data.metadata.carroussel && data.metadata.carroussel.length > 0) {
        img_projects.setAttribute('src', data.metadata.carroussel[0].url);
    
        img_projects.onmouseover = function() {
            if (!intervalId) { // evita múltiplos intervalos
                startCarousel(data.metadata.carroussel, img_projects);
            }
        }
    
        img_projects.onmouseout = function() {
            stopCarousel(); // para
        }
    }

    //projectImages.appendChild(link);
    projectImages.appendChild(img_projects);

}

(async () => {
    try {
        let projectsData = await fetchApi(PROJECTS_URL);
        //console.log(projectsData);
        displayProject(projectsData);
    } catch (error) {
        console.error('Fetching error:', error);
        throw error;
    }
})();
