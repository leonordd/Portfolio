//API HOMEPAGE
const BUCKET = 'portfolio';
const READ_KEY = '830isr5EuSuUw0n4N6RjNCuW1Bn9S4YRyjNTJiBn34HdXeURBQ';

const PROJECTS_URL = "https://api.cosmicjs.com/v3/buckets/portfolio/objects?pretty=true&query=%7B%22type%22:%22works%22%7D&limit=10&skip=0&read_key=830isr5EuSuUw0n4N6RjNCuW1Bn9S4YRyjNTJiBn34HdXeURBQ&depth=1&sort=-modified_at&props=slug,title,metadata,id,type,";
let projectsData

async function fetchApi(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`error loading search results: ${response.status}`)
        }
        const data = await response.json()
        return data.objects;
    } catch (error) {
        console.error('Fetching error:', error);
        throw error;
    }
}

function displayProjects(data) {
    // Seleciona a div que contém os projetos
    let container = document.querySelector("#container");

    data.forEach((project, index) => {
        let img_projects = document.createElement('img');
        let link =  document.createElement('a');

        link.classList.add('imgs', 'img-wrapper');

        let project_number = index + 1;
        //console.log(project_number); // Exibir o índice no console

        link.setAttribute('id', 'img' + project_number); // Definir o índice como ID
        //link.href = `project.html?id=${project.id}` //cria uma página em que o projeto é igual ao index

        const base = document.baseURI;               // respeita <base href="/Portfolio/">
        const u = new URL('html/project.html', base);
        u.searchParams.set('lang', getLocale());     // mantém a língua atual
        u.searchParams.set('id', project.id);
        link.href = u.pathname + u.search + u.hash;

        img_projects.setAttribute('src', project.metadata.cover_image.url); // Definir a imagem

        if(project.metadata.carroussel == null){
            console.log("Não há imagens disponível para este projeto")
        }else{
            img_projects.onmouseover = function(){
                 //verifica o número do projeto hovered 
                //console.log(project.metadata.carroussel);
    
                //inicializa o carroussel
                startCarousel(project.metadata.carroussel, project.metadata.project_name, link);
            }

            img_projects.onmouseout = function(){
                //console.log("fora da imagem")
                stopCarousel(link);
            }
        }
        container.appendChild(link);
        link.appendChild(img_projects);
    });
}



(async () => {
    try {

        projectsData = await fetchApi(PROJECTS_URL);
        /*displayCategories(categoriesData, moviesData, projectsData)
        displayProjects(projectsData);
        handleSearchEngine()
        navBar();*/

        displayProjects(projectsData);
    } catch (error) {
        console.error('Fetching error:', error);
        throw error;
    }
})();
