const PROJECTS_URL = "https://api.cosmicjs.com/v3/buckets/portfolio-production-c90144d0-937e-11ee-bad3-c399e8060022/objects?pretty=true&query=%7B%22type%22:%22works%22%7D&limit=10&skip=0&read_key=830isr5EuSuUw0n4N6RjNCuW1Bn9S4YRyjNTJiBn34HdXeURBQ&depth=1&props=slug,title,metadata,type,";
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
        link.href = `project.html?id=${index}` //cria uma página em que o projeto é igual ao index
        img_projects.setAttribute('src', project.metadata.cover_image.url); // Definir a imagem


        if(project.metadata.carroussel == null){
            console.log("Não há imagens disponível para este projeto")
        }else{
            img_projects.onmouseover = function(){
                 //verifica o número do projeto hovered 
                console.log(project.metadata.carroussel);
    
                //inicializa o carroussel
                startCarousel(project.metadata.carroussel, project.title);
    
                //startCarousel(project_number);
            }

            img_projects.onmouseout = function(){
                console.log("fora da imagem")
                stopCarousel();
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
