function imgHeight(){
    let img = document.querySelector('.img');
    let imgHeight = img.offsetWidth;
    img.style.height = imgHeight + 'px';
}

let body = document.querySelector('body');

function changeBg(){
    document.querySelector('body').style.background = 'black';
}

function defaultBg(){
    document.querySelector('body').style.background = 'none';
}

window.onload = imgHeight;
window.onresize = imgHeight;
window.onorientationchange = imgHeight;