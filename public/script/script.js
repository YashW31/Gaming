function toggle(){
    var blur = document.getElementById('blur');
    blur.classList.toggle('active');
    var login = document.getElementById('login');
    login.classList.toggle('active')
}   

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

function landing() {
  window.location = "./";
}

window.addEventListener("scroll", function(){
    var top = document.querySelector(".top");
    top.classList.toggle("sticky", window.scrollY > 0);

    var header = document.querySelector(".sticky-header");
    header.classList.toggle("sticky", window.scrollY > 0);
})