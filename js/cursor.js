var cursor = document.getElementById('cursor');

document.addEventListener('mousemove', moveCursor)

function moveCursor(e) {
  var x = e.clientX;
  var y = e.clientY;
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
}