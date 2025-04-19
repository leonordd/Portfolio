let time = 1000;

let intervalId;
let box_change = document.querySelector('.box');
let h1 = document.querySelector("h1");
let navegacao = document.querySelector("nav");
//let cursor = document.getElementById("cursor")
let imgID;

function startCarousel(imgArray, title, imgProjects) {
  let index = 0;

  // Função para mudar a imagem
  function changeImage() {
    // Verificar se a imagem existe no array, e então usar o campo correto para exibir a imagem
    let imageUrl = imgArray[index].url;  // Ou use `imgArray[index].url` se preferir outra URL

    // Atualizar o fundo da caixa
    box_change.style.backgroundImage = `url('${imageUrl}')`;

    // Avançar para a próxima imagem
    index = (index + 1) % imgArray.length;
  }

  // Iniciar o carrossel
  changeImage();  // Para mostrar a primeira imagem
  intervalId = setInterval(changeImage, time);  // Para alternar as imagens a cada intervalo de tempo

  // Mostrar a caixa de imagem
  box_change.classList.add("show");

  h1.innerText = title;
  
  // Garantir que a caixa de imagem tenha o z-index correto
  box_change.style.zIndex = "8";
  navegacao.style.zIndex = "80";
  imgProjects.style.zIndex = "10";

  cursor.classList.add('square');
  
  // Alterar a cor do título
  /*h1.style.color = "#FFFF00";*/
}

function stopCarousel(imgProjects) {
  // Parar o carrossel
  clearInterval(intervalId);
  
  // Remover a imagem de fundo
  document.querySelector('.box').style.backgroundImage = 'none';

  // Ocultar a caixa de imagem
  box_change.classList.remove("show");
  box_change.style.zIndex = "-10";

  // Resetar o texto do título
  h1.innerText = "Leonor Diniz";
  h1.style.color = "#FFFFFF";
  imgProjects.style.zIndex = "1";

  cursor.classList.remove('square');
}
