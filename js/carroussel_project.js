let time = 1000;
let intervalId;
let box_change = document.querySelector('.box');
let img_projects = document.getElementById('image');
let h1 = document.querySelector("h1");
let navegacao = document.querySelector("nav");
let carouselIndex = 0; // adicionamos isso

function startCarousel(imgArray, imgElement) {
  carouselIndex = 0; // reset no índice ao começar

  function changeImage() {
    if (imgArray[carouselIndex] && imgArray[carouselIndex].url) {
      imgElement.setAttribute('src', imgArray[carouselIndex].url);
    }

    carouselIndex = (carouselIndex + 1) % imgArray.length;
  }

  changeImage();
  intervalId = setInterval(changeImage, time);
  box_change.classList.add("show");
}

function stopCarousel() {
  clearInterval(intervalId);
  intervalId = null; // limpa o ID
}
